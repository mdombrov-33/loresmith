# gRPC Serialization Strategy - Current Issues & Adventure Mode Plan

**Last Updated**: 2025-10-30  
**Status**: Reference Guide for Future Adventure Mode Implementation

---

## Current Architecture (Lore Generation)

### What We're Doing

```protobuf
// lore.proto
message LorePiece {
    string name = 1;
    string description = 2;
    map<string, string> details = 3;  // ❌ Everything is a string
    string type = 4;
}
```

### The Serialize/Deserialize Dance

```python
# Python (generate/chains/character.py)
details = {
    "health": 100,              # Native int
    "skills": [{"name": "Combat", "level": 85}]  # Native array
}

# convert_to_grpc_lore_piece (lore_servicer.py)
for key, value in details.items():
    if isinstance(value, (list, dict)):
        details_serialized[key] = json.dumps(value)  # Array → JSON string
    else:
        details_serialized[key] = str(value)  # Number → string

# gRPC sends:
{
    "health": "100",                          # String
    "skills": "[{\"name\":\"Combat\"}]"       # JSON string
}
```

```go
// Go (lore_handler.go)
func deserializeDetails(details map[string]string) map[string]any {
    for key, value := range details {
        var parsed interface{}
        if json.Unmarshal([]byte(value), &parsed) == nil {
            result[key] = parsed  // "100" → 100, "[...]" → [...]
        } else {
            result[key] = value  // Plain string stays string
        }
    }
}

// Returns to frontend:
{
    "health": 100,              // Number
    "skills": [{"name": "Combat", "level": 85}]  // Array
}
```

```go
// Go (world_store.go) - Saving to database
// Must deserialize AGAIN before saving to JSONB
detailsMap := make(map[string]interface{})
for key, value := range grpcDetails {
var parsed interface{}
json.Unmarshal([]byte(value), &parsed)
detailsMap[key] = parsed
}
detailsJSON, * := json.Marshal(detailsMap)
// INSERT INTO lore_pieces ... details = $1 (detailsJSON)
```

---

## Why This Is Problematic

### Performance Issues

```go
// Every request does this:
1. Python: Marshal to JSON string
2. gRPC: Send as string
3. Go: Unmarshal from JSON string
4. Frontend: Use native types
5. Go (if saving): Unmarshal AGAIN, then Marshal for DB
```

**Result**: Double/triple JSON parsing on every request.

### Type Safety Issues

```go
// No compile-time checks
health := details["health"] // interface{} - could be anything!
// Must type assert:
healthNum, ok := health.(float64)
if !ok {
// Handle type mismatch at runtime ❌
}
```

### Error-Prone

```python
# Easy to forget serialization:
details = {
"health": 100, # ✅ Gets stringified
"new_stat": some_array # ❌ Forgot to add to serialization logic
}
# Runtime error in Go when parsing!
```

---

## Why We Keep It For Lore Generation

### Reasons NOT to Change Existing Code

1. **It works** - Fixed the issues, now stable
2. **Flexibility** - Easy to add new lore types (just add fields to details dict)
3. **Low risk** - Changing would require:
   - Rewriting 5 generation chains (character, faction, setting, event, relic)
   - Updating all handlers
   - Regenerating protobuf
   - Testing everything again
4. **Not worth it** - Lore generation is complete and working

### When It's Acceptable

- **Simple data** - Mostly strings (faction ideology, setting landscape, etc.)
- **One-way flow** - Generate → Display (not complex updates)
- **Infrequent** - User generates lore occasionally, not real-time gameplay

---

## Why Adventure Mode Needs Proper Protobuf

### Complex Data Structures

```python
# Consequence has nested maps and arrays
consequence = {
"hp_change": {1: -10, 2: -5}, # Map of party member ID → HP delta
"stress_change": {1: 15, 2: 10},
"items_gained": ["Potion", "Key"], # Array of strings
"story_flags": {"guards_alerted": True} # Map of flags
}

# With map<string, string> approach:
result = {
"hp_change": json.dumps({1: -10, 2: -5}), # ❌ Nested JSON hell
"stress_change": json.dumps({1: 15, 2: 10}),
"items_gained": json.dumps(["Potion", "Key"]),
"story_flags": json.dumps({"guards_alerted": True})
}
# Go must parse 4 separate JSON strings per request!
```

### Frequent Updates

