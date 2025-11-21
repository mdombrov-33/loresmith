from pydantic import BaseModel, Field


class EventDescription(BaseModel):
    """Event description structured output"""

    description: str = Field(
        description="What happened during this event (2-3 sentences)"
    )


class EventImpact(BaseModel):
    """Event impact structured output"""

    impact: str = Field(
        description="How this event changed the world or affected people (2-3 sentences)"
    )
