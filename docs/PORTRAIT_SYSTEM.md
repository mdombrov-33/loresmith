# Portrait Generation System

## The Problem

When users generate 3 character options, the old flow looked like this:
- Generate 3 characters (26 seconds)
- Generate 3 portraits (120 seconds)
- **Total wait: 146 seconds of staring at a loading screen**

That sucks. Users don't want to wait 2.5 minutes before seeing anything.

## The Solution

Now portraits generate in the background while the user is already looking at their characters:
- Generate 3 characters (26 seconds) → **User sees cards immediately**
- Portraits generate in background → **Pop in one by one as they finish**

## How It Works

### 1. Character Generation (Python Service)
When you enter generation flow in random mode:
```
User → Go → Python gRPC
Python generates 3 characters (names, traits, stats, backstory)
Each character gets a random UUID
Python publishes 3 jobs to RabbitMQ: "Hey, make portraits for these UUIDs"
Python returns characters to frontend (FAST - 26s instead of 146s)
```

### 2. Background Portrait Generation (RabbitMQ Worker)
While you're reading character cards:
```
Worker (running 24/7 in Python container):
  - Picks up job #1 from RabbitMQ
  - Generates portrait (40s)
  - Stores base64 in Redis with key "portrait:{uuid}"
  - Picks up job #2
  - Generates portrait (80s)
  - Stores in Redis
  - Picks up job #3
  - Generates portrait (120s)
  - Stores in Redis
```

### 3. Frontend Polling
Cards show a loading skeleton where portrait should be:
```
Frontend (every 3 seconds):
  - "Hey Go, is portrait {uuid} ready yet?"

Go checks Redis:
  - Not ready: {"ready": false, "message": "Portrait is being generated"}
  - Ready: {"ready": true, "portrait": "base64_data..."}

When ready → Portrait pops into the card
```

### 4. Cleanup
Redis auto-deletes portraits after 1 hour (they're temporary, real portraits get uploaded to R2 when user creates the world).

## Services Involved

**RabbitMQ** (port 5672)
- Message queue that holds portrait generation jobs
- Python publishes jobs, worker consumes them
- Like a post office for background tasks

**Redis** (port 6379)
- Temporary storage for portrait base64 data
- Key format: `portrait:{uuid}`
- 1-hour TTL (auto-delete)
- Also used for adventure mode sessions later

**Python Service** (port 50051)
- gRPC server (handles character generation requests)
- RabbitMQ worker (generates portraits in background)
- Both run in same container via `start.sh` script

**Go Service** (port 8080)
- Serves `/temp-portraits/{uuid}` endpoint (public, no auth)
- Checks Redis and returns portrait if ready

**Frontend**
- Uses `useTempPortrait(uuid)` hook
- Polls every 3 seconds until portrait appears
- Shows spinning loader + "Generating portrait..." until ready

## User Experience

**Before:**
1. Click "Generate" → stare at skeletons for 2+ minutes
2. All 3 cards appear at once with everything

**After:**
1. Click "Generate" → stare at skeletons for ~25-30 seconds
2. Cards appear with character info + portrait loading state
3. First portrait pops in (~40s later)
4. Second portrait pops in (~80s later)
5. Third portrait pops in (~120s later)

Users get to read the characters while portraits are still generating. Much better experience.

## Why This Architecture?

**Why RabbitMQ instead of just threads?**
- If gRPC crashes, worker keeps running
- If worker crashes, gRPC keeps running
- Easy to scale later (run multiple worker containers)

**Why Redis instead of database?**
- Super fast (in-memory)
- TTL support (auto-cleanup)
- We need it for adventure mode anyway (session storage)

**Why public endpoint for portraits?**
- UUID is already a secret (impossible to guess)
- Just image data, not sensitive
- Portraits expire in 1 hour
- Simpler than managing auth for polling