- **Lore generation**: User does once, maybe 3-5 times per session
- **Adventure mode**: Every player action triggers:
  - Scene generation
  - Consequence calculation
  - Party state updates
  - 100s of requests per adventure session

Serialization overhead becomes significant.

### Type Safety Matters

```go
// Adventure mode has game logic
if partyMember.CurrentHP <= 0 {
// Character dies - game over!
}

// With map[string]string, we'd have:
hpStr, ok := details["current_hp"]
hp, err := strconv.Atoi(hpStr) // ❌ Runtime parsing for critical logic
if err != nil {
// What do we do? Crash? Default? Log?
}
```

**Too risky for real-time gameplay.**

---

## The Hybrid Approach

### Strategy

**Keep two parallel systems in the same protobuf file:**

```protobuf
service LoreService {
// ========================================
// Legacy Lore Generation (map<string, string>)
// ========================================
rpc GenerateCharacters (CharactersRequest) returns (CharactersResponse);
rpc GenerateFactions (FactionsRequest) returns (FactionsResponse);
rpc GenerateSettings (SettingsRequest) returns (SettingsResponse);
rpc GenerateEvents (EventsRequest) returns (EventsResponse);
rpc GenerateRelics (RelicsRequest) returns (RelicsResponse);
rpc GenerateAll (AllRequest) returns (AllResponse);
rpc GenerateFullStory (FullStoryRequest) returns (FullStoryResponse);

// ========================================
// Adventure Mode (Proper Types)
// ========================================
rpc GenerateCompanion (CompanionRequest) returns (CompanionResponse);
rpc GenerateSceneBatch (SceneBatchRequest) returns (SceneBatchResponse);
rpc GenerateSceneBeats (SceneBeatsRequest) returns (SceneBeatsResponse);
rpc GenerateConsequence (ConsequenceRequest) returns (ConsequenceResponse);
}
```

### Benefits

- ✅ No risk to working code
- ✅ Clean slate for new feature
- ✅ Learn from mistakes
- ✅ Can coexist in same service
- ✅ Future: migrate lore generation if needed (optional)

---

## Proper Protobuf for Adventure Mode

### Core Types

```protobuf
// Reusable skill type
message Skill {
string name = 1;
int32 level = 2; // 1-100
}

// Roll result (used in multiple places)
message RollResult {
int32 roll_value = 1; // 1-20 (d20)
int32 modifier = 2; // Attribute modifier
int32 dc = 3; // Difficulty class
int32 total = 4; // roll_value + modifier
string outcome = 5; // "success", "failure", "critical_success", etc.
}
```

### Companion Generation

```protobuf
message CompanionRequest {
map<string, string> protagonist_info = 1; // name, personality, backstory, skills
string relationship_type = 2; // "ally", "rival", "mentor", etc.
map<string, string> world_lore = 3; // theme, faction, setting
}

message CompanionResponse {
string name = 1;
string description = 2;
string relationship_to_protagonist = 3;

// Stats (native types!)
int32 max_hp = 4;
int32 current_hp = 5;
int32 stress = 6;
int32 lore_mastery = 7;
int32 empathy = 8;
int32 resilience = 9;
int32 creativity = 10;
int32 influence = 11;
int32 perception = 12;

// Skills (native array!)
repeated Skill skills = 13;

string flaw = 14;
string personality = 15;
string appearance = 16;
int32 position = 17; // 1-3 (0 is protagonist)
}
```

### Scene Batch Generation

```protobuf
message SceneBatchRequest {
map<string, string> world_lore = 1; // quest, setting, faction, etc.
int32 act_number = 2;
repeated string previous_outcomes = 3; // Summaries of previous scenes
}

message BeatSkeleton {
int32 beat_number = 1;
string type = 2; // "setup", "challenge", "resolution"
string description = 3; // AI-generated beat description
}

message SceneSkeleton {
int32 scene_number = 1;
string core_challenge = 2;
string challenge_type = 3; // "combat", "social", "stealth", "puzzle"
repeated string key_npcs = 4; // ✅ Native array
string location = 5;
string stakes = 6;
map<string, string> continuity_hooks = 7; // Flags for branching
repeated BeatSkeleton beats = 8; // ✅ Nested array of beats
}

message SceneBatchResponse {
repeated SceneSkeleton scenes = 1; // Always 3 scenes per act
}
```

### Scene Beats Expansion

