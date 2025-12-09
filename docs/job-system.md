# Job System Guide

## Overview

Asynchronous job processing system for long-running LLM generation tasks. Jobs are submitted via REST API, processed in background goroutines, and polled by the frontend for status updates.

**Key capabilities:**

- Non-blocking generation (30s-2min tasks)
- Persistent state via Redis (survives service restarts)
- Real-time progress tracking via gRPC streaming from Python LLM service
- Error handling with detailed failure messages
- Auto-expiration (24hr TTL)

**Why this exists:** LLM generation blocks for 30+ seconds. Without async processing, HTTP requests timeout and users can't navigate away. Job system decouples request/response from actual processing.

---

## Flow

1. **Frontend submits job** → POST /jobs with type + payload
2. **Go service creates job** → Stores in Redis, starts goroutine for processing
3. **Executor calls Python gRPC streaming service** → LLM generation with progress yields
4. **Python streams progress** → Yields progress updates after each generation step
5. **Go updates Redis** → Each stream message updates job progress in Redis
6. **Frontend polls status** → GET /jobs/{id} every 3s, sees real-time progress
7. **Job completes** → Frontend receives result, stops polling

---

## Current Job Types

| Job Type              | What It Does                       | Time |
| --------------------- | ---------------------------------- | ---- |
| `generate_characters` | Creates 3 characters               | ~30s |
| `generate_factions`   | Creates 3 factions                 | ~30s |
| `generate_settings`   | Creates 3 settings                 | ~30s |
| `generate_events`     | Creates 3 events                   | ~30s |
| `generate_relics`     | Creates 3 relics                   | ~30s |
| `create_world`        | Generates full story + saves world | ~20  |

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
- Go spawns goroutine → calls Python gRPC streaming service
- Python yields progress updates → Go receives stream messages with real generation progress
- Go updates Redis → Each progress message updates job.progress and job.message
- Frontend → GET /jobs/{id} → reads updated state from Redis
- Python yields final result → Go updates job to completed with result
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
  payload: { theme: "fantasy", count: 3 },
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
  job={job} // Job from useJobPolling
  showProgress={true} // Show progress bar (0-100%)
  showMessage={true} // Show status message
/>;
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

| Error Type                           | Response                    | Job Status                       | Recovery                          |
| ------------------------------------ | --------------------------- | -------------------------------- | --------------------------------- |
| Invalid payload (missing fields)     | 400 Bad Request             | N/A - job not created            | Fix request, resubmit             |
| gRPC service timeout (>90s)          | Job transitions to "failed" | `status: "failed"`               | Retry - check Python service logs |
| LLM generation error                 | Job transitions to "failed" | `status: "failed", error: "..."` | Retry or adjust payload           |
| Database save error (world creation) | Job transitions to "failed" | `status: "failed"`               | Check DB connection, retry        |

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

Progress updates are **real-time streaming** - Python service yields progress after each actual LLM generation step via callback-based tracking.

**Progress flow (example: 3 characters):**

```
0%   - Job created (pending)
20%  - "Generating characters..." (stream started)
24%  - "Generated names..." (Python yields after name step completes)
28%  - "Generated appearances..." (Python yields after appearance step completes)
32%  - "Generated backstories..." (Python yields after backstory step completes)
// ... incremental progress per actual generation stage ...
88%  - "Generated stats..." (Python yields after final stage completes)
90%  - "Finalizing characters..." (Go receives final result from stream)
100% - "Job completed successfully"
```

**Generation stages per type:**
- **Characters**: 6 steps (name, appearance, backstory, traits, skills, stats)
- **Settings**: 6 steps (name, landscape, culture, history, economy, summary)
- **Factions**: 4 steps (name, ideology, appearance, summary)
- **Events**: 3 steps (name, description, impact)
- **Relics**: 3 steps (name, description, history)

**Callback-based tracking mechanism:**

Python generation functions accept a progress callback and invoke it after each LLM step:

```python
async def generate_character(theme: str, progress_callback=None) -> LorePiece:
    """Generate a character with real progress tracking."""
    total_steps = 6
    current_step = 0

    # Generate Name
    name = await generate_name(theme)
    current_step += 1
    if progress_callback:
        await progress_callback(current_step, total_steps, "Generated names...")

    # Generate Appearance
    appearance = await generate_appearance(theme, name)
    current_step += 1
    if progress_callback:
        await progress_callback(current_step, total_steps, "Generated appearances...")

    # ... (repeat for backstory, traits, skills, stats)
```

Multi-variant coordinator aggregates progress across parallel generations:

```python
async def generate_multiple_characters(count, theme, progress_callback=None):
    """Generate multiple characters in parallel with aggregated progress."""
    completed_steps = {"count": 0}
    total_steps = {"value": 0}

    async def item_progress_callback(step, item_total_steps, message):
        if total_steps["value"] == 0:
            total_steps["value"] = count * item_total_steps

        completed_steps["count"] += 1

        if progress_callback:
            progress = 20 + int((completed_steps["count"] / total_steps["value"]) * 70)
            await progress_callback(progress, message)

    # Generate all items in parallel with progress tracking
    items = await asyncio.gather(*(
        generate_character(theme, progress_callback=item_progress_callback)
        for _ in range(count)
    ))
    return items
```

gRPC servicer uses queue to bridge callbacks and streaming:

