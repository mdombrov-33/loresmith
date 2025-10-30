"""
Companion generation models for AI input/output.

These are NOT database entities - they're Pydantic models for AI generation.
Go service handles all party management and database operations.
"""

from pydantic import BaseModel, Field


# ========================================
# Companion Generation (AI Input/Output)
# ========================================


class CompanionRequest(BaseModel):
    """Request to generate a companion character."""

    protagonist_info: dict[str, str] = Field(
        description="Protagonist data: name, personality, backstory, skills"
    )
    relationship_type: str = Field(
        description="ally, rival, mentor, friend, etc."
    )
    world_lore: dict[str, str] = Field(
        description="World theme, faction, setting for context"
    )


class CompanionResponse(BaseModel):
    """AI-generated companion character data.

    This matches party_members table schema in Go.
    """

    name: str
    description: str
    relationship_to_protagonist: str
    relationship_level: int = Field(
        default=0, description="Affection/trust: -100 (hostile) to +100 (devoted)"
    )
    max_hp: int
    current_hp: int
    stress: int
    lore_mastery: int
    empathy: int
    resilience: int
    creativity: int
    influence: int
    perception: int
    skills: str  # Will be stored as JSONB in party_members table (via migration 00008)
    flaw: str
    personality: str
    appearance: str
    position: int  # 1-3 for companions (0 is protagonist)
