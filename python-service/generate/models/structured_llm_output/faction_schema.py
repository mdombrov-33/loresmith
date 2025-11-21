from pydantic import BaseModel, Field


class FactionIdeology(BaseModel):
    """Faction ideology structured output"""

    ideology: str = Field(
        description="The faction's core beliefs and values (1-2 sentences)"
    )


class FactionAppearance(BaseModel):
    """Faction appearance structured output"""

    appearance: str = Field(
        description="How faction members dress and present themselves (2-3 sentences)"
    )


class FactionSummary(BaseModel):
    """Faction summary structured output"""

    summary: str = Field(
        description="Overall description of the faction and their role in the world (2-3 sentences)"
    )
