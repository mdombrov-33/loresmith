# LoreSmith Adventure Mode - Complete Design Document

**Last Updated**: 2025-11-18
**Status**: Design Phase - Ready for Implementation (Approach 2: World-Scoped Scene Batches)

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [User Journey](#user-journey)
4. [Database Schema](#database-schema)
5. [World Status & Visibility](#world-status--visibility)
6. [Party System](#party-system)
7. [Scene System](#scene-system)
8. [Gameplay Mechanics](#gameplay-mechanics)
9. [Camp & Rest System](#camp--rest-system)
10. [Inventory System](#inventory-system)
11. [Breakpoint Events](#breakpoint-events)
12. [Technical Architecture](#technical-architecture)
13. [Redis Architecture & Caching Strategy](#redis-architecture--caching-strategy)
14. [Design Approach: World-Scoped Scene Batches](#design-approach-world-scoped-scene-batches)
15. [AI Generation Strategy](#ai-generation-strategy)
16. [UI/UX Design](#uiux-design)
17. [Implementation Roadmap](#implementation-roadmap)

---

## Overview

Adventure Mode transforms LoreSmith's generated worlds into playable, interactive text-based adventures. Players take on the role of the protagonist character from a world, optionally recruit AI-generated companions, and progress through dynamically-generated scenes to complete the world's quest.

### Key Design Principles

- **Reactive Storytelling**: Scenes acknowledge previous choices and outcomes
- **Tactical Choice**: Party composition and character selection matter
- **Manageable Length**: 5-15 scenes based on quest complexity, not endless
- **Replayability**: Same world has consistent encounters but different experiences through companion choice, dice variance, and party composition
- **Consequence-Driven**: Meaningful failure states (death, stress, resource loss)

---

## Core Concepts

### The Main Character (Protagonist)

- Every world has ONE protagonist character (e.g., Emmeline Fothergill in the steampunk world)
- ALL players who start adventures in this world play AS this protagonist
- The protagonist is marked in the database with `is_protagonist = true`
- Main character death = game over (session fails)

### Companions vs. Lore Characters

**Lore Characters**:
- Generated during world creation
- Stored in `lore_pieces` table
- Part of world's permanent lore
- Same for everyone who views the world

**Companions**:
- Generated when a player starts an adventure
- Unique to that player's session
- NOT stored in `lore_pieces` - stored in `party_members` table
- Generated with relationships to the protagonist

### Session vs. World

**World**:
- The story template (quest, lore, protagonist)
- Can have multiple sessions from different players
- Like a D&D module - same story, different groups

**Adventure Session**:
- One player's playthrough of a world
- Tracks party, progress, choices, state
- Each session is isolated and unique

---

## User Journey

### Phase 1: World Creation (Existing System)

```
1. User selects theme (e.g., "steampunk")
2. AI generates lore pieces (characters, factions, settings, events, relics)
3. User selects favorite lore pieces
4. AI generates full story + quest
5. World saved to DB:
   - visibility: 'private'
   - status: 'draft'
   - One character marked as is_protagonist: true
```

**Example World**:
```
Quest: "Retrieve the stolen Aetherian chronograph before Lady Sophia Windsor
        can unlock its secrets"
Protagonist: Emmeline Fothergill (steampunk mechanic)
Theme: Steampunk
Full Story: [Chronicle text...]
Lore Pieces: [Character, Faction, Setting, Event, Relic]
```

### Phase 2: Publishing (Optional)

```
User reviews their world
Clicks "Publish World" button
→ visibility changed to 'published'
World now appears in global search
```

### Phase 3: Adventure Initialization

**Key Distinction**: `world_id` vs `session_id`
- **world_id**: The world template (quest, lore, protagonist) - shared across all players
- **session_id**: One player's specific playthrough - unique to this player

**Example**:
```
World ID 123: "Unlock the Aetherian Echo" (steampunk, Emmeline protagonist)
  ↳ Session 456: Alice's playthrough (alive, act 2, companions: Bob + Kira)
  ↳ Session 789: Bob's playthrough (failed, died in act 1)
  ↳ Session 101: Carol's playthrough (completed, solo run)
```

**Flow**:
```
1. User clicks "Begin Adventure" on world page (their own or someone else's)
2. System creates adventure_session record:
   - session_id: generated (unique to this player)
   - world_id: reference to world (shared template)
   - user_id: player starting adventure
   - status: 'initializing'
   - current_scene_index: 0

3. PARTY GENERATION SCREEN:
   ┌────────────────────────────────────┐
   │ Your Protagonist                   │
   │ [Emmeline Fothergill - LOCKED]    │
   │                                    │
   │ Recruit Companions (Optional)      │
   │ [Companion 1] [Companion 2] [...]  │
   │                                    │
   │ [Regenerate All] (1x available)    │
   │ [Continue Solo] [Embark]           │
   └────────────────────────────────────┘

   - Protagonist card shown, cannot be changed
   - AI generates 3 companion suggestions
   - Each companion has relationship to protagonist
   - Player can:
     * Accept companions
     * Remove individual companions (X button)
     * Regenerate all companions once
     * Continue with just protagonist (solo)

4. Save selected party members to party_members table

5. QUEST BRIEFING SCREEN:
   - Display quest title + description
   - Show selected party (protagonist + companions)
   - "Embark on Adventure" button

6. Update session:
   - status: 'active'

7. Update world:
   - status: 'active' (if this is first session for this world)
```

### Phase 4: Scene Gameplay Loop

```
SCENE START:
1. Check if scene batch exists for current act (world-scoped)
   - Look up by world_id + act_number
   - If not found: Generate scene batch (3 skeletons) and cache for this world
   - If found: Use cached batch (shared with all other sessions)

2. Load current scene skeleton from batch

3. Generate dynamic scene intro:
   - Input: scene skeleton + previous scene outcomes + party state
   - Output: Contextualized narrative

4. Display scene:
   ┌────────────────────────────────────┐
   │ Scene 2: The Workshop Trail        │
   ├────────────────────────────────────┤
   │ Bruised from the guard attack,     │
   │ Emmeline and Bob limp through the  │
   │ rain-soaked streets...             │
   │                                    │
   │ BEAT 1: Find the Workshop          │
   │                                    │
   │ ┌──────────┐ ┌──────────┐         │
   │ │Choice 1  │ │Choice 2  │         │
   │ │[Percept.]│ │[Lore M.] │         │
   │ │DC: 15    │ │DC: 12    │         │
   │ └──────────┘ └──────────┘         │
   └────────────────────────────────────┘

CHOICE PHASE:
5. Player clicks an action choice

6. Character selection modal opens:
   ┌────────────────────────────────────┐
   │ Who attempts this action?          │
   │                                    │
   │ [Emmeline]    Perception: 14 (+2)  │
   │ [Bob]         Perception: 10 (+0)  │
   │               ⚠️ Flaw may hinder   │
   │                                    │
   │           [Attempt Action]         │
   └────────────────────────────────────┘

7. Player selects character

RESOLUTION PHASE:
8. Dice roll animation:
   - Roll d20 + attribute modifier
   - Compare to DC
   - Show result (success/partial/failure)

9. Display outcome narrative:
   - Success: "You spot a hidden alley leading to the workshop..."
   - Failure: "You get lost and waste precious time. Lady Sophia
              gains an advantage. +10 Stress."

10. Update state:
    - HP changes
    - Stress changes
    - Inventory additions/removals
    - Story flags set
    - Log to scene_log table

11. Check for breakpoint events:
    - If character HP = 0 → Death event
    - If character stress ≥ 75 → Stress event
    - If protagonist HP = 0 → GAME OVER

NEXT BEAT/SCENE:
12. If scene has more beats → Return to step 4 (next beat)
13. If scene complete:
    - Show "Scene Complete" summary
    - [Continue] button
    - Next scene

14. If act complete (scenes 3, 6, 9, etc.):
    → Go to CAMP/REST phase
```

### Phase 5: Camp & Rest System

```
Triggered after every 3 scenes (end of act)

CAMP SCREEN:
┌────────────────────────────────────┐
│ Camp - Safe for Now                │
├────────────────────────────────────┤
│ [Generated Camp Event Narrative]   │
│                                    │
│ Party Status:                      │
│ • Emmeline: 70/100 HP, 35 Stress   │
│ • Bob: 85/100 HP, 20 Stress        │
│                                    │
│ Actions:                           │
│ • Use Items                        │
│ • View Stats                       │
│ • Review Progress                  │
│                                    │
│        [Continue Journey]          │
└────────────────────────────────────┘

Automatic effects:
- All characters: -20 Stress
- Optional: Use healing items
- Background: Generate next scene batch

Camp Event Generation:
- AI generates short narrative event based on:
  * World theme
  * Current quest progress
  * Party composition
  * Recent scene outcomes

Example Camp Events:
- "Bob tends to his wounds while Emmeline tinkers with a
   broken clockwork device found in the last encounter..."
- "Around the campfire, you discuss Lady Sophia's motives..."
```

### Phase 6: Quest Completion

```
FINALE SCENE:
- Last scene resolves the quest
- Special victory/defeat narrative

COMPLETION SCREEN:
┌────────────────────────────────────┐
│ Quest Complete!                    │
│ "Unlocking the Aetherian Echo"     │
├────────────────────────────────────┤
│ Scenes Completed: 12               │
│ Choices Made: 34                   │
│ Companions Lost: 1 (RIP Bob)       │
│ Items Found: 7                     │
│ Final Party Stress: 45 avg         │
│                                    │
│ [Play Again] [Return to World]     │
└────────────────────────────────────┘

Database updates:
- session.status = 'completed'
- session.completed_at = NOW()
- If no more active sessions for world:
  * world.status = 'completed'
```

---

## Database Schema

### New Tables

```sql
-- Adventure Sessions
CREATE TABLE IF NOT EXISTS adventure_sessions (
    id BIGSERIAL PRIMARY KEY,
    world_id BIGINT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'initializing',
    -- Status: 'initializing', 'active', 'completed', 'failed'

    current_scene_index INT DEFAULT 0,
    current_act INT DEFAULT 1,

    session_state JSONB,
    -- {
    --   "scene_outcomes": [...],
    --   "story_flags": {"found_secret": true, ...},
    --   "quest_progress": 0.65,
    --   "companion_relationships": {
    --     "party_member_id_1": {"level": 15, "last_change": "Saved them in scene 3"},
    --     "party_member_id_2": {"level": -10, "last_change": "Disagreed with choice"}
    --   }
    -- }

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_adventure_sessions_world_id ON adventure_sessions(world_id);
CREATE INDEX idx_adventure_sessions_user_id ON adventure_sessions(user_id);
CREATE INDEX idx_adventure_sessions_status ON adventure_sessions(status);

-- Party Members
CREATE TABLE IF NOT EXISTS party_members (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES adventure_sessions(id) ON DELETE CASCADE,

    -- For protagonist: references lore_pieces.id
    -- For companions: NULL (companion data stored in this table)
    lore_character_id BIGINT REFERENCES lore_pieces(id),

    is_protagonist BOOLEAN DEFAULT false,

    -- Character data (for companions, duplicates some lore_piece data)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    relationship_to_protagonist TEXT,
    -- e.g., "Old friend from the Under-Market", "Reluctant ally"
    relationship_level INT DEFAULT 0,
    -- Affection/trust level: -100 (hostile) to +100 (devoted)
    -- Changes based on story choices and shared experiences
    -- Does NOT apply to protagonist (they don't have self-relationship)

    -- Stats (copied from lore_pieces.details for protagonist)
    max_hp INT NOT NULL,
    current_hp INT NOT NULL,
    stress INT DEFAULT 0,

    -- Attributes (8-18 range)
    lore_mastery INT DEFAULT 10,
    empathy INT DEFAULT 10,
    resilience INT DEFAULT 10,
    creativity INT DEFAULT 10,
    influence INT DEFAULT 10,
    perception INT DEFAULT 10,

    -- Character details
    skills TEXT,
    flaw TEXT,
    personality TEXT,
    appearance TEXT,

    position INT, -- Display order in party UI (0-3)

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_party_members_session_id ON party_members(session_id);
CREATE INDEX idx_party_members_lore_character_id ON party_members(lore_character_id);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES adventure_sessions(id) ON DELETE CASCADE,

    -- NULL = shared party inventory
    -- If set = character-specific inventory
    party_member_id BIGINT REFERENCES party_members(id) ON DELETE CASCADE,

    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    item_type VARCHAR(50),
    -- Types: 'consumable', 'equipment', 'quest_item', 'crafting'

    item_effect JSONB,
    -- Examples:
    -- {"type": "heal", "value": 20}
    -- {"type": "stress_relief", "value": 10}
    -- {"type": "stat_buff", "stat": "influence", "value": 2, "duration": "permanent"}

    quantity INT DEFAULT 1,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_items_session_id ON inventory_items(session_id);
CREATE INDEX idx_inventory_items_party_member_id ON inventory_items(party_member_id);

-- Scene Log
CREATE TABLE IF NOT EXISTS scene_log (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES adventure_sessions(id) ON DELETE CASCADE,

    scene_index INT NOT NULL,
    beat_index INT NOT NULL,

    narrative TEXT NOT NULL,
    choice_made VARCHAR(255),

    party_member_id BIGINT REFERENCES party_members(id),
    -- Which character attempted the action

    attribute_used VARCHAR(50),
    -- 'lore_mastery', 'empathy', etc.

    roll_result INT,
    -- The d20 roll (1-20)

    modifier INT,
    -- Attribute modifier

    dc INT,
    -- Difficulty Class

    outcome VARCHAR(20),
    -- 'success', 'partial', 'failure', 'critical_success', 'critical_failure'

    consequences JSONB,
    -- {"hp_change": -15, "stress_change": 10, "items_gained": [...]}

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scene_log_session_id ON scene_log(session_id);
CREATE INDEX idx_scene_log_scene_index ON scene_log(scene_index);

-- Scene Batches (cache generated scene skeletons per world)
-- IMPORTANT: Scene batches are scoped to world_id, not session_id
-- All players of the same world share the same encounters/challenges
-- This provides consistency for reviews/ratings and reduces AI costs
CREATE TABLE IF NOT EXISTS scene_batches (
    id BIGSERIAL PRIMARY KEY,
    world_id BIGINT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,

    act_number INT NOT NULL,
    -- Act 1, Act 2, etc.

    scenes JSONB NOT NULL,
    -- Array of scene skeleton objects with pre-generated outcome branches
    -- [
    --   {
    --     "scene_number": 1,
    --     "core_challenge": "...",
    --     "challenge_type": "stealth",
    --     "key_npcs": [...],
    --     "stakes": "...",
    --     "continuity_hooks": {...},
    --     "beats": [
    --       {
    --         "beat_number": 1,
    --         "outcome_branches": {
    --           "critical_success": {...},
    --           "success": {...},
    --           "partial": {...},
    --           "failure": {...},
    --           "critical_failure": {...}
    --         }
    --       }
    --     ]
    --   },
    --   ...
    -- ]

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(world_id, act_number)
    -- One batch per act per world (shared across all sessions)
);

CREATE INDEX idx_scene_batches_world_id ON scene_batches(world_id);
CREATE INDEX idx_scene_batches_act_number ON scene_batches(act_number);
```

### Modified Tables

```sql
-- Add visibility column to worlds
ALTER TABLE worlds
ADD COLUMN visibility VARCHAR(20) DEFAULT 'private';
-- Values: 'private', 'published'

-- Add is_protagonist to lore_pieces
ALTER TABLE lore_pieces
ADD COLUMN is_protagonist BOOLEAN DEFAULT false;

-- Update comment on worlds.status
COMMENT ON COLUMN worlds.status IS
'World play state: draft (never played), active (has active sessions), completed (all sessions done)';
```

---

## World Status & Visibility

### Two Separate Concerns

**Visibility** (Who can see/play this world):
- `private`: Only creator sees it, cannot be searched by others
- `published`: Anyone can search and play it

**Status** (Play state):
- `draft`: Never been played
- `active`: Has at least one active session
- `completed`: All sessions are completed/failed

### State Transitions

```
Create World:
└─> visibility='private', status='draft'

Publish World:
└─> visibility='published', status='draft'

First Player Starts Adventure:
└─> status='active'

All Sessions End:
└─> status='completed'

New Session Starts on Completed World:
└─> status='active' (again)
```

### Search Behavior

**Global Search** (`scope=global`):
- Only show worlds with `visibility='published'`
- Can filter by status: `status=draft` (published but never played)

**My Worlds** (`scope=my`):
- Show user's worlds regardless of visibility
- Can filter by status

**Example Queries**:
```sql
-- "Show me published worlds that have been played"
SELECT * FROM worlds
WHERE visibility = 'published'
AND status IN ('active', 'completed');

-- "Show me published worlds nobody has tried yet"
SELECT * FROM worlds
WHERE visibility = 'published'
AND status = 'draft';
```

---

## Party System

### Protagonist (Main Character)

**Selection**:
- During world creation, one character from lore_pieces is marked `is_protagonist = true`
- This character becomes the protagonist for ALL adventures in this world
- Cannot be changed once world is created

**Properties**:
- Stats copied from `lore_pieces.details` JSONB
- Health: 50-150 (AI-generated during character creation)
- Stress: 0-50 initial (AI-generated)
- Attributes: 8-18 each
- Skills, flaw, appearance, personality

**Death Condition**:
- If protagonist `current_hp` reaches 0 → Session fails
- Game Over screen shown
- Session marked `status='failed'`

### Companions

**Generation**:
- When player starts adventure, Python chain generates 3 companion suggestions
- Prompt includes: theme, protagonist info, world lore
- Each companion has `relationship_to_protagonist` field

**Example Companion Generation Prompt**:
```
Theme: steampunk
Protagonist: Emmeline Fothergill
  - Steampunk mechanic
  - Compulsive repairer
  - Skills: clockwork repair, gadget crafting

Generate a companion character who:
1. Fits the steampunk theme
2. Has a relationship to Emmeline (friend, rival, mentor, etc.)
3. Complements her skills (different strengths)
4. Has their own personality, flaw, and stats

Output: Name, description, relationship, stats, skills, flaw
```

**Selection Options**:
1. Accept all 3 companions (party of 4)
2. Remove some companions (party of 2-3)
3. Regenerate all once
4. Continue solo (party of 1, just protagonist)

**Storage**:
- Companions stored in `party_members` table
- `lore_character_id = NULL` (they're not lore pieces)
- All character data duplicated in party_members columns

### Party Composition

**Limits**:
- Minimum: 1 (just protagonist)
- Maximum: 4 (protagonist + 3 companions)

**Stats Management**:
- Each party member tracks own HP, stress, attributes
- Party members can have different equipment/items
- All living party members participate in every scene

**Death**:
- Companion HP reaches 0 → Breakpoint event triggers
- Companion removed from active party
- Session continues with remaining members
- If only protagonist remains, can continue solo

### Companion Relationships

**Tracking Affection/Trust**:
- Each companion has `relationship_level` (-100 to +100)
- Starts at 0 (neutral)
- Changes based on:
  - Protagonist's choices (do they align with companion values?)
  - Shared experiences (survived tough scene together → +5)
  - Combat performance (protagonist protected them → +10)
  - Stress events (protagonist caused stress → -5)

**Relationship Effects** (Future Phase):
- High relationship (+50+): Companion may help protagonist automatically
- Low relationship (-50-): Companion may refuse certain actions
- Very low (-75-): Risk of companion leaving party
- Not implemented in MVP, but schema supports it

**Storage**:
- `party_members.relationship_level` column (persistent)
- `session_state.companion_relationships` JSONB (tracks history)
- Only tracked for companions (NOT protagonist)

**Example Relationship Changes**:
```json
{
  "scene_5_choice_2": {
    "party_member_id": 123,
    "old_level": 10,
    "new_level": 25,
    "reason": "You chose to help the informant, which Bob appreciated",
    "change": +15
  }
}
```

---

## Scene System

### Scene Structure Hierarchy

```
Adventure Session
├─ Act 1 (Scenes 1-3)
│  ├─ Scene 1
│  │  ├─ Scene Intro (dynamic)
│  │  ├─ Beat 1
│  │  │  ├─ Narrative
│  │  │  ├─ Choices (3-4 options)
│  │  │  └─ Resolution
│  │  └─ Beat 2
│  │     └─ ...
│  ├─ Scene 2
│  └─ Scene 3
├─ Camp Event
├─ Act 2 (Scenes 4-6)
│  └─ ...
└─ Finale
```

### Scene Skeleton vs. Dynamic Content

**Design Philosophy**:
- **Scene Skeletons**: Pre-generated structure (challenge, location, NPCs, stakes)
- **Beat Outcomes**: Pre-generated narrative branches for ALL possible outcomes
- **Dynamic Intro**: Generated at runtime based on previous scene results
- **No AI during gameplay**: Player choices select pre-generated outcome branches

**Scene Skeleton** (Pre-generated in batch):
```json
{
  "scene_number": 2,
  "core_challenge": "Follow lead to Lady Sophia's workshop",
  "challenge_type": "investigation",
  "key_npcs": ["Workshop Guard", "Street Informant"],
  "location": "Industrial District",
  "stakes": "Workshop is heavily guarded, time is running out",

  "continuity_hooks": {
    "if_scene_1_success": {
      "context": "You have the informant's tip",
      "advantage": "Know secret entrance location"
    },
    "if_scene_1_failure": {
      "context": "You're wounded and lost the informant",
      "disadvantage": "Must find workshop without help"
    }
  },

  "beats": [
    {
      "beat_number": 1,
      "core_situation": "Locate the workshop in the crowded district",
      "challenge_attributes": ["perception", "lore_mastery"],
      "base_dc": 15,
      "outcome_branches": {
        "critical_success": {
          "narrative": "Your keen eyes spot not just the workshop, but a hidden service entrance. You also notice the guard rotation pattern—a perfect window to slip inside unnoticed.",
          "hp_change": 0,
          "stress_change": -5,
          "items_gained": ["Guard Schedule"],
          "story_flags": {"found_secret_entrance": true, "knows_patrol_pattern": true}
        },
        "success": {
          "narrative": "You find the workshop after some careful observation. The main entrance is guarded, but you've identified the building and know where to go.",
          "hp_change": 0,
          "stress_change": 0,
          "items_gained": [],
          "story_flags": {"found_workshop": true}
        },
        "partial": {
          "narrative": "It takes longer than expected, and you think you've found it—but you're not entirely sure. The streets all look similar here. You'll need to proceed carefully.",
          "hp_change": 0,
          "stress_change": 5,
          "items_gained": [],
          "story_flags": {"workshop_location_uncertain": true}
        },
        "failure": {
          "narrative": "You wander the industrial district for what feels like hours. Workers give you suspicious looks. You're lost, frustrated, and Lady Sophia gains more time to unlock the chronograph's secrets.",
          "hp_change": -5,
          "stress_change": 10,
          "items_gained": [],
          "story_flags": {"time_wasted": true, "workers_suspicious": true}
        },
        "critical_failure": {
          "narrative": "In your desperate search, you accidentally stumble into a restricted factory zone. An alarm blares. Factory guards converge on your position. You flee, bruised and shaken, with no idea where the workshop is.",
          "hp_change": -15,
          "stress_change": 15,
          "items_gained": [],
          "story_flags": {"guards_alerted": true, "must_find_alternate_approach": true}
        }
      }
    },
    {
      "beat_number": 2,
      "core_situation": "Deal with workshop security",
      "challenge_attributes": ["influence", "resilience", "creativity"],
      "base_dc": 18,
      "outcome_branches": {
        "critical_success": "...",
        "success": "...",
        "partial": "...",
        "failure": "...",
        "critical_failure": "..."
      }
    }
  ]
}
```

**Beat Outcome Branching**:

Each beat has **5 pre-generated outcome branches**:
1. **critical_success** (natural 20 or total ≥ DC+8): Best possible outcome, bonus rewards
2. **success** (total ≥ DC): Standard good outcome
3. **partial** (total ≥ DC-5): Mixed result, succeed but with cost/complication
4. **failure** (total < DC-5): Bad outcome, take damage/stress, setback
5. **critical_failure** (natural 1 or total ≤ DC-10): Worst outcome, severe consequences

**Why Pre-generate All Branches?**:
- **No AI latency during gameplay**: Player rolls → immediate narrative response
- **Consistent quality**: All outcomes written together by AI, narratively coherent
- **Story continuity**: AI knows all possible paths, can set appropriate flags
- **Better pacing**: No waiting for LLM during tense moments

**How It Works**:
1. **Pre-generation** (during camp or session start):
   ```python
   # Generate scene batch with ALL outcome branches
   scene = generate_scene_skeleton(...)
   for beat in scene.beats:
       beat.outcome_branches = generate_all_outcomes(
           beat.core_situation,
           beat.challenge_attributes,
           scene.context
       )
   ```

2. **During gameplay**:
   ```python
   # Player makes choice and rolls
   roll_result = roll_d20() + modifier
   outcome_type = determine_outcome(roll_result, dc)

   # Select pre-generated branch (NO AI CALL)
   outcome = beat.outcome_branches[outcome_type]

   # Apply consequences immediately
   apply_hp_change(outcome.hp_change)
   apply_stress_change(outcome.stress_change)
   add_items(outcome.items_gained)
   set_story_flags(outcome.story_flags)

   # Display narrative to player
   return outcome.narrative
   ```

**Benefits**:
- Gameplay feels snappy and responsive
- Narratives flow naturally between beats
- Story flags ensure continuity (e.g., if beat 1 sets "guards_alerted", beat 2's intro acknowledges it)
- AI generates better outcomes when it sees all possibilities at once

**Dynamic Intro** (Generated at runtime):
```python
# Input
previous_outcome = {
    "result": "failure",
    "hp_lost": 30,
    "stress_gained": 15,
    "companions_wounded": ["Bob"],
    "key_info_gained": False
}

party_state = {
    "emmeline": {"hp": 70, "stress": 35},
    "bob": {"hp": 40, "stress": 20}
}

# Generated Output
intro = """
Bruised and bleeding from the guard attack in the Under-Market,
Emmeline and Bob limp through the rain-soaked streets of the
Industrial District. Bob clutches his wounded arm, grimacing with
each step. Without the informant's help, finding Lady Sophia's
workshop will be difficult—but you have no choice. Time is running out.

Smokestacks loom overhead, belching steam into the gray sky.
Somewhere in this maze of factories and workshops, Lady Sophia
is unlocking the chronograph's secrets.
"""
```

### Scene Batch Generation

**When** (World-Scoped Generation):
- **First playthrough of a world**: Generate all act batches progressively
  - Act 1 batch: Generated when first player starts adventure
  - Act 2 batch: Generated in background during Act 1 Camp
  - Act 3+ batches: Generated during previous camp
- **Subsequent playthroughs**: Use cached batches from database
  - No generation needed - instant scene loading
  - All players face same encounters for consistency

**Storage**: Batches stored with `world_id`, not `session_id`, so they're shared across all sessions

**How**:
```python
# chains/scene_batch_generator.py
async def generate_scene_batch(
    quest: dict,
    lore: dict,
    act_number: int,
    previous_outcomes: list = None
) -> list[SceneSkeleton]:
    """
    Generate 3 scene skeletons for an act.

    Args:
        quest: Quest title + description
        lore: Selected lore pieces (faction, setting, event, relic)
        act_number: Which act (1, 2, 3, etc.)
        previous_outcomes: Summary of previous act's outcomes

    Returns:
        List of 3 SceneSkeleton objects
    """

    prompt = f"""
    Generate 3 scene skeletons for Act {act_number} of this quest:

    Quest: {quest['title']}
    Description: {quest['description']}

    World Lore:
    - Faction: {lore['faction']['name']} - {lore['faction']['description']}
    - Setting: {lore['setting']['name']} - {lore['setting']['description']}
    - Event: {lore['event']['name']}
    - Relic: {lore['relic']['name']}

    {f"Previous Act Outcomes: {previous_outcomes}" if previous_outcomes else ""}

    Each scene should:
    1. Advance the quest toward completion
    2. Feature different challenge types (combat, social, exploration, puzzle)
    3. Include continuity hooks for branching based on success/failure
    4. Integrate world lore (NPCs from faction, location from setting, etc.)
    5. Build dramatic tension toward act climax

    Output as JSON array of 3 scenes.
    """

    # LLM call, parse JSON, return SceneSkeleton objects
```

**Storage**:
- Skeletons stored in `scene_batches` table as JSONB with `world_id` reference
- Shared across all sessions of the same world
- Generated once on first playthrough, cached permanently for that world
- All players face the same encounters for consistency in reviews/ratings

### Dynamic Intro Generation

**When**: Every time player enters a scene

**How**:
```python
# chains/scene_intro_generator.py
async def generate_scene_intro(
    scene_skeleton: SceneSkeleton,
    previous_outcome: dict,
    party_state: dict,
    theme: str
) -> str:
    """
    Generate contextualized intro for a scene based on actual outcomes.

    Args:
        scene_skeleton: The pre-generated scene structure
        previous_outcome: What happened in last scene
        party_state: Current HP, stress, items
        theme: World theme

    Returns:
        Narrative intro paragraph (3-5 sentences)
    """

    # Select appropriate continuity hook
    if previous_outcome['result'] == 'success':
        hook = scene_skeleton.continuity_hooks['if_previous_success']
    else:
        hook = scene_skeleton.continuity_hooks['if_previous_failure']

    prompt = f"""
    Generate a scene intro for this situation:

    Scene: {scene_skeleton.core_challenge}
    Location: {scene_skeleton.location}
    Theme: {theme}

    Previous Scene Outcome:
    - Result: {previous_outcome['result']}
    - HP Lost: {previous_outcome['hp_lost']}
    - Stress Gained: {previous_outcome['stress_gained']}

    Party State:
    {format_party_state(party_state)}

    Continuity Hook: {hook['context']}

    Write 3-5 sentences that:
    1. Acknowledge previous scene outcome (injuries, stress, etc.)
    2. Set the scene location and atmosphere
    3. Present the core challenge
    4. Maintain theme and tone
    """

    # LLM call, return intro text
```

### Beat Generation

**When**: When player views a beat (after intro or after previous beat resolves)

**How**:
```python
# chains/beat_generator.py
async def generate_beat_choices(
    beat_skeleton: BeatSkeleton,
    scene_context: str,
    party: list[PartyMember],
    theme: str
) -> list[Choice]:
    """
    Generate 3-4 actionable choices for a beat.

    Args:
        beat_skeleton: Core situation and challenge attributes
        scene_context: Current scene narrative state
        party: Available party members
        theme: World theme

    Returns:
        List of Choice objects with actions, DCs, attributes
    """

    prompt = f"""
    Situation: {beat_skeleton.core_situation}
    Theme: {theme}
    Context: {scene_context}

    Challenge Attributes: {beat_skeleton.challenge_attributes}
    Base DC: {beat_skeleton.base_dc}

    Available Characters: {[p.name for p in party]}

    Generate 3-4 distinct action choices:
    1. Each tied to a different attribute ({beat_skeleton.challenge_attributes})
    2. DCs ranging from {beat_skeleton.base_dc - 3} to {beat_skeleton.base_dc + 3}
    3. Thematically appropriate to the situation and world
    4. Clear risk/reward implications

    For each choice:
    - action_text: What the player does
    - attribute: Which stat is checked
    - dc: Difficulty class
    - flaw_triggers: Which character flaws make this harder

    Output as JSON array.
    """

    # LLM call, parse, return Choice objects
```

### Scene Count Dynamics

**Quest Complexity Analysis**:
```python
# chains/quest_analyzer.py
async def analyze_quest_complexity(
    quest: dict,
    full_story: str,
    lore: dict
) -> dict:
    """
    Determine appropriate scene count for quest.

    Returns:
        {
            "min_scenes": 6,
            "max_scenes": 12,
            "estimated_acts": 4,
            "complexity_factors": {
                "scope": "local", # or "regional", "world-ending"
                "factions_involved": 2,
                "relic_importance": "high",
                "narrative_depth": "medium"
            }
        }
    """

    # Analyze quest description for keywords:
    # - "retrieve", "local" → shorter (5-7 scenes)
    # - "prevent", "stop", "save" → medium (8-12 scenes)
    # - "world", "ancient evil", "balance" → longer (12-15 scenes)

    # Factor in number of lore elements involved
    # Factor in quest description length and complexity

    # Return recommended range
```

**Dynamic Continuation & Natural Endings**:

**How LLM Knows When to End**:

The LLM can naturally conclude stories by analyzing quest state and providing clear signals.

**Strategy**:
1. **Pass Quest State to Each Act Generation**:
   ```python
   async def generate_scene_batch(
       quest: dict,
       act_number: int,
       previous_outcomes: list,
       quest_progress: float,  # 0.0 to 1.0
       required_resolution_points: list  # ["find_chronograph", "confront_sophia"]
   ):
       prompt = f"""
       Quest: {quest['title']}
       Current Act: {act_number}
       Quest Progress: {int(quest_progress * 100)}%

       Required to complete quest:
       {format_resolution_points(required_resolution_points)}

       Previous outcomes summary:
       {format_outcomes(previous_outcomes)}

       Generate 3 scenes for this act.

       IMPORTANT:
       - If quest progress ≥ 90% AND all resolution points addressed:
         * This should be the FINAL ACT
         * Scene 3 should resolve the quest (confrontation/climax)
         * Include epilogue elements
         * Set flag: "is_final_act": true

       - If quest progress < 90% OR resolution points remain:
         * Continue building toward climax
         * Advance at least one resolution point
         * Set flag: "is_final_act": false
       """
   ```

2. **Resolution Points Tracking**:
   ```python
   # Defined when quest is generated
   resolution_points = [
       {
           "id": "find_chronograph",
           "description": "Locate and retrieve the stolen chronograph",
           "status": "in_progress",  # not_started, in_progress, completed
           "required_for_ending": True
       },
       {
           "id": "confront_sophia",
           "description": "Confront Lady Sophia Windsor",
           "status": "not_started",
           "required_for_ending": True
       },
       {
           "id": "understand_aetherian_power",
           "description": "Learn why the chronograph is dangerous",
           "status": "in_progress",
           "required_for_ending": False  # Optional subplot
       }
   ]

   # After each scene, update based on story_flags
   if outcome.story_flags.get("found_chronograph"):
       resolution_points["find_chronograph"]["status"] = "completed"
       quest_progress += 0.3
   ```

3. **Final Act Detection**:
   ```go
   // After generating scene batch
   func (h *AdventureHandler) ProcessSceneBatch(batch *SceneBatch) {
       if batch.Metadata.IsFinalAct {
           // Mark session for finale
           session.Status = "finale_in_progress"

           // Scene 3 of final act should trigger completion flow
           lastScene := batch.Scenes[2]
           lastScene.OnComplete = "trigger_quest_completion"
       }
   }
   ```

4. **Finale Scene Structure**:
   ```json
   {
     "scene_number": 12,
     "is_finale": true,
     "core_challenge": "Confront Lady Sophia and secure the chronograph",
     "beats": [
       {
         "beat_number": 1,
         "type": "climax",
         "core_situation": "Face-off with Lady Sophia in her workshop",
         "challenge_attributes": ["influence", "resilience", "lore_mastery"]
       },
       {
         "beat_number": 2,
         "type": "resolution",
         "core_situation": "Decide the fate of the chronograph",
         "choice_consequence": "Determines ending variant"
       },
       {
         "beat_number": 3,
         "type": "epilogue",
         "narrative_only": true,
         "content": "Generated based on player's major choices throughout"
       }
     ]
   }
   ```

5. **Hard Cap Fallback**:
   - After 15 scenes (5 acts): Force finale generation
   - Even if resolution points incomplete
   - Prompt LLM to create "rushed but satisfying" conclusion
   - Better to end than drag on indefinitely

**Quest Progress Calculation**:
```python
def calculate_quest_progress(session) -> float:
    """
    Calculate 0.0 to 1.0 quest completion.

    Factors:
    - Resolution points completed (60% weight)
    - Scenes completed (20% weight)
    - Story flags set (20% weight)
    """
    required_points = [p for p in resolution_points if p["required_for_ending"]]
    completed_required = [p for p in required_points if p["status"] == "completed"]

    points_progress = len(completed_required) / len(required_points)
    scenes_progress = min(session.current_scene_index / 12, 1.0)
    flags_progress = len(session.story_flags) / 10  # Arbitrary: 10 flags = good coverage

    total = (points_progress * 0.6) + (scenes_progress * 0.2) + (flags_progress * 0.2)
    return min(total, 1.0)
```

**Example Progression**:
```
Act 1 (Scenes 1-3):
- Quest progress: 0.15
- Resolution: "find_chronograph" → in_progress
- LLM generates: Introduction to conflict, locate workshop

Act 2 (Scenes 4-6):
- Quest progress: 0.45
- Resolution: "find_chronograph" → completed
- LLM generates: Retrieve chronograph, chase sequence

Act 3 (Scenes 7-9):
- Quest progress: 0.75
- Resolution: "confront_sophia" → in_progress
- LLM generates: Pursue Lady Sophia, allies/betrayals

Act 4 (Scenes 10-12) - FINALE:
- Quest progress: 0.95
- Resolution: ALL required points completed
- LLM detects finale conditions
- Generates: Confrontation, resolution, epilogue
- Session marked "completed"
```

**Benefits**:
- LLM has clear signals for when to end
- Natural story arcs (not abrupt cutoffs)
- Player sees progress toward conclusion
- Prevents endless procedural content
- Allows for satisfying epilogues

---

## Gameplay Mechanics

### Attribute System

Characters have 6 attributes (range 8-18):

| Attribute | Description | Example Uses |
|-----------|-------------|--------------|
| **Lore Mastery** | Knowledge of history, arcane, academic | Decipher ancient texts, recall faction lore, identify relics |
| **Empathy** | Understanding others, emotional intelligence | Comfort allies, sense deception, read motivations |
| **Resilience** | Physical toughness, endurance | Withstand damage, resist poison, push through exhaustion |
| **Creativity** | Innovation, problem-solving, lateral thinking | Improvise solutions, craft items, think outside the box |
| **Influence** | Persuasion, intimidation, leadership | Negotiate, command, inspire, threaten |
| **Perception** | Awareness, spotting details, intuition | Notice traps, track enemies, sense danger |

**Modifier Calculation**:
```
Modifier = floor((Attribute - 10) / 2)

Examples:
- Attribute 8  → Modifier -1
- Attribute 10 → Modifier +0
- Attribute 14 → Modifier +2
- Attribute 18 → Modifier +4
```

### Beat Types

**Challenge Beats** (Most Common):
- Player must make a choice that requires a skill check
- Choices tied to different attributes (perception, influence, etc.)
- Dice roll determines outcome
- Examples: Sneak past guards, convince NPC, find hidden path

**Story Beats** (Narrative Progression):
- Can still have skill checks, but focus on story advancement
- Choices may affect relationship with companions or set story flags
- Can have rolls (e.g., "Comfort your wounded companion" → Empathy check)
- Examples: Character conversations, lore reveals, relationship moments

**Puzzle Beats** (Future Enhancement):
- Present a logical problem or riddle
- Player must figure out correct approach
- May combine narrative clues with skill checks
- Examples: Decode cipher, solve mechanical puzzle, navigate maze

**Combat Beats** (Special Category):
- High-stakes confrontations
- Multiple rolls may be required
- Party members can be wounded
- Examples: Fight guards, flee pursuers, defend position

**Exploration Beats**:
- Discover new locations or information
- Often Perception or Lore Mastery checks
- Success reveals advantages for future beats
- Examples: Scout ahead, search for clues, find alternate routes

### Beat Pacing & Narrative Length

**Avoiding "Button Clicker Syndrome"**:

Each beat should feel substantial, not just "roll dice → see result → next beat". Target length:

**Beat Narrative Structure**:
1. **Setup** (50-100 words): Describe situation, set atmosphere
2. **Choices Presented** (inline with setup)
3. **Player Action** (choice + roll)
4. **Outcome** (150-400 words): Rich narrative consequence, not just "you succeed"

**Example - BAD (Too Short)**:
```
Setup: "You see guards. What do you do?"
Outcome: "You sneak past them."
```

**Example - GOOD (Substantial)**:
```
Setup (75 words):
"Two factory guards lean against the workshop entrance, their steam-
powered rifles gleaming in the gaslight. One smokes a cheap cigar,
the other checks his pocket watch every few seconds—nervous, on edge.
Behind you, the street bustles with evening workers heading home.
Lady Sophia's workshop looms three stories tall, its windows dark
save for a faint blue glow on the top floor. Time is running out."

[Player chooses: Sneak through shadows (Perception DC 15)]
[Player rolls: 17 → Success]

Outcome (250 words):
"You press yourself against the damp brick wall, timing your movement
with the rattle of a passing steam-carriage. The guard with the pocket
watch turns away for just a moment—that's your window.

Emmeline slides into the alley beside the workshop, her boots silent
on the cobblestones. Behind you, the guards continue their patrol,
oblivious. Bob follows close behind, his larger frame making the tight
squeeze more difficult, but you both make it.

The alley is darker here, and you spot what you were hoping for: a
service entrance, half-hidden behind stacked crates. No guards. The
door's lock is old, mechanical—child's play for someone with your
skills.

As you work the lock, you hear it: a faint mechanical humming from
inside, punctuated by the rhythmic pulse of aetherian energy. Lady
Sophia is already experimenting with the chronograph. Every second
counts now.

The lock clicks open.

[Continue] button"
```

**Pacing Guidelines**:
- **Scene intro**: 3-5 sentences (set the scene)
- **Beat setup**: 2-4 sentences (immediate situation)
- **Beat outcome**: 2-4 paragraphs (narrative consequence + next setup)
- **Total reading time per beat**: 30-90 seconds
- **Beats per scene**: 2-3 (not 5-7)

**Why This Matters**:
- Players feel immersed, not rushed
- Outcomes feel meaningful, not arbitrary
- Natural pacing allows tension to build
- Room for character voice and world-building
- Avoids mobile game "tap-tap-tap" feel

### Dice Roll System

**Core Mechanic** (Disco Elysium/D&D hybrid):

```
Roll: d20 + Attribute Modifier
Compare to: DC (Difficulty Class)

Success:  Roll ≥ DC
Partial:  Roll ≥ DC - 5
Failure:  Roll < DC - 5
```

**Difficulty Classes**:
- DC 10: Easy (90% chance with +2 modifier)
- DC 15: Medium (60% chance with +2 modifier)
- DC 18: Hard (35% chance with +2 modifier)
- DC 22: Very Hard (15% chance with +2 modifier)

**Critical Rolls**:
- Natural 20: Critical Success (extra benefit, bonus loot, +XP)
- Natural 1: Critical Failure (extra consequence, -HP, +Stress)

**Example**:
```
Action: "Convince the guard you're authorized" [Influence DC 15]
Character: Bob (Influence 14 → +2 modifier)

Roll: d20 = 13
Total: 13 + 2 = 15
Result: Success! Guard lets you pass.

If rolled 11:
Total: 11 + 2 = 13
Result: Partial. Guard is suspicious but lets you pass with
        an escort, complicating things.

If rolled 7:
Total: 7 + 2 = 9
Result: Failure. Guard calls for backup, combat ensues.
```

### Flaw System

**Flaw Structure**:
- Each character has one flaw selected from 52 predefined templates
- Flaws are stored as structured JSON for reliable gameplay mechanics
- Categories: Physical Injury, Addiction, Phobia, Social Dysfunction, Trauma

**Flaw Template Format**:
```json
{
  "name": "Betrayal Trauma",
  "description": "Was betrayed by trusted ally in the past",
  "trigger": "ally_suspicious,secret_kept,trust_test",
  "penalty": "stress+7,empathy-4,preemptive_hostility",
  "duration": "permanent"
}
```

**Example Flaws Across Categories**:
```
Physical Injury:
- Missing Eye: perception-3 on ranged_combat, distant_objects
- Chronic Pain: all_checks-1, stress+2_per_scene when stress > 20

Addiction:
- Stim Addiction: stress+10, all_checks-2 when no_stims_12_hours
- Combat Junkie: must_pass_resilience_13_or_attack in peaceful situations

Phobia:
- Claustrophobia: stress+8_per_scene, empathy-3 in underground/tunnels
- Fear of Fire: stress+10, flee_or_freeze near fire/explosions

Social:
- Paranoid Distrust: must_pass_empathy_15_or_refuse new allies
- Violent Temper: must_pass_resilience_14_or_attack when insulted

Trauma:
- Combat PTSD: stress+8, pass_resilience_14_or_freeze_1_turn in combat
- Survivor's Guilt: stress+10, empathy-3, self_destructive when companion hurt
```

**Storage & Access**:

**In Generation (lore_pieces.details)**:
```json
{
  "flaw": {
    "name": "Betrayal Trauma",
    "description": "Was betrayed by trusted ally in the past",
    "trigger": "ally_suspicious,secret_kept,trust_test",
    "penalty": "stress+7,empathy-4,preemptive_hostility",
    "duration": "permanent"
  }
}
```

**In Adventure (party_members.flaw column - TEXT)**:
```
{"name":"Betrayal Trauma","description":"Was betrayed...","trigger":"ally_suspicious,secret_kept,trust_test","penalty":"stress+7,empathy-4,preemptive_hostility","duration":"permanent"}
```

**Flaw Detection (Keyword-Based)**:
```python
import json

def check_flaw_trigger(choice: Choice, party_member: PartyMember) -> tuple[bool, dict]:
    """
    Check if choice triggers character's flaw using keyword matching.

    Args:
        choice: Scene choice with flaw_triggers list
        party_member: Character with flaw JSON

    Returns:
        (triggered: bool, flaw_data: dict or None)
    """
    # Parse flaw JSON
    flaw = json.loads(party_member.flaw)

    # Get scene triggers (set by LLM during scene generation)
    scene_triggers = choice.flaw_triggers  # e.g., ["ally_suspicious", "trust_test"]

    # Parse character's flaw triggers
    character_triggers = flaw["trigger"].split(",")
    # e.g., ["ally_suspicious", "secret_kept", "trust_test"]

    # Check for keyword match
    triggered = any(t.strip() in character_triggers for t in scene_triggers)

    return triggered, flaw if triggered else None

# Example usage:
triggered, flaw_data = check_flaw_trigger(choice, party_member)
if triggered:
    print(f"⚠️ {party_member.name}'s {flaw_data['name']} is triggered!")
    apply_flaw_penalty(party_member, flaw_data)
```

**Penalty Application**:
```python
def apply_flaw_penalty(party_member: PartyMember, flaw_data: dict):
    """
    Parse and apply flaw penalty string.

    Penalty formats:
    - "stat+value": Increase stat (e.g., "stress+7")
    - "stat-value": Apply modifier to next check (e.g., "empathy-4")
    - "special_effect": Behavioral flag (e.g., "preemptive_hostility")
    - "must_pass_stat_dc_or_action": Forced save (e.g., "must_pass_resilience_14_or_attack")
    """
    penalty_string = flaw_data["penalty"]
    penalties = penalty_string.split(",")

    for penalty in penalties:
        penalty = penalty.strip()

        # Stat increase: "stress+7"
        if "+" in penalty:
            stat, value = penalty.split("+")
            current = getattr(party_member, stat)
            setattr(party_member, stat, current + int(value))
            log_penalty(f"{stat} increased by {value}")

        # Stat modifier: "empathy-4"
        elif "-" in penalty and not penalty.startswith("-"):
            stat, value = penalty.split("-")
            apply_temp_modifier(party_member, stat, -int(value))
            log_penalty(f"{stat} check receives -{value} penalty")

        # Special effect: "preemptive_hostility"
        elif "_" in penalty:
            apply_special_effect(party_member, penalty)
            log_penalty(f"Special effect: {penalty}")
```

**Gameplay Integration**:

**During Scene Choice Resolution**:
```python
async def resolve_choice(session_id: int, choice_index: int):
    # 1. Get party and current scene
    party = get_party_members(session_id)
    scene = get_current_scene(session_id)
    choice = scene.choices[choice_index]

    # 2. Check if acting character's flaw triggers
    acting_character = get_selected_character()
    triggered, flaw_data = check_flaw_trigger(choice, acting_character)

    if triggered:
        # 3. Show UI warning
        display_flaw_warning(acting_character, flaw_data)

        # 4. Apply penalties before roll
        apply_flaw_penalty(acting_character, flaw_data)

        # 5. Add narrative flavor
        add_narrative(f"{acting_character.name} struggles with {flaw_data['name']}...")

    # 6. Proceed with dice roll (with any modifiers applied)
    perform_attribute_check(acting_character, choice)
```

**UI Display Examples**:

**Character Card (Generation Phase)**:
```
┌─────────────────────────────────┐
│ FLAW                            │
│ Betrayal Trauma                 │ ← Bold name
│ Was betrayed by trusted ally... │ ← Description
│                                 │
│ [Hover for mechanics]           │
└─────────────────────────────────┘
```

**Tooltip (on hover)**:
```
Trigger: ally_suspicious, secret_kept, trust_test
Penalty: stress+7, empathy-4, preemptive_hostility
Duration: permanent
```

**Adventure Warning**:
```
┌────────────────────────────────────┐
│ ⚠️ Flaw Triggered!                 │
│                                    │
│ Augusta's Betrayal Trauma          │
│ Was betrayed by trusted ally...    │
│                                    │
│ Effects:                           │
│ • Stress +7 (now 27)               │
│ • Empathy -4 on this check         │
│ • Preemptive hostility active      │
│                                    │
│    [Proceed] [Choose Other]        │
└────────────────────────────────────┘
```

**Flaw Template List** (52 total):
See `python-service/generate/flaw_templates.py` for complete list.

**Template Categories**:
- Physical Injury (15): missing_eye, bad_leg, hand_tremor, chronic_pain, etc.
- Addiction (8): stim_addiction, alcohol_dependence, combat_junkie, etc.
- Phobia (12): claustrophobia, fear_of_heights, fear_of_fire, etc.
- Social (10): distrust_everyone, violent_temper, social_anxiety, etc.
- Trauma (7): combat_ptsd, survivors_guilt, torture_scars, etc.

**Future Enhancements**:
- Character growth: Reduce flaw penalties over successful sessions
- Narrative recognition: Bonus rewards for succeeding despite flaw trigger
- Companion flaws interact: Phobias/traumas can cascade in party dynamics

---

### Skills System

**Purpose**: Skills gate certain choices and unlock special actions.

**Storage**:
- JSONB array in `party_members.skills`: `["Lockpicking", "Battle Cry Fury", "Runic Tattoo Reading"]`
- 3-7 skills per character (AI-generated based on backstory)

**Mechanic**: Choice Unlocking

Skills determine **which choices are available** to the party, not bonuses to rolls (attributes handle that).

**Scene Generation**:
```json
{
  "choices": [
    {
      "text": "Pick the lock",
      "attribute": "creativity",
      "dc": 15,
      "required_skill": "Lockpicking"
    },
    {
      "text": "Bribe the guard",
      "attribute": "influence",
      "dc": 12,
      "required_skill": null  // Anyone can attempt
    },
    {
      "text": "Intimidate with Battle Cry",
      "attribute": "influence",
      "dc": 10,
      "required_skill": "Battle Cry Fury"
    }
  ]
}
```

**Frontend Check**:
```typescript
// When displaying choices, check if party has required skill
function isChoiceAvailable(choice: Choice, party: PartyMember[]): boolean {
  if (!choice.required_skill) return true; // No skill required

  // Check if ANY party member has the skill
  return party.some(member =>
    member.skills.includes(choice.required_skill)
  );
}

// UI Display:
// Available choice: Normal button
// Unavailable choice: Grayed out + tooltip "Requires: Lockpicking"
```

**Gameplay Impact**:
- **Party composition matters**: Different companions unlock different paths
- **Replayability**: Try world again with different companions = different available choices
- **Strategic depth**: "Do we bring the lockpicker or the diplomat?"

**Example Skills by Archetype**:
- **Warrior**: Combat Tactics, Weapon Mastery, Intimidation
- **Rogue**: Lockpicking, Stealth, Trap Detection, Sleight of Hand
- **Scholar**: Ancient Languages, Arcane Knowledge, Research
- **Diplomat**: Negotiation, Reading People, Etiquette
- **Tinker**: Mechanical Repair, Crafting, Engineering

**Balance**:
- Not all choices should require skills (most are attribute-based)
- Skills add flavor and strategic choice, not mandatory gates
- Estimate: 20-30% of choices skill-gated, 70-80% available to all

---

### Traits System

**Purpose**: Personality flavor + minor situational modifiers + AI context.

**Storage**:
- JSONB array in `party_members.personality_traits`: `["Fearless", "Honorable", "Competitive"]`
- Exactly 3 traits per character (standardized list of ~50 traits)

**Primary Use**: AI Generation Context

Traits are primarily used by AI to generate contextual narratives:

**1. Dynamic Scene Intros**:
```python
# AI prompt includes traits
generate_scene_intro(
    scene_skeleton=scene,
    party_state={
        "members": [
            {"name": "Erik", "traits": ["Fearless", "Honorable", "Competitive"]},
            {"name": "Kira", "traits": ["Reckless", "Loyal", "Perceptive"]}
        ]
    }
)

# Output acknowledges traits:
"Erik strides forward fearlessly, his hand on his sword hilt. Kira hangs
back, her sharp eyes scanning for danger—she's reckless but not stupid."
```

**2. Camp Events**:
```python
# AI generates character interactions based on traits
camp_event = generate_camp_event(
    party=[
        {"name": "Erik", "traits": ["Competitive", "Honorable"]},
        {"name": "Bob", "traits": ["Cautious", "Analytical"]}
    ]
)

# Output:
"Erik challenges Bob to a sparring match. 'Come on, it'll keep us sharp!'
Bob shakes his head. 'We need to conserve energy. Be smart about this.'"
```

**Secondary Use**: Optional Situational Modifiers (LIGHTWEIGHT)

Traits can provide **small, situational bonuses/penalties** when relevant:

```typescript
// In choice resolution (Go service):
function calculateFinalDC(
  choice: Choice,
  character: PartyMember,
  situation: string
): number {
  let dc = choice.base_dc;

  // OPTIONAL: Apply trait modifiers (keep minimal)
  if (character.traits.includes("Fearless") && situation === "intimidation") {
    dc -= 2;  // Easier to intimidate when you're fearless
  }

  if (character.traits.includes("Cowardly") && choice.is_brave_action) {
    dc += 2;  // Harder for cowards to do brave things
  }

  if (character.traits.includes("Analytical") && choice.type === "puzzle") {
    dc -= 2;  // Analytical minds excel at puzzles
  }

  return dc;
}
```

**Trait Categories** (Standardized List):

**Courage**: Fearless, Brave, Cowardly, Cautious
**Morality**: Honorable, Ruthless, Compassionate, Cynical
**Social**: Charismatic, Awkward, Loyal, Manipulative
**Intellect**: Analytical, Perceptive, Naive, Curious
**Temperament**: Competitive, Calm, Hotheaded, Patient
**Motivation**: Ambitious, Content, Reckless, Careful

**Balance Guidelines**:
- **Narrative > Mechanical**: Traits are primarily flavor for AI generation
- **Keep modifiers minimal**: -2 or +2 DC at most, only when directly relevant
- **Don't gate choices**: Skills gate choices, traits just add flavor
- **Avoid complexity**: No complicated trait interaction systems

**Example Trait Effects** (OPTIONAL - can be added later):
```typescript
const TRAIT_MODIFIERS = {
  "Fearless": { situations: ["intimidation", "brave_action"], modifier: -2 },
  "Cowardly": { situations: ["brave_action", "combat_start"], modifier: +2 },
  "Analytical": { situations: ["puzzle", "investigation"], modifier: -2 },
  "Perceptive": { situations: ["perception_check", "ambush"], modifier: -1 },
  "Hotheaded": { situations: ["negotiation", "patience_test"], modifier: +2 },
  "Charismatic": { situations: ["persuasion", "first_impression"], modifier: -1 }
};
```

**UI Display**:
- Character card: Show 3 traits as colored badges
- Tooltip: Brief description of what trait means
- NO mechanical details shown (keep it narrative)

---

### Character Mechanics Summary

**Hierarchy of Systems**:

1. **Attributes** (Core Mechanic - Always Active)
   - 6 stats: Knowledge, Empathy, Resilience, Creativity, Influence, Perception
   - Range: 8-18
   - Used for: d20 + modifier vs DC on every check
   - **Impact**: Major (determines success/failure)

2. **Flaws** (Conditional Penalties - Trigger-Based)
   - 1 flaw per character
   - Structure: `{name, description, trigger, penalty, duration}`
   - Used for: Apply penalties when trigger keywords match
   - **Impact**: Moderate (adds risk/drama to specific situations)

3. **Skills** (Choice Gating - Unlock Paths)
   - 3-7 skills per character
   - Array: `["Lockpicking", "Combat Tactics", ...]`
   - Used for: Determine which choices are available
   - **Impact**: Strategic (party composition matters)

4. **Traits** (Narrative Flavor - AI Context)
   - Exactly 3 traits per character
   - Array: `["Fearless", "Honorable", "Competitive"]`
   - Used for: AI narrative generation + optional minor DC modifiers
   - **Impact**: Light (enhances immersion, minimal mechanical effect)

**Design Philosophy**:
- Attributes are the foundation (D&D-style)
- Flaws add drama and consequence (Darkest Dungeon-style)
- Skills add strategic depth (party composition matters)
- Traits add personality (narrative > mechanical)

### Health & Stress

**Health (HP)**:
- Starting: 50-150 (AI-generated based on character type)
- Lost through: Failed combat rolls, traps, certain choices
- Regained through: Healing items, camp rest, successful scenes
- 0 HP:
  - Protagonist → Game Over
  - Companion → Death event, removed from party

**Stress**:
- Starting: 0-50 (AI-generated, usually 0-25 for most characters)
- Maximum: 100 (or 150? TBD)
- Gained through:
  - Failed rolls: +5-10
  - Dangerous situations: +5-15
  - Witnessing companion death: +20
  - Flaw triggers: +5
  - Story events: Variable
- Reduced through:
  - Camp rest: -20
  - Stress relief items: -10 to -20
  - Successful key scenes: -5

**Stress Thresholds**:
- 0-50: Normal
- 51-74: Tense (minor UI indicator)
- 75-99: Breaking Point (breakpoint event, penalties)
- 100+: Breakdown (severe breakpoint event, major penalties)

---

## Camp & Rest System

### When Camps Occur

**Triggered After**:
- Every 3 scenes (end of Act 1, Act 2, etc.)
- Not triggered after final scene

**Example Timing**:
```
Scenes 1-3 → Camp
Scenes 4-6 → Camp
Scenes 7-9 → Camp
Scenes 10-12 → Finale (no camp)
```

### Camp Event Generation

**AI-Generated Narrative**:
```python
# chains/camp_event_generator.py
async def generate_camp_event(
    theme: str,
    party: list[PartyMember],
    recent_scenes: list[SceneOutcome],
    quest_progress: float
) -> str:
    """
    Generate a short narrative camp event.

    Args:
        theme: World theme
        party: Current party members
        recent_scenes: Last 3 scene outcomes
        quest_progress: 0.0 to 1.0

    Returns:
        2-4 paragraph camp narrative
    """

    prompt = f"""
    Theme: {theme}
    Party: {[p.name for p in party]}
    Recent Events: {summarize_scenes(recent_scenes)}
    Quest Progress: {int(quest_progress * 100)}%

    Generate a camp/rest scene:
    1. Characters interact naturally
    2. Reflect on recent events
    3. Build character relationships
    4. Hint at upcoming challenges (subtle foreshadowing)
    5. Match theme and tone

    Length: 2-4 paragraphs
    Tone: Reflective but forward-looking

    DO NOT:
    - Force exposition
    - Break character voice
    - Spoil upcoming scenes
    """

    # LLM call, return camp narrative
```

**Example Camp Events**:

*Steampunk theme, after tough combat:*
```
The abandoned factory provides shelter from the rain. Emmeline
kneels beside a broken steam engine, unable to resist the urge
to tinker despite her exhaustion. Bob watches from the doorway,
keeping watch for Kraelion patrols.

"We're getting closer," Bob says quietly. "Lady Sophia won't
give up the chronograph easily."

Emmeline's fingers pause on a gear. "Then we'd better be ready
for whatever she's prepared." She glances at the bruises on her
arms, reminders of the guard fight. "We can't afford another
mistake like that."

As the rain drums on the metal roof, both of you know: the
hardest challenges still lie ahead.
```

### Camp Mechanics

**Automatic Effects**:
```python
# Applied when entering camp
for party_member in party:
    party_member.stress = max(0, party_member.stress - 20)
    # HP remains unchanged (must use items for healing)
```

**Player Actions**:
1. **Use Items**:
   - Select consumables from inventory
   - Apply effects (heal HP, reduce stress, etc.)

2. **View Stats**:
   - See detailed party status
   - Review equipment

3. **Review Progress**:
   - See quest completion percentage
   - Review major story beats

4. **Continue Journey**:
   - Advances to next act
   - Triggers background batch generation if needed

### Background Scene Generation

**Pre-generation Strategy**:

Camps are perfect opportunities to generate the next act's content while the player is reading/resting. This eliminates loading screens during gameplay.

**IMPORTANT**: Since scene batches are world-scoped, we check if batches already exist for this world before generating. Only the first player to reach each act triggers generation - subsequent players use cached content.

**Timing**:
- **Act 1 scenes**: Generated when first player starts adventure (before party selection)
- **Act 2 scenes**: Generated in background during Act 1 Camp (if not already cached)
- **Act 3+ scenes**: Generated during previous act's camp (if not already cached)
- **Final act**: Detected dynamically, generates finale scene

**Implementation**:
```python
# go-service/internal/api/adventure_handler.go
func (h *AdventureHandler) EnterCamp(c *gin.Context) {
    sessionID := c.Query("session_id")

    // 1. Generate camp event narrative (quick, 2-4 paragraphs)
    campEvent, err := h.pythonClient.GenerateCampEvent(ctx, &pb.CampEventRequest{
        Theme: session.World.Theme,
        Party: session.Party,
        RecentScenes: session.LastThreeScenes,
        QuestProgress: session.QuestProgress,
    })

    // 2. Apply automatic stress reduction
    for _, member := range session.Party {
        member.Stress = max(0, member.Stress - 20)
        h.store.UpdatePartyMember(member)
    }

    // 3. Check if next act batch already exists for this world (world-scoped)
    nextAct := session.CurrentAct + 1
    go func() {
        // Check if batch already exists for this world
        existingBatch, err := h.store.GetSceneBatchByWorld(session.WorldID, nextAct)
        if err == nil && existingBatch != nil {
            log.Info("Act batch already exists for world", "world_id", session.WorldID, "act", nextAct)
            return // Already generated by another player, skip
        }

        // This runs in background while player reads camp event
        batch, err := h.pythonClient.GenerateSceneBatch(ctx, &pb.SceneBatchRequest{
            Quest: session.World.Quest,
            Lore: session.World.Lore,
            ActNumber: nextAct,
            PreviousOutcomes: session.GetActSummary(session.CurrentAct),
        })

        if err != nil {
            log.Error("Failed to pre-generate next act", err)
            // Graceful degradation: generate when player advances instead
            return
        }

        // Save to scene_batches table with world_id (shared across all sessions)
        h.store.SaveSceneBatch(session.WorldID, nextAct, batch)
        log.Info("Pre-generated act", nextAct, "for world", session.WorldID, "during camp")
    }()

    // 4. Return camp event to player immediately (don't block)
    c.JSON(200, gin.H{
        "camp_event": campEvent.Narrative,
        "stress_reduced": 20,
        "party": session.Party,
    })
}
```

**Fallback Handling**:
```python
# When player clicks "Continue Journey" after camp
func (h *AdventureHandler) AdvanceToNextAct(c *gin.Context) {
    nextAct := session.CurrentAct + 1

    // Check if batch already exists for this world (world-scoped)
    batch, err := h.store.GetSceneBatchByWorld(session.WorldID, nextAct)

    if err != nil || batch == nil {
        // Batch not ready yet (slow generation, error, or first player)
        // Generate now and wait
        batch, err = h.pythonClient.GenerateSceneBatch(...)
        if err != nil {
            return c.JSON(500, gin.H{"error": "Failed to generate scenes"})
        }
        // Save with world_id so all future sessions can use it
        h.store.SaveSceneBatch(session.WorldID, nextAct, batch)
    }

    // Proceed with next act
    session.CurrentAct = nextAct
    session.CurrentSceneIndex = 0
    c.JSON(200, gin.H{"scene": batch.Scenes[0]})
}
```

**User Experience**:
- **First player** (generating new content):
  - Player reads camp event (30-60 seconds), batch generates in background, click "Continue" → instant transition
  - Worst case: Generation fails/slow, player waits when clicking "Continue"
  - Average case: By the time player finishes reading camp event, batch is ready
- **Subsequent players** (using cached content):
  - Click "Continue" → **instant transition** (no generation, loading from database)
  - Significantly better UX for replays and popular worlds

**Generation Time Estimates**:
- Camp event: 2-4 seconds (small, 2-4 paragraphs)
- Scene batch (3 scenes with outcome branches): 15-30 seconds
- Player reading time: 30-90 seconds
- **Result**: Batch ready before player clicks "Continue" 90% of the time

**Monitoring**:
```go
// Log metrics to track pre-generation success rate
metrics.IncrementCounter("camp.batch_pregeneration", map[string]string{
    "act": strconv.Itoa(nextAct),
    "status": "started",
})

// When player advances
if batchAlreadyExists {
    metrics.IncrementCounter("camp.batch_pregeneration", map[string]string{
        "act": strconv.Itoa(nextAct),
        "status": "cache_hit",
    })
} else {
    metrics.IncrementCounter("camp.batch_pregeneration", map[string]string{
        "act": strconv.Itoa(nextAct),
        "status": "cache_miss",
    })
}
```

---

## Inventory System

### Item Types

| Type | Description | Stackable | Examples |
|------|-------------|-----------|----------|
| **Consumable** | Single-use items | Yes | Healing Potion, Smoke Bomb, Stress Tea |
| **Equipment** | Wearable/held items | No | Clockwork Sword, Leather Armor, Aetherian Lens |
| **Quest Item** | Required for story | No | Stolen Chronograph, Workshop Key, Letter of Passage |
| **Crafting** | Used to make other items | Yes | Gears, Aether Crystals, Scrap Metal |

### Storage Types

**Shared Party Inventory**:
- `party_member_id = NULL`
- Accessible by all characters
- Quest items always here
- Consumables here by default

**Character-Specific Inventory**:
- `party_member_id` set
- Equipment slots (weapon, armor)
- Personal items
- When character dies, items can be retrieved by party

### Item Effects

**Defined in JSONB**:
```json
// Healing Potion
{
  "type": "heal",
  "value": 20,
  "target": "single"
}

// Stress Relief Tea
{
  "type": "stress_relief",
  "value": 15,
  "target": "single"
}

// Clockwork Blade
{
  "type": "stat_buff",
  "stat": "resilience",
  "value": 2,
  "duration": "permanent",
  "equipment_slot": "weapon"
}

// Aetherian Lens
{
  "type": "stat_buff",
  "stat": "perception",
  "value": 3,
  "duration": "permanent",
  "equipment_slot": "accessory"
}

// Smoke Bomb
{
  "type": "modifier",
  "effect": "advantage_on_next_stealth",
  "duration": "next_scene"
}
```

### Starting Inventory (Dynamic Generation)

**Philosophy**:
- Starting inventory should reflect the protagonist and world, not be hardcoded
- Different protagonists = different starting items
- World relic/theme should influence items

**Generation Timing**:
- When adventure starts (after party selection, before first scene)
- Python chain generates 3-5 thematically appropriate items

**Implementation**:
```python
# adventure/chains/starting_inventory_generator.py
async def generate_starting_inventory(
    protagonist: dict,
    world: dict
) -> list[dict]:
    """
    Generate 3-5 starting items based on protagonist and world.

    Args:
        protagonist: Protagonist character data
        world: World lore (theme, relic, setting)

    Returns:
        List of item dicts
    """

    prompt = f"""
    Theme: {world['theme']}
    Setting: {world['setting']['name']} - {world['setting']['description']}
    Relic in this world: {world['relic']['name']}

    Protagonist: {protagonist['name']}
    Skills: {protagonist['skills']}
    Personality: {protagonist['personality']}

    Generate 3-5 starting items this character would have:
    1. One healing item (e.g., bandages, potion, medkit)
    2. One utility item related to their skills
    3. 1-3 thematic items based on world/setting
    4. Optionally: A lesser version of the world's relic (if it makes sense)

    For each item:
    - Name: Thematic to world
    - Description: 1-2 sentences
    - Type: consumable, equipment, crafting
    - Effect: Appropriate to item purpose

    Examples:
    - Steampunk mechanic: "Clockwork Repair Kit", "Steam-Powered Torch", "Healing Salve"
    - Fantasy wizard: "Minor Healing Potion", "Spellbook Fragment", "Crystal Focus"
    - Cyberpunk hacker: "Stim Pack", "Hacking Tool", "Encrypted Data Chip"

    Output as JSON array of items.
    """

    items = await llm_generate(prompt)
    return items


# Example output for Emmeline (steampunk mechanic):
[
    {
        "name": "Clockwork Repair Kit",
        "description": "A worn leather case containing precision tools, gears, and springs. Essential for any mechanic.",
        "type": "consumable",
        "effect": {"type": "stat_buff", "stat": "creativity", "value": 2, "duration": "one_use"}
    },
    {
        "name": "Minor Healing Salve",
        "description": "A small tin of medicinal paste. Smells of herbs and oil.",
        "type": "consumable",
        "effect": {"type": "heal", "value": 15}
    },
    {
        "name": "Steam-Powered Lantern",
        "description": "A brass lantern that runs on pressurized steam. Lights the darkest workshops.",
        "type": "equipment",
        "effect": {"type": "stat_buff", "stat": "perception", "value": 1, "duration": "permanent"}
    },
    {
        "name": "Broken Chronometer",
        "description": "A damaged pocket watch with aetherian crystals. You found it years ago. It doesn't tell time, but sometimes it hums with energy.",
        "type": "quest_item",
        "effect": {"type": "lore_hint", "reveals": "aetherian_sensitivity"}
    }
]
```

**Go Integration**:
```go
// When player confirms party
func (h *AdventureHandler) ConfirmParty(c *gin.Context) {
    // ... save party members ...

    // Generate starting inventory
    items, err := h.pythonClient.GenerateStartingInventory(ctx, &pb.StartingInventoryRequest{
        Protagonist: session.Protagonist,
        World: session.World,
    })

    // Save items to inventory_items table (party_member_id = NULL = shared)
    for _, item := range items {
        h.store.CreateInventoryItem(session.ID, nil, item)
    }

    c.JSON(200, gin.H{
        "party": session.Party,
        "starting_items": items,
    })
}
```

### Item Generation During Scenes

**During Scenes**:
```python
# In beat outcome generation
outcome = {
    "narrative": "You find a hidden cache in the workshop...",
    "hp_change": 0,
    "stress_change": -5,
    "items_gained": [
        {
            "name": "Clockwork Repair Kit",
            "description": "A worn leather case containing precision tools",
            "type": "consumable",
            "effect": {"type": "stat_buff", "stat": "creativity", "value": 2, "duration": "one_use"}
        }
    ]
}
```

**Thematic Consistency**:
- AI generates items based on world theme
- Steampunk: Gears, steam-powered gadgets, clockwork devices
- Fantasy: Potions, scrolls, enchanted weapons
- Cyberpunk: Stims, cybernetic upgrades, hacking tools

**Integration with World Relics**:
- Quest might involve world's relic (e.g., Aetherian Chronograph)
- Relic is quest item, not usable equipment
- Can find "lesser" versions (e.g., Broken Chronometer that gives +1 Lore Mastery)

### Using Items

**Consumables**:
- Can be used at camp or during scenes (if scene allows)
- Applied immediately, removed from inventory

**Equipment**:
- Equipped from character inventory screen
- Provides permanent buff while equipped
- Only one per slot (weapon, armor, accessory)

**Quest Items**:
- Cannot be used manually
- Automatically checked during relevant scenes
- "You have the Workshop Key, allowing you to unlock the door..."

---

## Breakpoint Events

### When Breakpoints Trigger

**Character Death (HP = 0)**:
- Triggers death event
- Character removed from party
- If protagonist → Game Over

**High Stress (≥75)**:
- First threshold: Warning event, minor penalties
- Second threshold (≥100): Breakdown event, major penalties

**Other Potential Breakpoints** (future):
- All items lost
- Critical quest failure
- Time limit exceeded

### Death Events

**Companion Death**:
```python
# When companion HP reaches 0
async def handle_companion_death(
    companion: PartyMember,
    scene_context: str,
    theme: str
) -> BreakpointEvent:
    """
    Generate companion death narrative.

    Uses Python chain for personalized, emotional narrative.
    """

    prompt = f"""
    Theme: {theme}
    Character: {companion.name}
    Description: {companion.description}
    Flaw: {companion.flaw}

    Death Context: {scene_context}

    Generate a 2-3 paragraph death scene:
    1. How they died (based on context)
    2. Last words or final action
    3. Impact on remaining party
    4. Tone: Respectful, emotionally resonant, fitting theme

    This is a meaningful character moment.
    """

    narrative = await llm_generate(prompt)

    return BreakpointEvent(
        type="companion_death",
        narrative=narrative,
        effects={
            "remove_character": companion.id,
            "stress_to_party": 20,
            "remove_companion_items": True
        }
    )
```

**Protagonist Death**:
```python
# When protagonist HP reaches 0
async def handle_protagonist_death(
    protagonist: PartyMember,
    scene_context: str,
    theme: str,
    quest: dict
) -> GameOverEvent:
    """
    Generate protagonist death narrative and game over.
    """

    prompt = f"""
    Theme: {theme}
    Protagonist: {protagonist.name}
    Quest: {quest['title']}

    Death Context: {scene_context}

    Generate a dramatic game over scene:
    1. How the protagonist died
    2. Quest outcome (failed, villain wins, etc.)
    3. Epilogue: What happens to the world
    4. Tone: Tragic but respectful, fitting theme

    Length: 3-4 paragraphs
    """

    narrative = await llm_generate(prompt)

    # Mark session as failed
    await update_session_status(session_id, 'failed')

    return GameOverEvent(
        narrative=narrative,
        allow_retry=True
    )
```

### Stress Events

**Threshold: 75-99** (Breaking Point):

**Go Templates** (random selection):
```go
var stress75Templates = []string{
    "{character} snaps at {companion}, harsh words creating tension.",
    "{character} becomes withdrawn, refusing to communicate.",
    "{character}'s hands shake uncontrollably, affecting their focus.",
    "{character} second-guesses every decision, slowing the party.",
}
```

**Mechanical Effect**:
- Next scene: -2 to all rolls (or disadvantage on one attribute)
- Can be cleared with stress relief item or camp

**Threshold: ≥100** (Breakdown):

**Python Chain** (personalized to flaw):
```python
async def generate_stress_breakdown(
    character: PartyMember,
    scene_context: str,
    theme: str
) -> BreakpointEvent:
    """
    Generate severe stress breakdown based on character's flaw.
    """

    prompt = f"""
    Theme: {theme}
    Character: {character.name}
    Flaw: {character.flaw}
    Stress Level: {character.stress}

    Context: {scene_context}

    The character's stress has reached a breaking point.
    Generate a breakdown scene where their flaw manifests severely:

    Example: If flaw is "compulsive repairer", they might stop mid-
    combat to fix a broken machine, endangering everyone.

    1. Describe the breakdown (2-3 sentences)
    2. How it affects the current situation
    3. Mechanical consequence (suggest penalty)

    Tone: Intense but in-character
    """

    result = await llm_generate(prompt)

    return BreakpointEvent(
        type="stress_breakdown",
        narrative=result['narrative'],
        effects={
            "character_id": character.id,
            "penalty": "cannot_act_this_scene",  # or "disadvantage_all_rolls"
            "stress_increase": 10  # Spiraling
        }
    )
```

**Mechanical Effects**:
- Cannot act in current scene (sits out)
- OR: Disadvantage on all rolls for next 2 scenes
- Stress does not reduce until camp

---

## Technical Architecture

### Service Responsibilities

**Go Service** (REST API + Database + State Management):
- All HTTP endpoints for frontend
- Database operations (PostgreSQL)
- Redis caching for active sessions
- Session lifecycle management
- Party/inventory state management
- Dice rolling and game mechanics
- Calls Python via gRPC for AI generation

**Python Service** (AI Generation ONLY):
- **NO** database operations
- **NO** Redis caching
- **NO** state management
- Receives context via gRPC request parameters
- Generates AI content using LLM
- Returns generated content to Go
- Completely stateless (can scale horizontally)

**Important**: Python service does NOT use Redis. All caching is handled by Go service.

### Backend Structure

```
/go-service/
├── internal/
│   ├── api/
│   │   ├── adventure_handler.go      [NEW]
│   │   ├── lore_handler.go
│   │   ├── user_handler.go
│   │   └── world_handler.go
│   ├── store/
│   │   ├── adventure_store.go        [NEW]
│   │   ├── party_store.go            [NEW]
│   │   ├── inventory_store.go        [NEW]
│   │   ├── scene_store.go            [NEW]
│   │   ├── lore_store.go
│   │   ├── user_store.go
│   │   └── world_store.go
│   ├── middleware/
│   │   └── auth.go
│   └── utils/
│       └── helpers.go
└── migrations/
    └── 00007_create_adventure_tables.sql  [NEW]

/python-service/
├── adventure/                         [NEW]
│   ├── __init__.py
│   ├── orchestrators/
│   │   └── adventure_orchestrator.py
│   ├── chains/
│   │   ├── quest_analyzer.py
│   │   ├── companion_generator.py
│   │   ├── scene_batch_generator.py
│   │   ├── scene_intro_generator.py
│   │   ├── beat_generator.py
│   │   ├── camp_event_generator.py
│   │   └── breakpoint_generator.py
│   ├── models/
│   │   ├── scene.py
│   │   ├── party.py
│   │   ├── memory.py
│   │   └── outcome.py
│   └── services/
│       └── dice_roller.py (optional, could be in Go)
├── chains/
│   └── (existing lore generation chains)
└── services/
    └── llm_client.py

/frontend/
├── app/
│   ├── worlds/
│   │   └── [id]/
│   │       ├── adventure/            [NEW]
│   │       │   ├── page.tsx          (adventure hub)
│   │       │   ├── party/
│   │       │   │   └── page.tsx      (party selection)
│   │       │   ├── play/
│   │       │   │   └── page.tsx      (scene gameplay)
│   │       │   └── complete/
│   │       │       └── page.tsx      (completion screen)
│   │       └── page.tsx              (world detail)
└── components/
    ├── adventure/                     [NEW]
    │   ├── PartyCard.tsx
    │   ├── SceneView.tsx
    │   ├── ChoiceCard.tsx
    │   ├── DiceRoller.tsx
    │   ├── PartyBar.tsx
    │   ├── CampScreen.tsx
    │   └── CharacterModal.tsx
    └── (existing components)
```

### API Endpoints

**Go Service** (`/go-service/internal/api/adventure_handler.go`):

```go
// Initialize new adventure session
POST /api/adventure/start
Body: {
    "world_id": 123
}
Response: {
    "session_id": 456,
    "protagonist": {...}
}

// Generate companion suggestions
POST /api/adventure/companions/generate
Body: {
    "session_id": 456,
    "regenerate": false  // true if regenerating
}
Response: {
    "companions": [...]  // 3 companions
}

// Confirm party selection
POST /api/adventure/party/confirm
Body: {
    "session_id": 456,
    "selected_companion_ids": [1, 2]  // IDs from generation, or empty array
}
Response: {
    "party": [...]  // Saved party members
}

// Get current scene (generates if needed)
GET /api/adventure/scene?session_id=456
Response: {
    "scene_number": 2,
    "act_number": 1,
    "intro_narrative": "...",
    "current_beat": {
        "beat_number": 1,
        "narrative": "...",
        "choices": [...]
    }
}

// Resolve a choice (roll dice, get outcome)
POST /api/adventure/resolve
Body: {
    "session_id": 456,
    "choice_id": "...",
    "party_member_id": 789
}
Response: {
    "roll": 15,
    "modifier": 2,
    "dc": 15,
    "total": 17,
    "outcome": "success",
    "narrative": "...",
    "consequences": {
        "hp_change": -10,
        "stress_change": 5,
        "items_gained": [...]
    },
    "breakpoint_event": null  // or event object
}

// Get current session state
GET /api/adventure/state?session_id=456
Response: {
    "session": {...},
    "party": [...],
    "inventory": [...],
    "current_scene": 2,
    "current_act": 1,
    "quest_progress": 0.35
}

// Enter camp/rest
POST /api/adventure/camp
Body: {
    "session_id": 456
}
Response: {
    "camp_event": "...",
    "effects_applied": {
        "stress_reduction": 20
    }
}

// Use item
POST /api/adventure/item/use
Body: {
    "session_id": 456,
    "item_id": 123,
    "target_party_member_id": 789  // null if party-wide
}
Response: {
    "success": true,
    "effect_applied": {...}
}
```

### gRPC Extensions

**Add to `lore.proto`**:

```protobuf
service LoreService {
  // ... existing methods

  rpc GenerateCompanions (CompanionsRequest) returns (CompanionsResponse);
  rpc GenerateSceneBatch (SceneBatchRequest) returns (SceneBatchResponse);
  rpc GenerateSceneIntro (SceneIntroRequest) returns (SceneIntroResponse);
  rpc GenerateBeatChoices (BeatChoicesRequest) returns (BeatChoicesResponse);
  rpc GenerateCampEvent (CampEventRequest) returns (CampEventResponse);
  rpc GenerateBreakpointEvent (BreakpointEventRequest) returns (BreakpointEventResponse);
  rpc AnalyzeQuestComplexity (QuestComplexityRequest) returns (QuestComplexityResponse);
}

message CompanionsRequest {
  string theme = 1;
  LorePiece protagonist = 2;
  repeated LorePiece world_lore = 3;
  int32 count = 4;
}

message CompanionsResponse {
  repeated Companion companions = 1;
}

message Companion {
  string name = 1;
  string description = 2;
  string relationship_to_protagonist = 3;
  map<string, string> stats = 4;  // hp, stress, attributes
  string skills = 5;
  string flaw = 6;
  string personality = 7;
  string appearance = 8;
}

message SceneBatchRequest {
  map<string, string> quest = 1;  // title, description
  map<string, LorePiece> lore = 2;  // faction, setting, event, relic
  int32 act_number = 3;
  repeated SceneOutcome previous_outcomes = 4;
}

message SceneBatchResponse {
  repeated SceneSkeleton scenes = 1;
}

message SceneSkeleton {
  int32 scene_number = 1;
  string core_challenge = 2;
  string challenge_type = 3;
  repeated string key_npcs = 4;
  string location = 5;
  string stakes = 6;
  map<string, string> continuity_hooks = 7;  // JSON strings
  repeated BeatSkeleton beats = 8;
}

message BeatSkeleton {
  int32 beat_number = 1;
  string core_situation = 2;
  repeated string challenge_attributes = 3;
  int32 base_dc = 4;
}

// ... similar for other requests/responses
```

### State Management

**Adventure Orchestrator** (Python):

```python
# adventure/orchestrators/adventure_orchestrator.py

class AdventureOrchestrator:
    def __init__(self, session_id: int):
        self.session_id = session_id
        self.session = self.load_session()
        self.memory = SceneMemory()
        self.llm = get_llm()

    def load_session(self) -> Session:
        """Load session from DB (via gRPC to Go service)"""
        # Request full session state from Go
        pass

    async def should_generate_batch(self) -> bool:
        """Check if we need to generate next scene batch"""
        current_scene = self.session.current_scene_index
        current_act = self.session.current_act

        # Check if batch exists for current act
        batch_exists = await self.check_batch_exists(current_act)
        return not batch_exists

    async def generate_scene_batch(self) -> list[SceneSkeleton]:
        """Generate 3-scene batch for current act"""
        from chains.scene_batch_generator import generate_scene_batch

        quest = self.session.world.quest
        lore = self.session.world.lore_pieces
        act = self.session.current_act
        previous_outcomes = self.memory.get_act_summary(act - 1)

        batch = await generate_scene_batch(quest, lore, act, previous_outcomes)

        # Save to DB via gRPC
        await self.save_batch(batch, act)

        return batch

    async def get_current_scene(self) -> Scene:
        """Get current scene with dynamic intro"""
        # Get skeleton
        skeleton = await self.get_scene_skeleton(
            self.session.current_scene_index
        )

        # Generate dynamic intro based on previous outcome
        from chains.scene_intro_generator import generate_scene_intro

        previous_outcome = self.memory.get_last_outcome()
        party_state = self.session.party

        intro = await generate_scene_intro(
            skeleton,
            previous_outcome,
            party_state,
            self.session.world.theme
        )

        return Scene(skeleton, intro)

    async def resolve_choice(
        self,
        choice_id: str,
        party_member_id: int
    ) -> Outcome:
        """Resolve player's choice with dice roll"""
        choice = self.get_choice(choice_id)
        character = self.get_party_member(party_member_id)

        # Check flaw trigger
        flaw_triggered = await self.check_flaw_trigger(choice, character)

        # Roll dice
        roll = self.roll_dice(disadvantage=flaw_triggered)
        modifier = self.get_attribute_modifier(
            character,
            choice.attribute
        )
        total = roll + modifier

        # Determine outcome
        if total >= choice.dc:
            result = "success"
        elif total >= choice.dc - 5:
            result = "partial"
        else:
            result = "failure"

        # Generate outcome narrative
        from chains.beat_generator import generate_outcome_narrative

        outcome_narrative = await generate_outcome_narrative(
            choice, result, character, self.session.world.theme
        )

        # Create outcome object
        outcome = Outcome(
            roll=roll,
            modifier=modifier,
            total=total,
            dc=choice.dc,
            result=result,
            narrative=outcome_narrative,
            consequences=self.calculate_consequences(result, choice)
        )

        # Update state
        await self.apply_consequences(outcome.consequences)
        self.memory.add_outcome(outcome)

        # Check for breakpoints
        breakpoint = await self.check_breakpoints()
        if breakpoint:
            outcome.breakpoint_event = breakpoint

        return outcome

    def roll_dice(self, disadvantage: bool = False) -> int:
        """Roll d20, with disadvantage if applicable"""
        roll1 = random.randint(1, 20)
        if disadvantage:
            roll2 = random.randint(1, 20)
            return min(roll1, roll2)
        return roll1

    async def check_breakpoints(self) -> BreakpointEvent | None:
        """Check if any breakpoint events should trigger"""
        for member in self.session.party:
            # Check death
            if member.current_hp <= 0:
                if member.is_protagonist:
                    return await self.handle_protagonist_death(member)
                else:
                    return await self.handle_companion_death(member)

            # Check stress
            if member.stress >= 100:
                return await self.handle_stress_breakdown(member)
            elif member.stress >= 75:
                return await self.handle_stress_warning(member)

        return None
```

---

## Redis Architecture & Caching Strategy

### Overview

**Key Principle**: Python does AI generation ONLY. Go handles all state management and caching.

**Why Remove Redis from Python?**:
- Python service should be stateless (AI generation as a function)
- Go service owns all session state and data
- Simpler architecture: single source of truth
- Easier to scale: Python workers can be ephemeral

### Data Storage Layers

**Layer 1: PostgreSQL** (Permanent Storage):
```
- adventure_sessions (all sessions, even completed)
- party_members (character data)
- inventory_items (item data)
- scene_log (full history of choices)
- scene_batches (generated scene skeletons)
```

**Layer 2: Redis** (Hot Cache - Go Only):
```
Purpose: Speed up active session reads
TTL: 1 hour (auto-expire inactive sessions)
Keys:
  - session:{session_id}:state
  - session:{session_id}:party
  - session:{session_id}:inventory
  - session:{session_id}:current_scene
```

**Layer 3: Python Service** (NO caching):
```
- Receives requests via gRPC
- Generates AI content
- Returns response
- Stores NOTHING
```

### Active Session State (Redis)

**What Goes in Redis**:
```go
// session:{session_id}:state
type SessionState struct {
    SessionID        int64     `json:"session_id"`
    WorldID          int64     `json:"world_id"`
    UserID           int       `json:"user_id"`
    Status           string    `json:"status"`
    CurrentSceneIdx  int       `json:"current_scene_index"`
    CurrentAct       int       `json:"current_act"`
    QuestProgress    float64   `json:"quest_progress"`
    StoryFlags       map[string]any `json:"story_flags"`
    LastAccessed     time.Time `json:"last_accessed"`
}

// session:{session_id}:party
type PartyCache struct {
    Members []PartyMember `json:"members"`
}

// session:{session_id}:inventory
type InventoryCache struct {
    Items []InventoryItem `json:"items"`
}

// session:{session_id}:current_scene
type CurrentSceneCache struct {
    SceneSkeleton SceneSkeleton `json:"skeleton"`
    CurrentBeat   int           `json:"current_beat"`
    StoryContext  string        `json:"story_context"`
}
```

**Cache Flow**:
```go
// 1. Load session state (with Redis cache)
func (s *AdventureStore) GetSession(sessionID int64) (*Session, error) {
    // Try Redis first
    cacheKey := fmt.Sprintf("session:%d:state", sessionID)
    cached, err := s.redis.Get(ctx, cacheKey).Result()

    if err == nil {
        // Cache hit!
        var session Session
        json.Unmarshal([]byte(cached), &session)
        return &session, nil
    }

    // Cache miss - load from PostgreSQL
    session, err := s.db.GetSession(sessionID)
    if err != nil {
        return nil, err
    }

    // Store in Redis (1 hour TTL)
    sessionJSON, _ := json.Marshal(session)
    s.redis.Set(ctx, cacheKey, sessionJSON, time.Hour)

    return session, nil
}

// 2. Update session state (write-through cache)
func (s *AdventureStore) UpdateSession(session *Session) error {
    // Write to PostgreSQL first (source of truth)
    err := s.db.UpdateSession(session)
    if err != nil {
        return err
    }

    // Update Redis cache
    cacheKey := fmt.Sprintf("session:%d:state", session.ID)
    sessionJSON, _ := json.Marshal(session)
    s.redis.Set(ctx, cacheKey, sessionJSON, time.Hour)

    return nil
}

// 3. Invalidate cache on critical changes
func (s *AdventureStore) InvalidateSessionCache(sessionID int64) {
    keys := []string{
        fmt.Sprintf("session:%d:state", sessionID),
        fmt.Sprintf("session:%d:party", sessionID),
        fmt.Sprintf("session:%d:inventory", sessionID),
        fmt.Sprintf("session:%d:current_scene", sessionID),
    }

    for _, key := range keys {
        s.redis.Del(ctx, key)
    }
}
```

### Cache Invalidation Strategy

**When to Invalidate**:
- Choice resolved (party HP/stress changes)
- Item used (inventory changes)
- Scene advanced (new beat/scene)
- Camp entered (stress reduction)
- Breakpoint event (character death, etc.)

**Write Patterns**:
```go
// Pattern 1: Write-through (common operations)
func (h *AdventureHandler) ResolveChoice(c *gin.Context) {
    // 1. Apply changes to PostgreSQL
    h.store.UpdatePartyMember(member)
    h.store.CreateSceneLogEntry(logEntry)

    // 2. Update Redis cache
    h.store.UpdateSessionCache(session)

    // 3. Return to client
    c.JSON(200, outcome)
}

// Pattern 2: Cache-aside (read-heavy operations)
func (h *AdventureHandler) GetCurrentScene(c *gin.Context) {
    // Try cache
    scene, err := h.cache.GetCurrentScene(sessionID)
    if err == nil {
        return c.JSON(200, scene)
    }

    // Load from DB
    scene, _ = h.store.GetSceneSkeleton(sessionID, sceneIndex)

    // Cache it
    h.cache.SetCurrentScene(sessionID, scene)

    c.JSON(200, scene)
}
```

### Session Lifecycle & TTL

**TTL Strategy**:
```
Active session: Redis TTL = 1 hour, refreshed on each read/write
Inactive for 1 hour: Redis evicts, but PostgreSQL retains
Player returns: Reload from PostgreSQL into Redis
```

**Implementation**:
```go
// Refresh TTL on every session access
func (s *AdventureStore) touchSession(sessionID int64) {
    cacheKey := fmt.Sprintf("session:%d:state", sessionID)
    s.redis.Expire(ctx, cacheKey, time.Hour)
}

// Middleware to touch session
func (h *AdventureHandler) SessionMiddleware(c *gin.Context) {
    sessionID := c.GetInt64("session_id")
    h.store.touchSession(sessionID)
    c.Next()
}
```

### Python Redis Removal

**Before** (Old Architecture):
```python
# ❌ REMOVE THIS
class AdventureOrchestrator:
    def __init__(self):
        self.redis = redis.Redis(...)  # ❌
        self.session_cache = {}        # ❌

    async def get_session_state(self, session_id):
        cached = self.redis.get(f"session:{session_id}")  # ❌
        # ...
```

**After** (New Architecture):
```python
# ✅ CORRECT
class AdventureOrchestrator:
    """
    Stateless AI generation orchestrator.

    Does NOT store any session state.
    Receives all context via gRPC request parameters.
    """

    def __init__(self):
        self.llm = get_llm()  # Only LLM client needed

    async def generate_scene_batch(
        self,
        world_lore: dict,      # ✅ Passed by Go
        act_number: int,       # ✅ Passed by Go
        previous_outcomes: list # ✅ Passed by Go
    ) -> list[SceneSkeleton]:
        """
        Pure function: Input → AI generation → Output
        No state management, no caching, no database operations.
        """
        # Generate content using LLM
        batch = await self.llm_generate_batch(...)

        # Return to Go (Go handles caching/storage)
        return batch
```

### Performance Expectations

**Without Redis** (All PostgreSQL):
- GetSession: ~10-20ms per query
- UpdateSession: ~15-30ms per query
- GetParty: ~10ms per query
- 5-10 queries per scene resolution
- **Total**: ~100-200ms per action

**With Redis** (Hot cache):
- GetSession: ~1-2ms (Redis)
- UpdateSession: ~15ms (PostgreSQL write) + ~1ms (Redis update)
- GetParty: ~1ms (Redis)
- 2-3 PostgreSQL writes per action, rest from Redis
- **Total**: ~30-50ms per action

**Cache Hit Rate Target**: 80-90% for active sessions

### Monitoring & Metrics

```go
// Track cache performance
type CacheMetrics struct {
    Hits        int64
    Misses      int64
    Invalidations int64
    Evictions   int64
}

func (s *AdventureStore) recordCacheHit(hit bool) {
    if hit {
        metrics.IncrementCounter("redis.cache.hits")
    } else {
        metrics.IncrementCounter("redis.cache.misses")
    }
}

// Log slow queries
func (s *AdventureStore) GetSession(sessionID int64) (*Session, error) {
    start := time.Now()
    defer func() {
        duration := time.Since(start)
        if duration > 50*time.Millisecond {
            log.Warn("Slow session load", "session_id", sessionID, "duration", duration)
        }
    }()

    // ... implementation
}
```

---

## Design Approach: World-Scoped Scene Batches

### Philosophy

LoreSmith Adventure Mode uses **world-scoped scene generation** (Approach 2), meaning:
- Scene batches (encounters, challenges, NPCs) are generated **once per world**
- All players of the same world face the **same encounters**
- Batches are stored with `world_id` and shared across all sessions
- First player to play a world triggers generation, subsequent players use cached content

This is in contrast to session-scoped generation (Approach 1), where each player would get unique encounters.

### What Is Static vs. Dynamic

**Static (Shared Across All Players):**
- ✅ Scene skeletons (core challenges, NPCs, locations)
- ✅ Beat structure (what challenges appear in each scene)
- ✅ Outcome branches (all 5 outcomes: critical success, success, partial, failure, critical failure)
- ✅ Continuity hooks (how scenes connect based on previous results)

**Dynamic (Unique Per Session):**
- ✅ Companions (generated per player, unique to each session)
- ✅ Dynamic scene intros (acknowledge your specific party state, previous outcomes)
- ✅ Camp events (based on your party composition and recent events)
- ✅ Starting inventory (protagonist-based, but AI-generated)
- ✅ Dice rolls (same DC, but your roll + modifier determines outcome)
- ✅ Breakpoint events (deaths, stress - personalized to your session)

### Why This Approach?

#### 1. **Economic Sustainability** (Primary Reason)
```
Cost Comparison (at 100 playthroughs):
- Approach 1 (Session-Scoped): $218.00
- Approach 2 (World-Scoped): $16.04
- Savings: $201.96 (93% reduction)
```

Scene batch generation is the most expensive operation (~$2.04 per session). By generating once and caching, we reduce costs by an order of magnitude.

#### 2. **Consistent Reviews & Ratings**
- Players can meaningfully rate worlds because they experience the same content
- Comments can discuss specific encounters, strategies, optimal companions
- Reviews reflect actual content quality, not RNG luck
- Community can form around specific worlds with shared experiences

#### 3. **Strong Replayability Remains**
Even with static encounters, replayability comes from:
- **Companion variety**: Different skills, flaws, personalities drastically change approach
- **Party composition**: Solo vs. full party, tank+support vs. all-DPS, etc.
- **Dice variance**: DC 15 check with +2 modifier vs. +8 modifier feels very different
- **Build optimization**: Finding optimal companion combos, item usage strategies
- **Challenge runs**: "Beat world X with solo protagonist", "Pacifist run", etc.

Think: Slay the Spire, Hades, FTL - same encounters, infinite replayability through build variety.

#### 4. **Content Quality Control**
- Can identify and fix broken encounters based on player feedback
- Can balance difficulty over time
- Can improve narratives based on reviews
- With session-scoped, every session is "ship it and forget it"

#### 5. **Better UX for Subsequent Players**
- First player: Background generation during camp (same as before)
- Second+ players: **Instant scene loading** (no generation, just database lookup)
- Popular worlds become very fast to play after first playthrough

#### 6. **Community Features**
Enables future features like:
- "World of the Week" showcases
- Speedrun leaderboards (everyone faces same encounters, fair competition)
- Strategy guides and wikis
- "Hard mode" toggles (same encounters, harder DCs)
- Achievement systems ("Complete world X without losing a companion")

### Cost Breakdown (World-Scoped)

**One-Time Per World:**
- 3 acts × $0.68 per batch = **$2.04**
- Generated progressively during first playthrough
- Cached permanently for all future sessions

**Per Session (Every Playthrough):**
- Companions: $0.03
- Starting inventory: $0.01
- Dynamic scene intros (9): $0.05
- Camp events (3): $0.03
- Breakpoint events: $0.02
- **Total per session: $0.14**

**Example: World with 50 Playthroughs:**
- First playthrough: $2.04 + $0.14 = $2.18
- Next 49 playthroughs: 49 × $0.14 = $6.86
- **Total: $9.04** (vs. $109.00 with session-scoped)

### Trade-Offs Acknowledged

**What We Lose:**
- Each playthrough won't have unique encounters
- Can't say "the AI generated this crazy situation just for me"
- Second playthrough has less narrative surprise (but tactical variety remains)

**What We Gain:**
- 93% cost reduction at scale
- Consistent, rateable content
- Community building potential
- Better UX for replays
- Ability to iterate on content quality

### Future: Optional Dynamic Mode

If desired, we can later add a toggle:
- **Classic Mode**: Static encounters (default, free)
- **Dynamic Mode**: Unique generation per session (premium feature, costs tokens)

This allows us to start sustainable and add procedural generation as an optional upgrade.

---

## AI Generation Strategy

### Prompt File Organization

```
/python-service/prompts/
├── adventure/                         [NEW]
│   ├── companion.txt
│   ├── quest_analysis.txt
│   ├── scene_batch.txt
│   ├── scene_intro.txt
│   ├── beat_choices.txt
│   ├── outcome_narrative.txt
│   ├── camp_event.txt
│   ├── companion_death.txt
│   ├── protagonist_death.txt
│   └── stress_breakdown.txt
├── character/
│   └── (existing)
└── ...
```

### LLM Usage Optimization

**Model Selection**:
- **Large model** (Sonnet, GPT-4): Scene batches, camp events, death scenes
- **Small model** (Haiku, GPT-3.5): Intros, choice generation, flaw checks

**Caching Strategy**:
- Scene skeletons: Cache in DB (scene_batches table)
- Flaw checks: Cache common patterns in Redis
- Outcome templates: Pre-generate common success/failure narratives

**Token Management**:
- Keep prompts concise, reference data not dump it
- Use structured output (JSON) where possible
- Limit narrative generation to needed length

**Langfuse Observability**:
- Track all adventure generation chains
- Monitor token usage per session
- Identify slow chains for optimization

---

## UI/UX Design

### Party Bar (Sticky Bottom)

```tsx
// components/adventure/PartyBar.tsx

<div className="fixed bottom-0 w-full bg-gray-900 border-t border-gray-700 p-4">
  <div className="flex gap-4 max-w-4xl mx-auto">
    {party.map((member) => (
      <div
        key={member.id}
        className="flex-1 cursor-pointer hover:bg-gray-800 rounded-lg p-2"
        onClick={() => openCharacterModal(member)}
      >
        {/* Portrait (placeholder for now) */}
        <div className="w-16 h-16 bg-gray-700 rounded-full mb-2 mx-auto" />

        {/* Name */}
        <div className="text-sm font-medium text-center truncate">
          {member.name}
        </div>

        {/* HP Bar */}
        <div className="mt-1 bg-gray-700 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full"
            style={{ width: `${(member.current_hp / member.max_hp) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 text-center">
          {member.current_hp}/{member.max_hp} HP
        </div>

        {/* Stress Bar */}
        <div className="mt-1 bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              member.stress >= 75 ? 'bg-orange-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${member.stress}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 text-center">
          Stress: {member.stress}
        </div>
      </div>
    ))}

    {/* Inventory Button */}
    <button
      className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
      onClick={() => openInventory()}
    >
      <BackpackIcon />
      Inventory
    </button>
  </div>
</div>
```

### Scene View

```tsx
// components/adventure/SceneView.tsx

<div className="max-w-4xl mx-auto p-8 pb-32"> {/* pb-32 for party bar */}
  {/* Scene Header */}
  <div className="mb-6">
    <div className="text-sm text-gray-400">
      Act {act} • Scene {scene}
    </div>
    <h2 className="text-2xl font-bold">{sceneTitle}</h2>
  </div>

  {/* Scene Intro */}
  <div className="prose prose-invert mb-8">
    <p>{sceneIntro}</p>
  </div>

  {/* Current Beat */}
  <div className="bg-gray-800 rounded-lg p-6 mb-6">
    <h3 className="text-lg font-semibold mb-4">
      {beatNarrative}
    </h3>
  </div>

  {/* Choices */}
  <div className="grid grid-cols-2 gap-4">
    {choices.map((choice) => (
      <ChoiceCard
        key={choice.id}
        choice={choice}
        onSelect={() => handleChoiceSelect(choice)}
      />
    ))}
  </div>
</div>
```

### Choice Card

```tsx
// components/adventure/ChoiceCard.tsx

<div
  className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition"
  onClick={onSelect}
>
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-blue-400">
      [{choice.attribute}]
    </span>
    <span className="text-sm text-gray-400">
      DC {choice.dc}
    </span>
  </div>

  <p className="text-sm">
    {choice.action_text}
  </p>

  {choice.flaw_warning && (
    <div className="mt-2 text-xs text-orange-400 flex items-center gap-1">
      <AlertIcon size={12} />
      May trigger flaw
    </div>
  )}
</div>
```

### Character Selection Modal

```tsx
// components/adventure/CharacterModal.tsx

<Modal open={isOpen} onClose={onClose}>
  <div className="bg-gray-900 rounded-lg p-6 max-w-2xl">
    <h3 className="text-xl font-bold mb-4">
      Who attempts this action?
    </h3>

    <div className="space-y-3">
      {party.map((member) => {
        const modifier = getAttributeModifier(member, selectedAttribute);
        const flawWarning = checkFlawTrigger(member, choice);

        return (
          <div
            key={member.id}
            className={`bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 ${
              selectedMember?.id === member.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedMember(member)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-gray-400">
                  {selectedAttribute}: {member[selectedAttribute]}
                  ({modifier >= 0 ? '+' : ''}{modifier})
                </div>
              </div>

              {flawWarning && (
                <div className="text-xs text-orange-400 flex items-center gap-1">
                  <AlertTriangleIcon size={16} />
                  Flaw may hinder
                </div>
              )}
            </div>

            {flawWarning && (
              <div className="mt-2 text-xs text-gray-400 italic">
                "{member.flaw}"
              </div>
            )}
          </div>
        );
      })}
    </div>

    <button
      className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
      disabled={!selectedMember}
      onClick={() => onConfirm(selectedMember)}
    >
      Attempt Action
    </button>
  </div>
</Modal>
```

### Dice Roll Animation

```tsx
// components/adventure/DiceRoller.tsx

<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-gray-900 rounded-lg p-8 text-center">
    {/* Animated d20 */}
    <div className="text-8xl mb-4 animate-bounce">
      🎲
    </div>

    {rolling ? (
      <div className="text-xl text-gray-400">Rolling...</div>
    ) : (
      <>
        <div className="text-6xl font-bold mb-2">
          {rollResult}
        </div>

        <div className="text-lg text-gray-400 mb-4">
          {rollResult} + {modifier} = {total}
        </div>

        <div className={`text-2xl font-semibold ${
          outcome === 'success' ? 'text-green-400' :
          outcome === 'partial' ? 'text-yellow-400' :
          'text-red-400'
        }`}>
          {outcome.toUpperCase()}
        </div>

        <div className="mt-4 text-sm text-gray-300">
          {outcomeNarrative}
        </div>

        <button
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          onClick={onContinue}
        >
          Continue
        </button>
      </>
    )}
  </div>
</div>
```

### Camp Screen

```tsx
// components/adventure/CampScreen.tsx

<div className="max-w-4xl mx-auto p-8">
  <h2 className="text-3xl font-bold mb-6">Rest & Respite</h2>

  {/* Camp Event Narrative */}
  <div className="prose prose-invert mb-8 bg-gray-800 rounded-lg p-6">
    {campEventNarrative.split('\n\n').map((paragraph, i) => (
      <p key={i}>{paragraph}</p>
    ))}
  </div>

  {/* Party Status */}
  <div className="bg-gray-800 rounded-lg p-6 mb-6">
    <h3 className="text-xl font-semibold mb-4">Party Status</h3>
    <div className="space-y-3">
      {party.map((member) => (
        <div key={member.id} className="flex items-center justify-between">
          <span className="font-medium">{member.name}</span>
          <div className="flex gap-4 text-sm">
            <span>HP: {member.current_hp}/{member.max_hp}</span>
            <span className={member.stress >= 75 ? 'text-orange-400' : ''}>
              Stress: {member.stress}
              {member.stress > oldStress && (
                <span className="text-green-400 ml-1">(-20)</span>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Actions */}
  <div className="grid grid-cols-3 gap-4 mb-6">
    <button className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4">
      <BackpackIcon className="mx-auto mb-2" />
      Use Items
    </button>
    <button className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4">
      <UserIcon className="mx-auto mb-2" />
      View Stats
    </button>
    <button className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4">
      <BookOpenIcon className="mx-auto mb-2" />
      Review Progress
    </button>
  </div>

  {/* Continue */}
  <button
    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold"
    onClick={onContinue}
  >
    Continue Journey
  </button>

  {nextBatchGenerating && (
    <div className="text-sm text-gray-400 text-center mt-2">
      Preparing next chapter...
    </div>
  )}
</div>
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Database & Migrations**:
- [ ] Create migration `00007_create_adventure_tables.sql`
- [ ] Add `visibility` column to `worlds` table
- [ ] Add `is_protagonist` column to `lore_pieces` table
- [ ] Run migrations, verify schema

**Go Backend - Basic Structure**:
- [ ] Create `adventure_handler.go` with stub endpoints
- [ ] Create `adventure_store.go` with basic CRUD
- [ ] Create `party_store.go` with basic CRUD
- [ ] Implement `POST /api/adventure/start` endpoint
- [ ] Implement `GET /api/adventure/state` endpoint

**Python - Project Structure**:
- [ ] Create `/adventure` directory
- [ ] Create subdirectories: `orchestrators/`, `chains/`, `models/`
- [ ] Create `adventure_orchestrator.py` skeleton
- [ ] Create basic model classes (`Scene`, `Party`, `Outcome`)

**Testing**:
- [ ] Test world creation with protagonist marking
- [ ] Test adventure session creation
- [ ] Verify database relationships work

---

### Phase 2: Companion Generation (Week 3)

**Python Chains**:
- [ ] Create `prompts/adventure/companion.txt` prompt file
- [ ] Implement `companion_generator.py` chain
- [ ] Test companion generation with various themes

**gRPC**:
- [ ] Add `GenerateCompanions` RPC to `lore.proto`
- [ ] Generate Go stubs (`make proto`)
- [ ] Implement Python gRPC server method
- [ ] Test gRPC call from Go to Python

**Go Endpoints**:
- [ ] Implement `POST /api/adventure/companions/generate`
- [ ] Implement `POST /api/adventure/party/confirm`
- [ ] Store companions in `party_members` table

**Frontend**:
- [ ] Create `PartyCard` component
- [ ] Create party selection page (`/worlds/[id]/adventure/party`)
- [ ] Implement companion generation UI
- [ ] Implement regenerate functionality
- [ ] Test full party selection flow

---

### Phase 3: Scene System - Skeletons (Week 4-5)

**Python Chains**:
- [ ] Create `quest_analyzer.py` - analyze quest complexity
- [ ] Create `scene_batch_generator.py` - generate 3 scene skeletons
- [ ] Test batch generation with different quest types

**Models**:
- [ ] Define `SceneSkeleton` Pydantic model
- [ ] Define `BeatSkeleton` Pydantic model
- [ ] Define continuity hook structure

**gRPC**:
- [ ] Add scene-related RPCs to proto
- [ ] Implement Python gRPC methods
- [ ] Test scene batch generation via gRPC

**Go**:
- [ ] Create `scene_store.go` with batch storage
- [ ] Implement scene batch caching in `scene_batches` table
- [ ] Implement retrieval logic

**Testing**:
- [ ] Generate batches for multiple themes
- [ ] Verify continuity hooks make sense
- [ ] Check scene coherence

---

### Phase 4: Scene System - Dynamic Content (Week 6)

**Python Chains**:
- [ ] Create `scene_intro_generator.py`
- [ ] Create `beat_generator.py` (generates choices)
- [ ] Implement outcome narrative generation

**Orchestrator**:
- [ ] Implement `get_current_scene()` in orchestrator
- [ ] Implement scene intro generation with context
- [ ] Implement beat choice generation

**Go Endpoints**:
- [ ] Implement `GET /api/adventure/scene`
- [ ] Integrate orchestrator calls
- [ ] Return formatted scene data

**Frontend**:
- [ ] Create `SceneView` component
- [ ] Create `ChoiceCard` component
- [ ] Create scene display page (`/worlds/[id]/adventure/play`)
- [ ] Test scene loading and display

---

### Phase 5: Dice & Resolution (Week 7)

**Dice Rolling**:
- [ ] Implement dice rolling logic (Go or Python, decide)
- [ ] Implement modifier calculation
- [ ] Implement flaw checking logic
- [ ] Implement critical success/failure

**Orchestrator**:
- [ ] Implement `resolve_choice()` method
- [ ] Implement consequence calculation
- [ ] Implement state updates (HP, stress, items)

**Go Endpoints**:
- [ ] Implement `POST /api/adventure/resolve`
- [ ] Save outcome to `scene_log` table
- [ ] Update party member stats

**Frontend**:
- [ ] Create `CharacterModal` (character selection)
- [ ] Create `DiceRoller` component (animation)
- [ ] Implement choice selection flow
- [ ] Implement roll result display
- [ ] Test full choice → roll → outcome flow

---

### Phase 6: Inventory System (Week 8)

**Database**:
- [ ] Verify `inventory_items` table works
- [ ] Test item CRUD operations

**Go**:
- [ ] Create `inventory_store.go`
- [ ] Implement `POST /api/adventure/item/use`
- [ ] Implement item effect application logic

**Item Generation**:
- [ ] Add item generation to outcome narratives
- [ ] Create item templates for common types
- [ ] Integrate theme-based item naming

**Frontend**:
- [ ] Create inventory modal/screen
- [ ] Display shared vs character inventory
- [ ] Implement item usage UI
- [ ] Test item effects (heal, stress relief, etc.)

---

### Phase 7: Breakpoint Events (Week 9)

**Templates (Go)**:
- [ ] Create stress warning templates
- [ ] Create basic death templates
- [ ] Implement template selection logic

**Python Chains**:
- [ ] Create `breakpoint_generator.py`
- [ ] Implement companion death narrative generation
- [ ] Implement protagonist death narrative generation
- [ ] Implement stress breakdown generation (flaw-based)

**Orchestrator**:
- [ ] Implement `check_breakpoints()` method
- [ ] Implement death handling
- [ ] Implement stress event handling

**Go Logic**:
- [ ] Check for breakpoints after each resolution
- [ ] Trigger appropriate generation
- [ ] Update session status on game over

**Frontend**:
- [ ] Create breakpoint event modal
- [ ] Create game over screen
- [ ] Implement retry functionality
- [ ] Test all breakpoint scenarios

---

### Phase 8: Camp System (Week 10)

**Python Chains**:
- [ ] Create `camp_event_generator.py`
- [ ] Test camp event generation with various contexts

**Go Endpoints**:
- [ ] Implement `POST /api/adventure/camp`
- [ ] Apply automatic stress reduction
- [ ] Trigger background batch generation for next act

**Background Jobs**:
- [ ] Implement async batch generation during camp
- [ ] Store next batch while player reads camp event
- [ ] Handle generation errors gracefully

**Frontend**:
- [ ] Create `CampScreen` component
- [ ] Display camp narrative
- [ ] Show party status changes
- [ ] Implement camp actions (use items, view stats)
- [ ] Test camp → next act transition

---

### Phase 9: Party Bar & Character Details (Week 11)

**Frontend**:
- [ ] Create `PartyBar` component (sticky bottom)
- [ ] Display HP/stress bars
- [ ] Make clickable to open details
- [ ] Create character detail modal
- [ ] Show full stats, skills, flaw, equipment
- [ ] Test on mobile (responsive design)

**Polish**:
- [ ] Add animations to HP/stress changes
- [ ] Add visual indicators for breakpoint thresholds
- [ ] Improve party bar UX

---

### Phase 10: Quest Completion (Week 12)

**Quest Analysis**:
- [ ] Implement quest progress tracking
- [ ] Detect when quest can conclude
- [ ] Generate finale scene

**Finale Generation**:
- [ ] Create finale generation chain
- [ ] Integrate quest outcome based on performance
- [ ] Generate epilogue narrative

**Go Endpoints**:
- [ ] Update session status to 'completed'
- [ ] Update world status if needed
- [ ] Calculate final stats

**Frontend**:
- [ ] Create completion screen
- [ ] Display stats summary
- [ ] Implement "Play Again" functionality
- [ ] Test full adventure completion flow

---

### Phase 11: Polish & Testing (Week 13-14)

**UI/UX**:
- [ ] Review all screens for consistency
- [ ] Add loading states
- [ ] Add error handling UI
- [ ] Improve mobile experience
- [ ] Add tooltips and help text

**Performance**:
- [ ] Optimize LLM calls (reduce token usage)
- [ ] Add caching where appropriate
- [ ] Test with slow networks
- [ ] Monitor Langfuse metrics

**Testing**:
- [ ] End-to-end test: world creation → adventure → completion
- [ ] Test edge cases (solo party, all companions die, etc.)
- [ ] Test multiple concurrent sessions
- [ ] Load test scene generation

**Bug Fixes**:
- [ ] Fix any discovered issues
- [ ] Improve error messages
- [ ] Handle edge cases gracefully

---

### Phase 12: Launch Prep (Week 15)

**Documentation**:
- [ ] Update README with adventure mode info
- [ ] Create user guide
- [ ] Document API endpoints

**Deployment**:
- [ ] Verify migrations run on production
- [ ] Test with production AI provider
- [ ] Monitor costs (LLM usage)

**Launch**:
- [ ] Soft launch with limited users
- [ ] Gather feedback
- [ ] Iterate based on feedback

---

## Future Enhancements (Post-MVP)

**Not in initial scope, but designed for**:

1. **Character Portraits**:
   - Generate AI images for protagonist and companions
   - Two styles: full image + pathfinder-style portrait
   - Display in party bar and character modal

2. **World Map**:
   - Visual representation of world geography
   - Show current location during scenes
   - Track visited locations

3. **Character Progression**:
   - XP system (gain from successful rolls)
   - Level up mechanics (increase attributes)
   - Skill unlocks

4. **Faction Reputation**:
   - Track relationships with world factions
   - Affect scene outcomes based on reputation
   - Unlock faction-specific scenes

5. **Crafting System**:
   - Use crafting materials from inventory
   - Create custom items
   - Recipes based on world theme

6. **Multiplayer/Spectating**:
   - Allow others to watch your adventure
   - Vote on choices (async multiplayer)
   - Leaderboards for completion times

7. **Dynamic Quest Length**:
   - Continue past initial quest with procedural content
   - "New Game+" with harder challenges
   - Endless mode

8. **Enhanced Camp**:
   - Mini-games during camp
   - Character relationship building
   - Strategic party management (switch out companions)

9. **Save/Load**:
   - Multiple save slots per world
   - Checkpoint system
   - Rollback to previous scenes

10. **Accessibility**:
    - Text-to-speech for narratives
    - Colorblind mode
    - Keyboard-only navigation

---

## Summary Checklist

Before starting implementation, ensure you understand:

- [ ] Protagonist vs companions distinction
- [ ] Scene skeleton vs dynamic intro approach
- [ ] How continuity hooks work
- [ ] Dice roll mechanics (d20 + modifier vs DC)
- [ ] Flaw trigger system
- [ ] Breakpoint event types
- [ ] Camp system timing and effects
- [ ] Inventory shared vs character-specific
- [ ] World status vs visibility
- [ ] Session lifecycle (initializing → active → completed/failed)
- [ ] Database schema relationships
- [ ] gRPC flow (Go ← → Python)
- [ ] Orchestrator state management
- [ ] Batch generation timing (when/where)
- [ ] Background job during camp

**Key Files to Reference**:
- This document (ADVENTURE_MODE_DESIGN.md)
- Database migrations
- lore.proto for gRPC contracts
- Orchestrator code for state logic

---