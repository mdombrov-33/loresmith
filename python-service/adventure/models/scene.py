"""
Scene generation models for AI input/output.

These are NOT database entities - they're Pydantic models for AI generation.
Go service handles all database operations and state management.
"""

from typing import Any
from pydantic import BaseModel, Field


# ========================================
# Scene Batch Generation (AI Input/Output)
# ========================================


class SceneBatchRequest(BaseModel):
    """Request to generate 3 scene skeletons for an act."""

    world_lore: dict[str, Any] = Field(
        description="World data: quest, setting, protagonist, faction, etc."
    )
    act_number: int = Field(description="Which act (1, 2, 3, etc.)")
    previous_outcomes: list[dict[str, Any]] | None = Field(
        default=None, description="Summary of previous act outcomes for continuity"
    )
    quest_progress: float = Field(
        default=0.0, description="Quest completion: 0.0 to 1.0"
    )
    resolution_points: list[dict[str, Any]] | None = Field(
        default=None,
        description="Required quest objectives (for finale detection)",
    )


class OutcomeBranch(BaseModel):
    """A single outcome possibility for a beat."""

    narrative: str = Field(description="Narrative text for this outcome (150-400 words)")
    hp_change: dict[int, int] = Field(
        default_factory=dict, description="HP change per party member ID"
    )
    stress_change: dict[int, int] = Field(
        default_factory=dict, description="Stress change per party member ID"
    )
    items_gained: list[str] = Field(
        default_factory=list, description="Items added to inventory"
    )
    items_lost: list[str] = Field(
        default_factory=list, description="Items removed from inventory"
    )
    story_flags: dict[str, Any] = Field(
        default_factory=dict, description="Story flags set (for continuity)"
    )


class BeatSkeleton(BaseModel):
    """A single beat within a scene skeleton.

    Each beat has pre-generated outcome branches for ALL 5 outcomes.
    During gameplay, dice roll determines which branch to use (NO AI CALL).
    """

    beat_number: int = Field(description="Beat order within scene")
    type: str = Field(
        description="challenge, story, combat, exploration, puzzle, epilogue"
    )
    core_situation: str = Field(
        description="The situation/challenge in this beat (50-100 words)"
    )
    challenge_attributes: list[str] = Field(
        default_factory=list,
        description="Which attributes can be used (e.g., ['perception', 'knowledge'])",
    )
    base_dc: int = Field(
        default=15, description="Base difficulty class (choices vary ±3)"
    )
    outcome_branches: dict[str, OutcomeBranch] = Field(
        default_factory=dict,
        description="Pre-generated outcomes: critical_success, success, partial, failure, critical_failure",
    )


class SceneSkeleton(BaseModel):
    """A single scene skeleton (1 of 3 in a batch)."""

    scene_number: int = Field(description="Scene number within act")
    core_challenge: str = Field(description="Main challenge/objective")
    challenge_type: str = Field(
        description="stealth, combat, social, exploration, puzzle"
    )
    key_npcs: list[str] = Field(default_factory=list, description="NPC names")
    location: str = Field(description="Where scene takes place")
    stakes: str = Field(description="What's at risk")
    is_finale: bool = Field(
        default=False, description="True if this is the final quest-resolving scene"
    )
    continuity_hooks: dict[str, Any] = Field(
        default_factory=dict, description="Flags for scene branching"
    )
    beats: list[BeatSkeleton] = Field(
        default_factory=list, description="2-3 beats per scene (not 5-7)"
    )


class SceneBatchResponse(BaseModel):
    """Response containing 3 generated scene skeletons."""

    scenes: list[SceneSkeleton] = Field(description="3 scene skeletons for the act")
    is_final_act: bool = Field(
        default=False,
        description="True if this is the final act (quest resolved in scene 3)",
    )


# ========================================
# Scene Beat Expansion (AI Input/Output)
# ========================================


class SceneBeatsRequest(BaseModel):
    """Request to expand a scene skeleton into narrative beats."""

    scene_skeleton: SceneSkeleton = Field(
        description="The pre-generated scene structure"
    )
    party_state: dict[str, Any] = Field(
        description="Current party HP, stress, inventory, etc."
    )
    world_lore: dict[str, Any] = Field(description="World context")


class Choice(BaseModel):
    """A player choice option for a beat."""

    text: str = Field(description="What the player does")
    attribute: str = Field(description="perception, influence, creativity, etc.")
    dc: int = Field(description="Difficulty class (10-22)")
    flaw_triggers: list[str] = Field(
        default_factory=list,
        description="Character flaws that would trigger disadvantage on this choice",
    )


class Beat(BaseModel):
    """A fully narrated beat with choices."""

    beat_number: int
    narrative: str = Field(description="Narrative text describing the situation")
    choice_required: bool = Field(
        default=False, description="Does player need to make a choice?"
    )
    choices: list[Choice] = Field(default_factory=list, description="Available actions")


class SceneBeatsResponse(BaseModel):
    """Response containing fully narrated beats."""

    beats: list[Beat] = Field(description="Narrative beats with choices")
