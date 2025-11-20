"""
Pydantic schemas for structured character generation.
Forces LLM to return valid structured data - no manual parsing needed.
"""

from pydantic import BaseModel, Field


class CharacterTraits(BaseModel):
    """Exactly 3 personality traits from the predefined list."""

    traits: list[str] = Field(
        description="Exactly 3 personality trait names from the provided list",
        min_length=3,
        max_length=3,
    )


class CharacterSkills(BaseModel):
    """List of 3-5 character skills."""

    skills: list[str] = Field(
        description="3-5 specific, practical skills", min_length=3, max_length=5
    )


class CharacterStats(BaseModel):
    """Character statistics and attributes."""

    health: int = Field(description="Health points", ge=50, le=150)
    stress: int = Field(description="Stress level", ge=0, le=50)
    knowledge: int = Field(description="Knowledge stat", ge=8, le=18)
    empathy: int = Field(description="Empathy stat", ge=8, le=18)
    resilience: int = Field(description="Resilience stat", ge=8, le=18)
    creativity: int = Field(description="Creativity stat", ge=8, le=18)
    influence: int = Field(description="Influence stat", ge=8, le=18)
    perception: int = Field(description="Perception stat", ge=8, le=18)
