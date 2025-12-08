# Job System Guide

## Overview

Asynchronous job processing system for long-running LLM generation tasks. Jobs are submitted via REST API, processed in background goroutines, and polled by the frontend for status updates.

**Key capabilities:**
- Non-blocking generation (30s-2min tasks)
- Persistent state via Redis (survives service restarts)
- Real-time progress tracking with simulated incremental updates
- Error handling with detailed failure messages
- Auto-expiration (24hr TTL)

**Why this exists:** LLM generation blocks for 30+ seconds. Without async processing, HTTP requests timeout and users can't navigate away. Job system decouples request/response from actual processing.

---

## Flow

1. **Frontend submits job** → POST /jobs with type + payload
2. **Go service creates job** → Stores in Redis, starts goroutine for processing
3. **Executor calls Python gRPC service** → Blocking LLM generation (30s)
4. **Progress simulation** → Background goroutine increments progress while LLM runs
5. **Frontend polls status** → GET /jobs/{id} every 3s until completion
6. **Job completes** → Frontend receives result, stops polling

---

## Current Job Types

| Job Type | What It Does | Time |
|----------|-------------|------|
| `generate_characters` | Creates 3 characters | ~30s |
| `generate_factions` | Creates 3 factions | ~30s |
| `generate_settings` | Creates 3 settings | ~30s |
| `generate_events` | Creates 3 events | ~30s |
| `generate_relics` | Creates 3 relics | ~30s |
| `create_world` | Generates full story + saves world | ~2min |

---

## Job Lifecycle

State transitions:
```
pending → processing → completed | failed
   0%      20-90%         100%      0-100%
```

**States:**
- **pending** - Job created, goroutine not yet started (typically <100ms)
- **processing** - Goroutine executing, calling Python gRPC service
- **completed** - LLM generation finished, result stored in job.result
- **failed** - Error occurred (timeout, gRPC failure, validation error)

**TTL:** Jobs expire after 24 hours (Redis automatic cleanup).

---

## Architecture

```
┌─────────────┐                    ┌──────────────┐                    ┌────────────────┐
│   Frontend  │ ─── Submit Job ──► │  Go Service  │ ─── gRPC Call ───► │ Python Service │
│  (React)    │ ◄── Poll Status ─── │  (Goroutine) │ ◄── gRPC Resp ──── │   (LLM/AI)     │
└─────────────┘                    └──────────────┘                    └────────────────┘
                                           │
                                           ▼
                                    ┌────────────┐
                                    │   Redis    │  (job state storage)
                                    └────────────┘
```

**Components:**
1. **Frontend (React Query)** - Submits jobs, polls status every 3s using `useJobPolling` hook
2. **Go Service** - REST API for job submission, spawns goroutines for execution
3. **Job Executor** - Calls Python gRPC service, updates Redis with progress
4. **Python Service** - LLM generation (OpenAI API calls)
5. **Redis** - Job state persistence with 24hr TTL

**Data flow:**
- Frontend → POST /jobs → Go creates job in Redis (status: pending)
- Go spawns goroutine → calls Python gRPC service (blocks for 30s)
- Progress goroutine → increments job.progress in Redis every 0.5s (20% → 79%)
- Frontend → GET /jobs/{id} → reads updated state from Redis
- LLM completes → Go updates job to completed with result
- Frontend detects completion → stops polling, displays result

---

## Frontend API

### Primary Hook: `useJobPolling`

Combines job submission + polling + completion callbacks in one hook.

```typescript
import { useJobPolling } from "@/lib/queries/jobs";

const { submit, job, isPolling, isCompleted, isFailed } = useJobPolling(
  (result) => {
    // Success callback - result contains generated data
    setGeneratedData(result);
  },
  (error) => {
    // Error callback - error is string message
    setError(error);
  }
);

// Submit job
await submit({
  type: "generate_characters",
  payload: { theme: "fantasy", count: 3 }
});

// job contains: { id, type, status, progress, message, result, error }
// isPolling = true while status is "pending" or "processing"
// isCompleted = true when status is "completed"
// isFailed = true when status is "failed"
```

**When to use:** 90% of cases - you need to submit a job and wait for completion.

### Lower-Level Hooks

**`useSubmitJob()`** - Submits job, returns job object. Use when you want manual control over polling.

**`useJobStatus(jobId)`** - Polls existing job by ID. Use when you already have a job ID from elsewhere.

