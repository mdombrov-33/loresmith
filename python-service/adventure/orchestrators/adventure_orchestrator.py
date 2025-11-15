"""
AI Orchestrator for Adventure Mode.

ARCHITECTURE:
    - Go Service: REST API, database operations, session/party/inventory management
    - Python Service: AI generation ONLY (via gRPC)
    - This file: AI generation orchestrator (NO database operations)

Database tables are managed by Go:
    - adventure_sessions (Go creates/updates)
    - party_members (Go creates/updates)
    - inventory_items (Go creates/updates)
    - scene_log (Go creates/updates)
    - scene_batches (Go saves AI-generated scenes here)

Session Initialization Flow:
    1. User clicks "Begin Adventure" on a world in frontend
    2. Go creates adventure_sessions record (world_id, user_id, status=INITIALIZING)
    3. Go fetches protagonist from lore_pieces (where world_id=X and is_protagonist=true)
    4. Go copies protagonist to party_members table (session_id, is_protagonist=true, position=0)
    5. Go calls Python via gRPC: "Generate 3 companion options"
       → Python generates 3 companions using AI, returns JSON
       → Go stores in temporary state (not saved to DB yet)
    6. Frontend displays 3 companions to user: "Choose 1-3 to join your party"
    7. User selects companions (e.g., picks 2 out of 3)
    8. Go saves selected companions to party_members (session_id, is_protagonist=false, position=1,2)
    9. Go initializes inventory_items (starting items based on protagonist/world)
    10. Go updates adventure_sessions.status = ACTIVE
    11. Go calls Python via gRPC: "Generate scene batch for act 1"
        → Passes: world_id (for lore context) + session_id (for tracking)
        → Python generates 3 scene skeletons using AI, returns JSON
    12. Go saves scene skeletons to scene_batches table (session_id, act_number, scenes JSONB)
    13. Frontend loads first scene, adventure begins!

Gameplay Flow (Per Scene):
    1. User enters a scene
    2. Go fetches scene skeleton from scene_batches
    3. Go fetches current party state from party_members (HP, stress, etc.)
    4. Go calls Python via gRPC: "Expand skeleton into narrative beats"
       → Passes: scene skeleton + party state + world lore
       → Python generates narrative text, choices, DCs using AI
    5. Go sends beats to frontend
    6. User makes choice, rolls dice
    7. Go calls Python via gRPC: "Generate consequence for this choice+roll"
       → Python determines HP/stress changes, items, story flags using AI
    8. Go applies consequences:
       → Updates party_members (HP, stress)
       → Updates inventory_items (add/remove items)
       → Saves to scene_log (choice, roll, consequence, narrative)
    9. Repeat for next beat/scene
"""

from typing import List, Dict, Any, Optional
from exceptions.adventure import (
    SceneBatchGenerationError,
    SceneBeatsGenerationError,
    ConsequenceGenerationError,
    CompanionGenerationError,
)


