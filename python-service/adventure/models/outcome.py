"""
Consequence generation models for AI input/output.

These are NOT database entities - they're Pydantic models for AI generation.
Go service handles all dice rolling and state updates.
"""

from typing import Any
from pydantic import BaseModel, Field


# ========================================
# Consequence Generation (AI Input/Output)
# ========================================


class ConsequenceRequest(BaseModel):
    """Request to generate consequences of a player choice."""

    choice: str = Field(description="The choice the player made")
    roll_result: dict[str, Any] | None = Field(
        default=None,
        description="Dice roll data: roll_value, modifier, dc, total, outcome",
    )
    scene_context: dict[str, Any] = Field(
        description="Current scene/beat info for context"
    )
    party_state: dict[str, Any] = Field(
        description="Current party HP, stress, etc."
    )


class ConsequenceResponse(BaseModel):
    """AI-generated consequences.

    This data gets saved to scene_log.consequences JSONB column in Go.
    """

    hp_change: dict[int, int] = Field(
        default_factory=dict,
        description="HP changes by party_member_id (negative = damage)",
    )
    stress_change: dict[int, int] = Field(
        default_factory=dict, description="Stress changes by party_member_id"
    )
    items_gained: list[str] = Field(
        default_factory=list, description="Items added to inventory"
    )
    items_lost: list[str] = Field(
        default_factory=list, description="Items removed from inventory"
    )
    story_flags: dict[str, Any] = Field(
        default_factory=dict, description="Story state flags set"
    )
    narrative_description: str = Field(
        description="Narrative text describing what happened"
    )