### Progress Display

```tsx
import JobProgressSpinner from "@/components/jobs/JobProgressSpinner";

<JobProgressSpinner
  job={job}              // Job from useJobPolling
  showProgress={true}    // Show progress bar (0-100%)
  showMessage={true}     // Show status message
/>
```

Renders: animated spinner, progress bar, status message, error (if failed).

---

## Backend Structure

```
go-service/internal/jobs/
├── types.go      → Job types, statuses, data structures
├── store.go      → Redis operations (save/load jobs)
├── manager.go    → Job creation and lifecycle
└── executor.go   → Actual execution (calls AI, updates progress)
```

**Key files:**
- `types.go`: Defines what a job looks like
- `store.go`: Saves jobs to Redis with 24hr expiration
- `manager.go`: Creates jobs, starts them in goroutines
- `executor.go`: Does the work (calls Python AI service)

---

## API Endpoints

### Create Job

**Request:**
```http
POST /jobs
Content-Type: application/json

{
  "type": "generate_characters",
  "payload": {
    "theme": "fantasy",
    "count": 3
  }
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "generate_characters",
  "status": "pending",
  "progress": 0,
  "message": "Preparing your request...",
  "created_at": "2025-01-10T12:00:00Z"
}
```

### Get Job Status

**Request:**
```http
GET /jobs/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "generate_characters",
  "status": "processing",
  "progress": 67,
  "message": "Generating characters...",
  "result": null
}
```

**When completed:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "generate_characters",
  "status": "completed",
  "progress": 100,
  "message": "Job completed successfully",
  "result": [
    { "name": "Aragorn", "description": "...", ... },
    { "name": "Gandalf", "description": "...", ... },
    { "name": "Frodo", "description": "...", ... }
  ],
  "completed_at": "2025-01-10T12:00:32Z"
}
```

---

## Error Handling

### Failure Points

| Error Type | Response | Job Status | Recovery |
|-----------|----------|-----------|----------|
| Invalid payload (missing fields) | 400 Bad Request | N/A - job not created | Fix request, resubmit |
| gRPC service timeout (>90s) | Job transitions to "failed" | `status: "failed"` | Retry - check Python service logs |
| LLM generation error | Job transitions to "failed" | `status: "failed", error: "..."` | Retry or adjust payload |
| Database save error (world creation) | Job transitions to "failed" | `status: "failed"` | Check DB connection, retry |

### Frontend Error Handling

```typescript
const { submit, job, isFailed } = useJobPolling(
  (result) => handleSuccess(result),
  (error) => setError(error)
);

// isFailed = true when job.status === "failed"
// job.error contains error message from backend
if (isFailed) {
  return (
    <div>
      <p>Error: {job?.error}</p>
      <button onClick={() => submit({...})}>Retry</button>
    </div>
  );
}
```

**Polling behavior:** Stops automatically when job reaches "completed" or "failed" state.

---

## Progress Updates

### Implementation

Progress updates are **artificial/time-based** - we cannot track actual LLM progress, so we estimate based on expected duration.

**Manual checkpoints:**
```go
0%   - Job created (pending)
20%  - "Generating characters..." (before gRPC call)
79%  - Last simulated update (during gRPC call)
90%  - "Finalizing characters..." (after gRPC call completes)
100% - "Job completed successfully"
```

**Simulated progress (20% → 79%):**

While the blocking gRPC call executes (typically 30s), a background goroutine increments progress:

```go
func simulateProgress(ctx, jobID, startProgress=20, endProgress=80, duration=30s, done chan) {
    steps := 80 - 20 = 60
    stepDuration := 30s / 60 = 500ms

    ticker := time.NewTicker(500ms)
    for {
        select {
        case <-done:  // LLM completed, stop
            return
        case <-ticker.C:
            currentProgress++
            if currentProgress >= endProgress {  // stops at 79, not 80
                return
            }
            redis.Update(jobID, progress: currentProgress)
        }
    }
}
```

**Result:** Progress increments every 0.5s from 20% → 21% → ... → 79%. When LLM completes, goroutine stops, executor updates to 90%.

**Why artificial?** OpenAI API provides no progress feedback during generation. Simulated progress provides better UX than a static "20%" for 30 seconds, even though it's not real progress.

---

## Adding New Job Types

**Backend:**

1. Define constant in `jobs/types.go`:
```go
const JobTypeGenerateQuests JobType = "generate_quests"
```

2. Implement handler in `jobs/executor.go`:
```go
func (e *GRPCExecutor) generateQuests(ctx context.Context, job *Job) (interface{}, error) {
    e.store.Update(ctx, job.ID, JobUpdate{Progress: 20, Message: "Generating quests..."})

    done := make(chan bool)
    go e.simulateProgress(ctx, job.ID, 20, 80, 30*time.Second, done)

    resp, err := e.loreClient.GenerateQuests(ctx, &lorepb.QuestsRequest{...})
    close(done)

    if err != nil {
        return nil, err
    }

    e.store.Update(ctx, job.ID, JobUpdate{Progress: 90, Message: "Finalizing..."})
    return transformResponse(resp), nil
}
```

3. Add route in `executor.go` Execute method:
```go
case JobTypeGenerateQuests:
    result, err = e.generateQuests(ctx, job)
