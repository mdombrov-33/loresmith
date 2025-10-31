# How to Use gRPC Context Utility

## TL;DR

Instead of this:

```go
ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
defer cancel()
resp, err := client.GenerateCharacters(ctx, req)
```

Do this:

```go
ctx, cancel := utils.NewGRPCContext(utils.OpGenerateLore)
defer cancel()
resp, err := client.GenerateCharacters(ctx, req)
```

---

## Why?

**Problem**: We had manual timeout code duplicated in every handler:

- Hard to maintain (change timeout → change 10 files)
- Easy to forget `defer cancel()` → memory leaks
- Inconsistent timeouts across similar operations

**Solution**: Centralized timeout management with semantic operation types.

---

## Available Operation Types

Located in `internal/utils/grpc.go`:

### Slow Operations (3 minutes)

```go
utils.OpGenerateLore        // Multiple lore pieces (characters, factions, etc.)
utils.OpGenerateFullStory   // Full quest generation
utils.OpGenerateSceneBatch  // 3 scenes × 5 outcome branches = 15 LLM calls
```

### Medium Operations (1 minute)

```go
utils.OpGenerateBeats       // Expand scene beats
utils.OpGenerateCompanion   // Single character with fewer details
utils.OpGenerateInventory   // 3-5 starting items
utils.OpRerank              // Rerank search results
```

### Quick Operations (30 seconds)

```go
utils.OpGenerateConsequence // Single outcome generation
utils.OpGenerateEmbedding   // Text embedding
```

---

## Usage Examples

### Example 1: Adventure Handler (Scene Generation)

```go
// adventure_handler.go
func (h *AdventureHandler) HandleGenerateSceneBatch(w http.ResponseWriter, r *http.Request) {
    // ... parse request ...

    // Use OpGenerateSceneBatch (3 minutes)
    ctx, cancel := utils.NewGRPCContext(utils.OpGenerateSceneBatch)
    defer cancel()

    grpcResp, err := h.pythonClient.GenerateSceneBatch(ctx, grpcReq)
    if err != nil {
        // Handle timeout or other errors
        h.logger.Printf("ERROR: Scene batch generation failed: %v", err)
        utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to generate scenes"})
        return
    }

    // ... handle response ...
}
```

### Example 2: Companion Generation

```go
func (h *AdventureHandler) HandleGenerateCompanion(w http.ResponseWriter, r *http.Request) {
    // ... parse request ...

    // Use OpGenerateCompanion (1 minute)
    ctx, cancel := utils.NewGRPCContext(utils.OpGenerateCompanion)
    defer cancel()

    grpcResp, err := h.pythonClient.GenerateCompanion(ctx, grpcReq)
    // ... handle response ...
}
```

### Example 3: Quick Consequence Generation

```go
func (h *AdventureHandler) HandleGenerateConsequence(w http.ResponseWriter, r *http.Request) {
    // ... parse request ...

    // Use OpGenerateConsequence (30 seconds)
    ctx, cancel := utils.NewGRPCContext(utils.OpGenerateConsequence)
    defer cancel()

    grpcResp, err := h.pythonClient.GenerateConsequence(ctx, grpcReq)
    // ... handle response ...
}
```

### Example 4: Custom Timeout (rare cases)

```go
// If you need a one-off custom timeout:
ctx, cancel := utils.NewGRPCContextWithTimeout(5 * time.Minute)
defer cancel()

resp, err := client.SomeVerySlowOperation(ctx, req)
```

---

## Common Mistakes

### ❌ Mistake 1: Forgetting `defer cancel()`

```go
// BAD - memory leak!
ctx, cancel := utils.NewGRPCContext(utils.OpGenerateLore)
resp, err := client.GenerateCharacters(ctx, req)
// cancel() is never called
```

```go
// GOOD
ctx, cancel := utils.NewGRPCContext(utils.OpGenerateLore)
defer cancel() // ✅ Always defer immediately
resp, err := client.GenerateCharacters(ctx, req)
```

### ❌ Mistake 2: Using `r.Context()`

```go
// BAD - tied to HTTP request lifecycle
ctx := r.Context()
resp, err := client.GenerateCharacters(ctx, req)
// If frontend aborts after 60s, this context gets canceled
```

```go
// GOOD - independent timeout
ctx, cancel := utils.NewGRPCContext(utils.OpGenerateLore)
defer cancel()
resp, err := client.GenerateCharacters(ctx, req)
// Has its own 3-minute timeout, independent of HTTP request
```

### ❌ Mistake 3: Wrong operation type

```go
// BAD - scene batch takes 3 minutes, but OpGenerateConsequence is 30s
ctx, cancel := utils.NewGRPCContext(utils.OpGenerateConsequence) // ❌ Too short!
defer cancel()
resp, err := client.GenerateSceneBatch(ctx, req) // Will timeout
```

```go
// GOOD
ctx, cancel := utils.NewGRPCContext(utils.OpGenerateSceneBatch) // ✅ 3 minutes
defer cancel()
resp, err := client.GenerateSceneBatch(ctx, req)
```

---

## Adding New Operation Types

If you add a new LLM operation, update `internal/utils/grpc.go`:

```go
const (
    // ... existing types ...
    OpGenerateDialogue OperationType = "generate_dialogue" // NEW
)

var operationTimeouts = map[OperationType]time.Duration{
    // ... existing timeouts ...
    OpGenerateDialogue: 45 * time.Second, // NEW - choose appropriate timeout
}
```

---

## FAQ

**Q: What if I'm not sure which operation type to use?**
A: Use `OpGenerateLore` (3 minutes) for safety. Better to have extra time than timeout.

**Q: Can I change the timeout for an existing operation type?**
A: Yes! Just edit the map in `utils/grpc.go`. All handlers will automatically use the new timeout.

**Q: What happens when a context times out?**
A: The gRPC call returns an error. You should log it and return an HTTP 500 to the client.

**Q: Do I need this for database calls?**
A: No, only for gRPC calls to the Python service. Database calls are fast and use connection pool timeouts.

**Q: What if the operation completes before timeout?**
A: `defer cancel()` cleans up immediately. No need to wait for full timeout duration.
