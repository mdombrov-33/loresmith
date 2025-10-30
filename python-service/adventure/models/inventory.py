"""
Inventory generation models for AI input/output.

These are NOT database entities - they're Pydantic models for AI generation.
Go service handles all inventory management and database operations.
"""

from typing import Any
from pydantic import BaseModel, Field


# ========================================
# Starting Inventory Generation
# ========================================


class StartingInventoryRequest(BaseModel):
    """Request to generate 3-5 starting items for an adventure."""

    protagonist_info: dict[str, Any] = Field(
        description="Protagonist data: name, skills, personality"
    )
    world_info: dict[str, Any] = Field(
        description="World data: theme, setting, relic for context"
    )


class Item(BaseModel):
    """A single inventory item."""

    name: str = Field(description="Item name (thematic to world)")
    description: str = Field(description="1-2 sentence description")
    item_type: str = Field(description="consumable, equipment, quest_item, crafting")
    effect: dict[str, Any] = Field(
        description="Effect definition (type, value, stat, duration, etc.)"
    )


class StartingInventoryResponse(BaseModel):
    """AI-generated starting items.

    Returns 3-5 items:
    - 1 healing item
    - 1 utility item (related to protagonist skills)
    - 1-3 thematic items (based on world/setting)
    """

    items: list[Item] = Field(
        min_length=3,
        max_length=5,
        description="Starting items for this protagonist/world",
    )