```protobuf
message SceneBeatsRequest {
SceneSkeleton scene_skeleton = 1;
map<string, string> party_state = 2; // HP, stress, inventory, etc.
map<string, string> world_lore = 3;
}

message Choice {
string text = 1; // "Sneak past the guards"
string attribute = 2; // "perception", "influence", etc.
int32 dc = 3; // Difficulty class
}

message Beat {
int32 beat_number = 1;
string narrative = 2; // Full narrative text
bool choice_required = 3;
repeated Choice choices = 4; // ✅ Native array
}

message SceneBeatsResponse {
repeated Beat beats = 1;
}
```

### Consequence Generation

```protobuf
message ConsequenceRequest {
string choice = 1; // What player chose
RollResult roll_result = 2; // Dice roll outcome
map<string, string> scene_context = 3;
map<string, string> party_state = 4;
}

message ConsequenceResponse {
// ✅ All native types - no JSON strings!
map<int32, int32> hp_change = 1; // party_member_id → HP delta
map<int32, int32> stress_change = 2; // party_member_id → stress delta
repeated string items_gained = 3;
repeated string items_lost = 4;
map<string, string> story_flags = 5; // flag_name → "true"/"false"
string narrative_description = 6;
}
```

---

## Implementation Checklist

When you're ready to implement adventure mode:

### Step 1: Update lore.proto

```bash
# Add all the messages above to lore.proto
# Add new RPCs to LoreService
```

### Step 2: Regenerate Protobuf Stubs

```bash
cd go-service
make proto
# This regenerates:
# - gen/lorepb/lore.pb.go (Go types)
# - gen/lorepb/lore_grpc.pb.go (Go gRPC client/server)
# Python stubs auto-generated by grpcio-tools
```

### Step 3: Update Python Models

```python
# adventure/models/*.py already created, just need to match protobuf

# Example: adventure/models/party.py
class CompanionResponse(BaseModel):
"""Matches lorepb.CompanionResponse exactly"""
name: str
max_hp: int # ✅ Native int, not str
skills: list[Skill] # ✅ Native list, not JSON string
# ... etc
```

### Step 4: Implement Python gRPC Methods

```python
# lore_servicer.py
class LoreServicer(lore_pb2_grpc.LoreServiceServicer):
# ... existing methods

async def GenerateCompanion(self, request, context):
from adventure.orchestrators.adventure_orchestrator import AdventureOrchestrator

orchestrator = AdventureOrchestrator()
companion = await orchestrator.generate_companion(
protagonist_info=dict(request.protagonist_info),
relationship_type=request.relationship_type,
world_lore=dict(request.world_lore)
)

# Return protobuf message directly (NO serialization!)
return lore_pb2.CompanionResponse(
name=companion["name"],
max_hp=companion["max_hp"], # ✅ Native int
skills=[ # ✅ Native array
lore_pb2.Skill(name=s["name"], level=s["level"])
for s in companion["skills"]
]
)
```

### Step 5: Implement Go Handlers

```go
// internal/api/adventure_handler.go
func (h *AdventureHandler) HandleGenerateCompanion(w http.ResponseWriter, r *http.Request) {
// Call gRPC (no serialization needed!)
resp, err := h.pythonClient.GenerateCompanion(ctx, &lorepb.CompanionRequest{...})

// Use directly (no deserialization needed!)
companion := &store.PartyMember{
Name: resp.Name,
MaxHP: int(resp.MaxHp), // ✅ Already int
Skills: resp.Skills, // ✅ Already array
}

// Save to database
id, err := h.partyStore.CreatePartyMember(companion)
}
```

---

## Quick Reference

### When to Use map<string, string>

- ✅ Simple data (mostly strings)
- ✅ Infrequent operations
- ✅ Display-only (no complex logic)
- ✅ Flexible schema (fields change often)

### When to Use Proper Protobuf

- ✅ Complex nested data
- ✅ Frequent operations (real-time gameplay)
- ✅ Game logic (HP, stats, combat)
- ✅ Type safety critical
- ✅ Performance matters

---

## Summary

**Current State**: Lore generation uses `map<string, string>` with serialize/deserialize. Works fine for simple, infrequent operations.

**Adventure Mode Plan**: Use proper protobuf types for clean, type-safe, performant real-time gameplay.

**Action**: When implementing adventure mode, add new protobuf messages to `lore.proto` and follow the patterns in this doc.

**Don't**: Try to fix existing lore generation - it works, leave it alone.

**Do**: Start clean with adventure mode using lessons learned