```python
async def GenerateCharacters(self, request, context):
    """Generate characters with streaming progress updates."""
    yield lore_pb2.CharactersStreamResponse(
        progress=lore_pb2.GenerationProgress(progress=20, message="Generating characters...")
    )

    # Create queue for progress updates
    progress_queue = asyncio.Queue()
    generation_complete = asyncio.Event()

    async def progress_callback(progress, message):
        await progress_queue.put((progress, message))

    # Start generation in background
    async def generate():
        try:
            return await generate_multiple_characters(
                request.count, request.theme, progress_callback=progress_callback
            )
        finally:
            generation_complete.set()

    generation_task = asyncio.create_task(generate())

    # Consume progress updates and yield them
    while not generation_complete.is_set() or not progress_queue.empty():
        try:
            progress, message = await asyncio.wait_for(progress_queue.get(), timeout=0.1)
            yield lore_pb2.CharactersStreamResponse(
                progress=lore_pb2.GenerationProgress(progress=progress, message=message)
            )
        except asyncio.TimeoutError:
            continue

    characters = await generation_task

    yield lore_pb2.CharactersStreamResponse(
        progress=lore_pb2.GenerationProgress(progress=90, message="Finalizing...")
    )

    grpc_pieces = [convert_to_grpc_lore_piece(piece) for piece in characters]
    yield lore_pb2.CharactersStreamResponse(
        final=lore_pb2.CharactersResponse(characters=grpc_pieces)
    )
```

Go service receives the stream and updates Redis:

```go
stream, err := e.loreClient.GenerateCharacters(ctx, &lorepb.CharactersRequest{...})

for {
    msg, err := stream.Recv()
    if err == io.EOF {
        break  // Stream completed
    }

    switch resp := msg.Response.(type) {
    case *lorepb.CharactersStreamResponse_Progress:
        // Update Redis with real progress from Python
        e.store.Update(ctx, job.ID, JobUpdate{
            Progress: int(resp.Progress.Progress),
            Message:  resp.Progress.Message,
        })
    case *lorepb.CharactersStreamResponse_Final:
        // Received final result
        finalResponse = resp.Final
    }
}
```

**Result:** Progress updates reflect actual LLM generation steps. Each generation stage (name, appearance, etc.) triggers real progress yields across all parallel items.

**Why callbacks + streaming?**
- **Callbacks**: Track real progress at the source (generation functions know when each LLM step completes)
- **Aggregation**: Multi-variant coordinator combines progress from parallel generations (e.g., 3 characters × 6 steps = 18 total steps)
- **Streaming**: Queue-based bridge converts callbacks to gRPC stream yields for real-time updates
- **Accurate feedback**: Shows actual stage names ("Generated landscapes..." for settings, "Generated ideologies..." for factions)

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
    e.store.Update(ctx, job.ID, JobUpdate{
        Progress: intPtr(20),
        Message:  "Generating quests...",
    })

    // Call streaming gRPC method
    stream, err := e.loreClient.GenerateQuests(ctx, &lorepb.QuestsRequest{...})
    if err != nil {
        return nil, fmt.Errorf("failed to generate quests - please try again")
    }

    // Receive progress updates and final result from stream
    var finalResponse *lorepb.QuestsResponse
    for {
        msg, err := stream.Recv()
        if err != nil {
            if err.Error() == "EOF" {
                break
            }
            return nil, fmt.Errorf("failed to generate quests - please try again")
        }

        switch resp := msg.Response.(type) {
        case *lorepb.QuestsStreamResponse_Progress:
            // Update job progress from Python's real generation progress
            e.store.Update(ctx, job.ID, JobUpdate{
                Progress: intPtr(int(resp.Progress.Progress)),
                Message:  resp.Progress.Message,
            })
        case *lorepb.QuestsStreamResponse_Final:
            // Received final result
            finalResponse = resp.Final
        }
    }

    if finalResponse == nil {
        return nil, fmt.Errorf("failed to generate quests - no result received")
    }

    e.store.Update(ctx, job.ID, JobUpdate{
        Progress: intPtr(90),
        Message:  "Finalizing quests...",
    })

    return transformResponse(finalResponse), nil
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
  payload: { theme: "fantasy", difficulty: "hard" },
});
```

Job storage, polling, and progress infrastructure works automatically.

---

## Troubleshooting

| Symptom                     | Diagnosis                                          | Resolution                                                                                                                |
| --------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Job stuck at 20%            | gRPC stream blocked or Python service unresponsive | Check Python service logs: `docker logs loresmith-python-service`. Will timeout after 2 minutes.                          |
| Job not found (404)         | Job expired (24hr TTL) or invalid ID               | Verify job ID. If expired, submit new job.                                                                                |
| Progress not updating in UI | Frontend polling failure or Redis down             | Check browser console for errors. Verify Redis: `docker ps \| grep redis`. Check network tab for GET /jobs/{id} requests. |
| Job failed immediately      | Validation error (missing payload fields)          | Check Go service logs for error details. Common: missing user_id for world creation.                                      |
| Job status never updates    | Goroutine panic or executor crash                  | Check Go service logs for panic stack trace. Redis connection may be lost.                                                |

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
- Real-time streaming progress from Python LLM service via gRPC
- Frontend polls every 3s to display updated progress
- Error handling with automatic polling stop on failure
- Scales to ~50 concurrent jobs per Go instance

**Key points:**

- Progress is real-time (callback-based tracking at generation source → queue → gRPC stream)
- Each generation type has specific stages (characters: 6 steps, settings: 6 steps, factions: 4 steps, events/relics: 3 steps)
- Parallel generation maintained for performance (3 characters generated simultaneously)
- Progress aggregates across all parallel items (e.g., 3 characters × 6 steps = 18 total steps tracked)
- Jobs expire after 24 hours
- Always implement retry logic in frontend for failed jobs
- Bottleneck is Python gRPC service (LLM API), not job system itself