class AdventureOrchestrator:
    """
    Handles ONLY AI generation for Adventure Mode.

    Database operations are in Go (adventure_handler.go, adventure_store.go).

    This orchestrator provides:
        - generate_scene_batch(): Create 3 scene skeletons for an act
        - generate_scene_beats(): Expand skeleton into narrative beats
        - generate_consequence(): Determine what happens from player choice
        - generate_companion(): Create companion character stats
    """

    def __init__(self):
        """Initialize the orchestrator."""
        # TODO Phase 2: Add LLM client (e.g., langchain)
        pass

    # * Scene Generation (AI Only)

    async def generate_scene_batch(
        self,
        world_lore: Dict[str, Any],
        act_number: int,
        previous_outcomes: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Generate a batch of 3 scene skeletons for an act using AI.

        PURE AI GENERATION - no database operations.
        Go will save the returned skeletons to scene_batches table.

        Args:
            world_lore: {
                "quest": {"title": "...", "description": "..."},
                "setting": {...},
                "protagonist": {...},
                "faction": {...},
                etc.
            }
            act_number: Which act (1, 2, 3, etc.) - each act = 3 scenes
            previous_outcomes: List of what happened in previous scenes (for continuity)

        Returns:
            List of 3 scene skeleton dicts (will be stored as JSONB in scene_batches.scenes)

        Example Return (matches DB schema):
            [
                {
                    "scene_number": 1,
                    "core_challenge": "Infiltrate the Under-Market to find informant",
                    "challenge_type": "stealth",  # stealth, combat, social, exploration, puzzle
                    "key_npcs": ["Kira the Smuggler", "Market Guards"],
                    "location": "Under-Market tunnels",
                    "stakes": "If caught, protagonist loses trust with faction",
                    "continuity_hooks": {"found_map": True},
                    "beats": [
                        {
                            "beat_number": 1,
                            "type": "setup",
                            "description": "Approach the market entrance"
                        },
                        {
                            "beat_number": 2,
                            "type": "challenge",
                            "description": "Sneak past guards"
                        },
                        {
                            "beat_number": 3,
                            "type": "resolution",
                            "description": "Meet with informant"
                        }
                    ]
                },
                {
                    "scene_number": 2,
                    "core_challenge": "...",
                    ...
                },
                {
                    "scene_number": 3,
                    "core_challenge": "...",
                    ...
                }
            ]
        """
        # TODO Phase 2: Implement AI scene generation
        # Prompt template:
        # - Use world lore (quest, setting, characters)
        # - Consider act number (1 = setup, 2 = conflict, 3 = climax)
        # - Use previous_outcomes for continuity
        # - Generate 3 scenes with escalating stakes
        # - Each scene has 3-5 beats
        #
        # On error: raise SceneBatchGenerationError(f"Failed to generate scenes: {str(e)}")
        raise NotImplementedError("AI scene batch generation - Phase 2")

    async def generate_scene_beats(
        self,
        scene_skeleton: Dict[str, Any],
        party_state: Dict[str, Any],
        world_lore: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Expand a scene skeleton into fully narrated beats using AI.

        Takes a pre-generated skeleton and creates:
        - Narrative text for each beat
        - Actual NPC dialogue
        - Specific player choices
        - Challenge difficulty classes (DCs)

        This is called DURING GAMEPLAY when player enters a scene.

        Args:
            scene_skeleton: The skeleton from scene_batches.scenes[i]
            party_state: {
                "members": [{"name": "...", "hp": 80, "stress": 20, ...}],
                "inventory": ["torch", "rope", ...],
            }
            world_lore: World context for consistency

        Returns:
            List of beat dicts with full narrative (Go sends these to frontend)

        Example Return:
            [
                {
                    "beat_number": 1,
                    "narrative": "The Under-Market's entrance looms before you, a dark maw in the alley wall. Two guards lean against the entrance, chatting idly. You'll need to get past them.",
                    "choice_required": True,
                    "choices": [
                        "Sneak through the shadows (Perception)",
                        "Bribe the guards (Influence)",
                        "Create a distraction (Creativity)"
                    ],
                    "challenge_type": "perception",  # or None if no roll needed
                    "dc": 12
                },
                {
                    "beat_number": 2,
                    "narrative": "...",
                    ...
                }
            ]
        """
        # TODO Phase 2: Implement beat expansion
        # Prompt template:
        # - Take skeleton beat descriptions
        # - Generate vivid narrative text
        # - Create NPC dialogue if applicable
        # - Generate choices based on party abilities
        # - Set appropriate DCs based on challenge type
        # - Consider party state (low HP = harder challenges?)
        #
        # On error: raise SceneBeatsGenerationError(f"Failed to generate beats: {str(e)}")
        raise NotImplementedError("AI beat generation - Phase 2")

    # * Choice & Consequence Generation (AI Only)

    async def generate_consequence(
        self,
        choice: str,
        roll_result: Optional[Dict[str, Any]],
        scene_context: Dict[str, Any],
        party_state: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Determine consequences of a player choice using AI.

        Based on what the player chose and how they rolled, generate:
        - Narrative description of what happens
        - HP/stress changes per party member
        - Items gained/lost
        - Story flags set (for continuity)

        Go will save this to scene_log table.

        Args:
            choice: The choice the player made
            roll_result: {
                "roll_value": 15,
                "modifier": 2,
                "dc": 12,
                "total": 17,
                "outcome": "success",  # critical_failure, failure, partial, success, critical_success
                "attribute": "perception"
            } (None if no roll was required)
            scene_context: Current scene/beat info
            party_state: Current party HP, stress, etc.

        Returns:
            Consequence dict (Go saves to scene_log.consequences JSONB)

        Example Return (matches scene_log.consequences schema):
            {
                "hp_change": {1: -5, 2: 0},  # party_member_id -> HP change
                "stress_change": {1: 10, 2: 5},
                "items_gained": ["Guard's Keyring"],
                "items_lost": [],
                "story_flags": {"guards_alerted": True},
                "narrative_description": "You slip past the guard but knock over a crate. The clatter echoes through the tunnel. The guards are now on high alert..."
            }
        """
        # TODO Phase 2: Implement AI consequence generation
        # Prompt template:
        # - Consider roll outcome type
        #   - critical_failure: something very bad happens
        #   - failure: bad outcome, take damage/stress
        #   - partial: mixed result, succeed but at cost
        #   - success: good outcome
        #   - critical_success: amazing outcome, bonus reward
        # - Generate dramatic narrative consequence
        # - Determine stat changes appropriate to outcome
        # - Determine item rewards/losses
        # - Set story flags for scene continuity
        #
        # On error: raise ConsequenceGenerationError(f"Failed to generate consequence: {str(e)}")
        raise NotImplementedError("AI consequence generation - Phase 2")

    # * Character Generation (AI Only)

    async def generate_companion(
        self,
        protagonist_info: Dict[str, Any],
        relationship_type: str,
        world_lore: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate a companion character using AI.

        Companions are NOT from lore_pieces (those are protagonists).
        Companions are generated dynamically during adventure.

        Go will save this to party_members table.

        Args:
            protagonist_info: {
                "name": "...",
                "traits": ["Cautious", "Loyal", "Analytical"],
                "backstory": "...",
                "skills": "..."
            }
            relationship_type: "ally", "rival", "mentor", "friend", etc.
            world_lore: World context

        Returns:
            Companion data dict (matches party_members table schema)

        Example Return (matches party_members columns):
            {
                "name": "Kira",
                "description": "A street-smart smuggler from the Under-Market",
                "relationship_to_protagonist": "Old friend who owes a favor",
                "max_hp": 80,
                "current_hp": 80,
                "stress": 0,
                "knowledge": 8,
                "empathy": 12,
                "resilience": 10,
                "creativity": 14,
                "influence": 11,
                "perception": 13,
                "skills": "Lockpicking, Street contacts, Quick reflexes",
                "flaw": "Doesn't trust authority figures",
                "traits": "Reckless, Loyal, Perceptive",
                "appearance": "Short, wiry build, always wears a hood",
                "position": 1  # 0 = protagonist, 1-3 = companions
            }
        """
        # TODO Phase 2: Implement AI companion generation
        # Prompt template:
        # - Generate stats that complement protagonist
        # - Create backstory that fits world lore
        # - Ensure relationship makes narrative sense
        # - Personality should contrast with protagonist (interesting dynamics)
        # - Generate appropriate skills/flaw based on role
        #
        # On error: raise CompanionGenerationError(f"Failed to generate companion: {str(e)}")
        raise NotImplementedError("AI companion generation - Phase 2")
