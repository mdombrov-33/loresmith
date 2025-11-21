from pydantic import BaseModel, Field


class SettingLandscape(BaseModel):
    """Setting landscape structured output"""

    landscape: str = Field(
        description="Physical description of the terrain and environment (2-3 sentences)"
    )


class SettingCulture(BaseModel):
    """Setting culture structured output"""

    culture: str = Field(
        description="The customs, traditions, and way of life of inhabitants (2-3 sentences)"
    )


class SettingHistory(BaseModel):
    """Setting history structured output"""

    history: str = Field(
        description="Key historical events that shaped this location (2-3 sentences)"
    )


class SettingEconomy(BaseModel):
    """Setting economy structured output"""

    economy: str = Field(
        description="How people survive, trade, and acquire resources (2-3 sentences)"
    )


class SettingSummary(BaseModel):
    """Setting summary structured output"""

    summary: str = Field(
        description="Overall description synthesizing all aspects of the setting (2-3 sentences)"
    )