```

**Frontend:**

```typescript
const { submit, job } = useJobPolling(onSuccess, onError);
await submit({
  type: "generate_quests",
  payload: { theme: "fantasy", difficulty: "hard" }
});
```

Job storage, polling, and progress infrastructure works automatically.

---

## Troubleshooting

| Symptom | Diagnosis | Resolution |
|---------|-----------|-----------|
| Job stuck at 20% | gRPC call blocked or Python service unresponsive | Check Python service logs: `docker logs loresmith-python-service`. Will timeout after 90s. |
| Job not found (404) | Job expired (24hr TTL) or invalid ID | Verify job ID. If expired, submit new job. |
| Progress not updating in UI | Frontend polling failure or Redis down | Check browser console for errors. Verify Redis: `docker ps \| grep redis`. Check network tab for GET /jobs/{id} requests. |
| Job failed immediately | Validation error (missing payload fields) | Check Go service logs for error details. Common: missing user_id for world creation. |
| Job status never updates | Goroutine panic or executor crash | Check Go service logs for panic stack trace. Redis connection may be lost. |

**Debugging commands:**
```bash
# View job in Redis
docker exec -it loresmith-redis redis-cli
GET "job:{job-id}"

# Service logs
docker logs loresmith-go-service
docker logs loresmith-python-service
docker logs -f loresmith-go-service  # follow live
```

---

## Performance & Scaling

**Current architecture:**
- Jobs execute in-memory via goroutines (no external queue)
- Single Go service instance handles all jobs
- Concurrency limited by goroutine overhead + Python gRPC service capacity
- Redis stores ephemeral state (24hr TTL), not persistent history

**Capacity:** Handles ~50 concurrent jobs without issues (Go can spawn thousands of goroutines).

**Scaling approach (if needed):**
1. Add message queue (RabbitMQ/Redis Queue) - decouple job submission from execution
2. Horizontal scaling - multiple Go worker instances consuming from queue
3. Persistent job history - PostgreSQL table for completed jobs (audit/analytics)
4. Retry logic - automatic retries with exponential backoff for transient failures

**Current bottleneck:** Python gRPC service (LLM API calls). Scaling workers won't help if Python service is saturated.

---

## Testing

### Manual API Test

```bash
# 1. Submit job
curl -X POST http://localhost:8080/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "generate_characters",
    "payload": { "theme": "fantasy", "count": 3 }
  }'

# Response: {"id": "...", "status": "pending", ...}

# 2. Poll status (repeat every 3s)
curl http://localhost:8080/jobs/{job-id}

# 3. Watch progress: 0% → 20% → 21% → ... → 79% → 90% → 100%
```

### Automated Tests

```bash
# Backend
cd go-service && go test ./internal/jobs/...

# Frontend
cd frontend && npm test -- jobs
```

---

## Summary

**System characteristics:**
- Async job processing for 30s-2min LLM generation tasks
- Goroutine-based execution, Redis state storage (24hr TTL)
- Frontend polls every 3s, progress simulated every 0.5s (artificial/time-based)
- Error handling with automatic polling stop on failure
- Scales to ~50 concurrent jobs per Go instance

**Key points:**
- Progress is artificial (time-based estimation, not real LLM progress)
- Jobs expire after 24 hours
- Always implement retry logic in frontend for failed jobs
- Bottleneck is Python gRPC service (LLM API), not job system itself
