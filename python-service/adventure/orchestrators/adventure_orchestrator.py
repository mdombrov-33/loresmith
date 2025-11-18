"""
AI Orchestrator for Adventure Mode.

ARCHITECTURE:
    - Go Service: REST API, database operations, session/party/inventory management
    - Python Service: AI generation ONLY (via gRPC)
    - This file: AI generation orchestrator (NO database operations)

APPROACH: World-Scoped Scene Batches (Approach 2)
    - Scene batches are generated ONCE per world and cached permanently
    - All players of the same world face the SAME encounters
    - First player triggers generation, subsequent players use cached content
    - Replayability comes from: companions, dice variance, party composition
    - Cost: ~$2.04 one-time per world + ~$0.14 per session (93% savings vs session-scoped)

Database tables are managed by Go:
    - adventure_sessions (Go creates/updates)
    - party_members (Go creates/updates)
    - inventory_items (Go creates/updates)
    - scene_log (Go creates/updates)
    - scene_batches (Go saves AI-generated scenes here, WORLD-SCOPED - shared across all sessions)

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
        → Passes: world_id (for lore context)
        → Python generates 3 scene skeletons with ALL outcome branches using AI, returns JSON
    12. Go saves scene skeletons to scene_batches table (world_id, act_number, scenes JSONB)
        → WORLD-SCOPED: First player triggers generation, subsequent players use cached content
    13. Frontend loads first scene, adventure begins!

Gameplay Flow (Per Scene):
    1. User enters a scene
    2. Go fetches scene skeleton from scene_batches (world-scoped, shared content)
    3. Go fetches current party state from party_members (HP, stress, etc.)
    4. Go calls Python via gRPC: "Generate dynamic scene intro"
       → Passes: scene skeleton + previous outcomes + party state
       → Python generates personalized intro narrative using AI
    5. Go sends intro + scene beats to frontend (beats have pre-generated outcome branches)
    6. User makes choice, selects character, rolls dice
    7. Go determines outcome (critical_success, success, partial, failure, critical_failure)
    8. Go selects pre-generated outcome branch from skeleton (NO AI CALL - instant)
    9. Go applies consequences:
       → Updates party_members (HP, stress)
       → Updates inventory_items (add/remove items)
       → Saves to scene_log (choice, roll, consequence, narrative)
    10. Repeat for next beat/scene
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
        - generate_scene_batch(): Create 3 scene skeletons with ALL outcome branches (WORLD-SCOPED)
        - generate_scene_intro(): Create personalized intro based on party state (per-session)
        - generate_companions(): Create 3 companion options for player selection
        - generate_camp_event(): Create camp narrative based on recent events (per-session)
        - generate_starting_inventory(): Create starting items based on protagonist/world
        - generate_death_event(): Create death narrative for companion/protagonist
        - generate_stress_event(): Create stress breakdown narrative
    """

    def __init__(self):
        """Initialize the orchestrator."""
        # TODO Phase 2: Add LLM client (e.g., langchain)
        pass

    # ========================================
    # TODO: Phase 2 Implementation Order
    # ========================================
    #
    # Priority order for implementing AI generation methods:
    #
    # 1. generate_companions() - FIRST (simplest, good starting point)
    #    - Generates 3 companion options for player selection
    #    - Uses prompts/adventure/companion.txt
    #    - Returns list of 3 companion dicts
    #
    # 2. generate_scene_batch() - CORE (most important, WORLD-SCOPED)
    #    - Generates 3 scenes with beats and ALL outcome branches
    #    - Uses prompts/adventure/scene_batch.txt
    #    - **Quality critical**: cached permanently for this world
    #    - Must generate all 5 outcome branches (critical_success -> critical_failure)
    #
    # 3. generate_scene_intro() - Per-session customization
    #    - Personalizes intro based on party state, previous outcomes
    #    - Uses prompts/adventure/scene_intro.txt
    #    - Called every time player enters scene
    #
    # 4. generate_starting_inventory() - Session start
    #    - Generates 3-5 starting items based on protagonist/world
    #    - Uses prompts/adventure/starting_inventory.txt
    #
    # 5. generate_camp_event() - Narrative flavor
    #    - Creates camp narrative based on party, recent scenes
    #    - Uses prompts/adventure/camp_event.txt
    #
    # 6. generate_death_event() - Breakpoint handling
    #    - Death narratives for companions/protagonist
    #    - Uses prompts/adventure/death_event.txt
    #
    # 7. generate_stress_event() - Breakpoint handling
    #    - Stress breakdown narratives (75/100 thresholds)
    #    - Uses prompts/adventure/stress_event.txt

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
        Go will save the returned skeletons to scene_batches table WITH world_id.

        **IMPORTANT: WORLD-SCOPED GENERATION**
        - Batches are shared across ALL sessions of the same world
        - First player to reach an act triggers generation
        - Subsequent players use cached content
        - Quality matters - all players will see this content
        - Must generate ALL outcome branches for each beat (no AI during gameplay)

        Args:
            world_lore: {
                "quest": {"title": "...", "description": "..."},
                "setting": {...},
                "protagonist": {...},
                "faction": {...},
                etc.
            }
            act_number: Which act (1, 2, 3, etc.) - each act = 3 scenes
            previous_outcomes: Summary of what happened in previous act (for continuity)

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
        # Prompt template (prompts/adventure/scene_batch.txt):
        # - Use world lore (quest, setting, characters)
        # - Consider act number (1 = setup, 2 = conflict, 3 = climax)
        # - Use previous_outcomes for continuity
        # - Generate 3 scenes with escalating stakes
        # - Each scene has 2-3 beats
        # - Generate ALL 5 outcome branches per beat:
        #   * critical_success (natural 20 or total >= DC+8)
        #   * success (total >= DC)
        #   * partial (total >= DC-5)
        #   * failure (total < DC-5)
        #   * critical_failure (natural 1 or total <= DC-10)
        # - Quality matters: content is cached for all players
        #
        # On error: raise SceneBatchGenerationError(f"Failed to generate scenes: {str(e)}")
        raise NotImplementedError("AI scene batch generation - Phase 2")

    async def generate_scene_intro(
        self,
        scene_skeleton: Dict[str, Any],
        previous_outcome: Optional[Dict[str, Any]],
        party_state: Dict[str, Any],
        world_theme: str,
    ) -> str:
        """
        Generate a dynamic, personalized scene intro based on party state.

        This is called EVERY TIME a player enters a scene (per-session).
        Acknowledges previous outcomes, party condition, etc.

        Args:
            scene_skeleton: The pre-generated scene structure from scene_batches
            previous_outcome: What happened in the last scene/beat
            party_state: {
                "members": [{"name": "...", "hp": 80, "stress": 20, ...}],
                "recent_events": ["Lost companion Bob", "Found secret map"]
            }
            world_theme: World theme for consistency

        Returns:
            Narrative intro paragraph (3-5 sentences)

        Example Return:
            "Bruised from the guard attack in the Under-Market, Emmeline and
            Kira limp through rain-soaked streets. Kira clutches her wounded
            arm, grimacing. Without the informant's help, finding Lady Sophia's
            workshop will be difficult—but you have no choice. Time is running out."
        """
        # TODO Phase 2: Implement dynamic intro generation
        # Prompt template (prompts/adventure/scene_intro.txt):
        # - Use scene skeleton (location, stakes, challenge)
        # - Acknowledge previous outcome (success/failure, injuries)
        # - Reference party state (wounded, stressed, etc.)
        # - Maintain world theme and tone
        # - Keep it concise (3-5 sentences)
        #
        # On error: raise SceneBeatsGenerationError(f"Failed to generate intro: {str(e)}")
        raise NotImplementedError("AI scene intro generation - Phase 2")

    # * Companion Generation (AI Only)

    async def generate_companions(
        self,
        protagonist_info: Dict[str, Any],
        world_lore: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Generate 3 companion options for player selection using AI.

        Companions are NOT from lore_pieces (those are protagonists).
        Companions are generated dynamically when player starts adventure.

        Go will present these 3 options to player, who can select 0-3 to join party.
        Go will save selected companions to party_members table.

        Args:
            protagonist_info: {
                "name": "...",
                "traits": ["Cautious", "Loyal", "Analytical"],
                "backstory": "...",
                "skills": "..."
            }
            world_lore: {
                "theme": "steampunk",
                "setting": {...},
                "faction": {...},
                etc.
            }

        Returns:
            List of 3 companion data dicts (matches party_members table schema)

        Example Return (matches party_members columns):
            [
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
                    "position": 1  # position assigned by Go when saved
                },
                { ... companion 2 ... },
                { ... companion 3 ... }
            ]
        """
        # TODO Phase 2: Implement AI companion generation
        # Prompt template (prompts/adventure/companion.txt):
        # - Generate 3 diverse companions (different archetypes)
        # - Stats that complement protagonist (fill gaps)
        # - Create backstories that fit world lore
        # - Ensure relationships make narrative sense
        # - Personalities should contrast with protagonist (interesting dynamics)
        # - Generate appropriate skills/flaws based on roles
        #
        # On error: raise CompanionGenerationError(f"Failed to generate companions: {str(e)}")
        raise NotImplementedError("AI companion generation - Phase 2")

    # * Camp & Rest Events (AI Only)

    async def generate_camp_event(
        self,
        world_theme: str,
        party: List[Dict[str, Any]],
        recent_scenes: List[Dict[str, Any]],
        quest_progress: float,
    ) -> str:
        """
        Generate a camp/rest narrative event using AI.

        Called when player enters camp (every 3 scenes).
        Creates a short narrative moment based on party composition and recent events.

        Args:
            world_theme: World theme for consistency
            party: Current party members with names, traits, etc.
            recent_scenes: Last 3 scene outcomes
            quest_progress: 0.0 to 1.0

        Returns:
            Camp event narrative (2-4 paragraphs)

        Example Return:
            "The abandoned factory provides shelter from the rain. Emmeline
            kneels beside a broken steam engine, unable to resist the urge
            to tinker despite her exhaustion. Kira watches from the doorway,
            keeping watch for Kraelion patrols.

            'We're getting closer,' Kira says quietly. 'Lady Sophia won't
            give up the chronograph easily.'

            Emmeline's fingers pause on a gear. 'Then we'd better be ready
            for whatever she's prepared.' She glances at the bruises on her
            arms, reminders of the guard fight. 'We can't afford another
            mistake like that.'

            As the rain drums on the metal roof, both of you know: the
            hardest challenges still lie ahead."
        """
        # TODO Phase 2: Implement camp event generation
        # Prompt template (prompts/adventure/camp_event.txt):
        # - Generate 2-4 paragraph narrative
        # - Character interactions (party members talk)
        # - Reflect on recent events
        # - Build character relationships
        # - Subtle foreshadowing of upcoming challenges
        # - Match theme and tone
        # - DO NOT force exposition or break character voice
        #
        # On error: raise SceneBatchGenerationError(f"Failed to generate camp event: {str(e)}")
        raise NotImplementedError("AI camp event generation - Phase 2")

    # * Inventory Generation (AI Only)

    async def generate_starting_inventory(
        self,
        protagonist_info: Dict[str, Any],
        world_lore: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Generate 3-5 starting items based on protagonist and world.

        Called once when adventure starts (after party selection).
        Items are thematic to protagonist skills and world setting.

        Args:
            protagonist_info: Protagonist character data
            world_lore: World theme, setting, relic, etc.

        Returns:
            List of 3-5 item dicts (Go saves to inventory_items table)

        Example Return:
            [
                {
                    "item_name": "Clockwork Repair Kit",
                    "item_description": "A worn leather case containing precision tools, gears, and springs.",
                    "item_type": "consumable",
                    "item_effect": {"type": "stat_buff", "stat": "creativity", "value": 2, "duration": "one_use"},
                    "quantity": 1
                },
                {
                    "item_name": "Minor Healing Salve",
                    "item_description": "A small tin of medicinal paste. Smells of herbs and oil.",
                    "item_type": "consumable",
                    "item_effect": {"type": "heal", "value": 15},
                    "quantity": 2
                },
                ...
            ]
        """
        # TODO Phase 2: Implement starting inventory generation
        # Prompt template (prompts/adventure/starting_inventory.txt):
        # - Generate 3-5 items
        # - One healing item (bandages, potion, medkit)
        # - One utility item related to protagonist skills
        # - 1-3 thematic items based on world/setting
        # - Optionally: Lesser version of world relic
        # - Items should match world theme
        # - Define appropriate effects for each item
        #
        # On error: raise SceneBatchGenerationError(f"Failed to generate inventory: {str(e)}")
        raise NotImplementedError("AI starting inventory generation - Phase 2")

    # * Breakpoint Events (AI Only)

    async def generate_death_event(
        self,
        character: Dict[str, Any],
        scene_context: str,
        world_theme: str,
        is_protagonist: bool,
    ) -> str:
        """
        Generate a death event narrative for a character.

        Called when character HP reaches 0.
        Creates emotional, thematic death scene.

        Args:
            character: Character data (name, traits, etc.)
            scene_context: What was happening when they died
            world_theme: World theme for consistency
            is_protagonist: True if protagonist (triggers game over)

        Returns:
            Death narrative (2-3 paragraphs)

        Example Return (companion):
            "Kira stumbles backward, clutching the wound in her side.
            Blood seeps between her fingers as she sinks to her knees.
            'Go,' she gasps. 'Finish... the mission.'

            Emmeline reaches for her, but Kira's eyes are already glazing
            over. Her hand falls limp. The street-smart smuggler who had
            guided you through the Under-Market is gone.

            You're on your own now."

        Example Return (protagonist - game over):
            "The world tilts as pain explodes through your chest. You
            collapse, your vision darkening at the edges. The stolen
            chronograph slips from your fingers, clattering on the stone.

            Through fading consciousness, you see Lady Sophia's silhouette
            approaching. Her laugh echoes as darkness closes in.

            Your quest ends here."
        """
        # TODO Phase 2: Implement death event generation
        # Prompt template (prompts/adventure/death_event.txt):
        # - Generate 2-3 paragraph narrative
        # - Emotional, dramatic tone
        # - Reference scene context
        # - Character final words/actions
        # - If companion: impact on protagonist
        # - If protagonist: game over framing
        # - Match world theme
        #
        # On error: raise SceneBatchGenerationError(f"Failed to generate death event: {str(e)}")
        raise NotImplementedError("AI death event generation - Phase 2")

    async def generate_stress_event(
        self,
        character: Dict[str, Any],
        stress_level: int,
        recent_events: List[str],
        world_theme: str,
    ) -> Dict[str, Any]:
        """
        Generate a stress breakdown event for a character.

        Called when character stress reaches 75 (warning) or 100 (breakdown).

        Args:
            character: Character data
            stress_level: Current stress (75 or 100)
            recent_events: List of recent stressful events
            world_theme: World theme

        Returns:
            Stress event dict with narrative and mechanical effects

        Example Return (stress 75 - warning):
            {
                "narrative": "Kira's hands shake as she tries to pick the lock. 'I can't... I can't do this anymore,' she mutters. Sweat beads on her forehead despite the cold.",
                "mechanical_effect": {"attribute_penalty": {"perception": -2}, "duration": "next_scene"}
            }

        Example Return (stress 100 - breakdown):
            {
                "narrative": "Emmeline drops her tools and backs away, eyes wide with panic. 'The clockwork... it's all connected... they're watching...' She's spiraling into paranoia, unable to focus on the mission.",
                "mechanical_effect": {"cannot_act": True, "duration": "1_scene", "stress_reduction": 30}
            }
        """
        # TODO Phase 2: Implement stress event generation
        # Prompt template (prompts/adventure/stress_event.txt):
        # - Generate narrative showing stress manifestation
        # - At 75: Warning signs (shaking, muttering, etc.)
        # - At 100: Full breakdown (panic, paranoia, etc.)
        # - Reference character flaw and recent events
        # - Determine appropriate mechanical penalty
        # - Match world theme
        #
        # On error: raise SceneBatchGenerationError(f"Failed to generate stress event: {str(e)}")
        raise NotImplementedError("AI stress event generation - Phase 2")
