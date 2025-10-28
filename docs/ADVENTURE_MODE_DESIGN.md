# LoreSmith Adventure Mode - Complete Design Document

**Last Updated**: 2025-10-28
**Status**: Design Phase - Ready for Implementation

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
13. [AI Generation Strategy](#ai-generation-strategy)
14. [UI/UX Design](#uiux-design)
15. [Implementation Roadmap](#implementation-roadmap)

---

## Overview

Adventure Mode transforms LoreSmith's generated worlds into playable, interactive text-based adventures. Players take on the role of the protagonist character from a world, optionally recruit AI-generated companions, and progress through dynamically-generated scenes to complete the world's quest.

### Key Design Principles

- **Reactive Storytelling**: Scenes acknowledge previous choices and outcomes
- **Tactical Choice**: Party composition and character selection matter
- **Manageable Length**: 5-15 scenes based on quest complexity, not endless
- **Replayability**: Same world generates different experiences for different players
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

```
1. User clicks "Begin Adventure" on world page (their own or someone else's)
2. System creates adventure_session record:
   - session_id: generated
   - world_id: reference to world
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
1. Check if scene batch exists for current act
   - If not: Generate scene batch (3 skeletons)

2. Load current scene skeleton

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
    --   "quest_progress": 0.65
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

-- Scene Batches (cache generated scene skeletons)
CREATE TABLE IF NOT EXISTS scene_batches (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES adventure_sessions(id) ON DELETE CASCADE,

    act_number INT NOT NULL,
    -- Act 1, Act 2, etc.

    scenes JSONB NOT NULL,
    -- Array of scene skeleton objects
    -- [
    --   {
    --     "scene_number": 1,
    --     "core_challenge": "...",
    --     "challenge_type": "stealth",
    --     "key_npcs": [...],
    --     "stakes": "...",
    --     "continuity_hooks": {...}
    --   },
    --   ...
    -- ]

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scene_batches_session_id ON scene_batches(session_id);
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
      "base_dc": 15
    },
    {
      "beat_number": 2,
      "core_situation": "Deal with workshop security",
      "challenge_attributes": ["influence", "resilience", "creativity"],
      "base_dc": 18
    }
  ]
}
```

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

**When**:
- Act 1 batch: Generated when adventure starts
- Act 2 batch: Generated in background during Act 1 Camp
- Act 3+ batches: Generated during previous camp

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
- Skeletons stored in `scene_batches` table as JSONB
- Retrieved when player enters each scene
- Not regenerated unless session restarted

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

**Dynamic Continuation**:
- After each act, check: "Is quest resolved?"
- If quest can conclude naturally → Generate finale
- If quest needs development → Generate next act
- Hard cap: 15 scenes maximum

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

**Flaw Triggers**:
- Each character has one flaw (AI-generated during creation)
- Flaws are descriptions, not single words

**Example Flaws**:
```
Emmeline: "Compulsively repairs every mechanical device she
           encounters, even if it's not hers, often leaving her
           financially strained and socially awkward"

Bob: "Freezes in combat when reminded of his brother's death,
      requiring allies to snap him out of it"
```

**Mechanical Effect**:
- When action might trigger flaw → **Disadvantage**
- Disadvantage: Roll 2d20, take the lower result

**UI Warning**:
```
┌────────────────────────────────────┐
│ ⚠️ Bob's Flaw May Trigger          │
│                                    │
│ This combat situation reminds      │
│ Bob of his brother's death.        │
│                                    │
│ Disadvantage: Roll 2d20, use lower │
│                                    │
│    [Choose Anyway] [Pick Other]    │
└────────────────────────────────────┘
```

**Flaw Detection**:
```python
def check_flaw_trigger(choice: Choice, character: PartyMember) -> bool:
    """
    Check if choice triggers character's flaw.

    Uses LLM to determine semantic match:
    - Choice context
    - Character flaw description

    Returns True if flaw would hinder this action.
    """

    prompt = f"""
    Character Flaw: {character.flaw}

    Action: {choice.action_text}
    Situation: {choice.context}

    Would this character's flaw hinder them in this action?
    Answer: yes/no with brief explanation.
    """

    # Quick LLM call (small model, fast)
    # Cache common checks
```

**Overcoming Flaws**:
- If character succeeds despite flaw trigger → Bonus reward
- Narrative recognition: "Despite her compulsion, Emmeline focuses..."
- Future feature: Reduce flaw impact over time (character growth)

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

**While Player Reads Camp Event**:
```python
# Triggered when camp screen loads
async def on_camp_enter(session_id: int):
    # Display camp event to player
    camp_event = await generate_camp_event(...)

    # Start background generation for next act
    next_act = current_act + 1
    asyncio.create_task(
        generate_and_cache_next_batch(session_id, next_act)
    )

    # Player reads camp event while batch generates
    # By the time they click "Continue", next scenes are ready
```

**User Experience**:
- No waiting when clicking "Continue Journey"
- Scenes pre-generated during downtime
- Seamless transition to next act

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

### Item Generation

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