from pydantic import BaseModel, Field


class RelicDescription(BaseModel):
    """Relic description structured output"""

    description: str = Field(
        description="Physical appearance and known properties of the relic (2-3 sentences)"
    )


class RelicHistory(BaseModel):
    """Relic history structured output"""

    history: str = Field(
        description="The relic's origins and past significance (2-3 sentences)"
    )
