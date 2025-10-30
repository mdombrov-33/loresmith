"""
Adventure Mode AI Generation Models.

These are Pydantic models for AI request/response only.
Go service handles all database entities and state management.
"""

# Scene generation models
from .scene import (
    SceneBatchRequest,
    SceneBatchResponse,
    SceneSkeleton,
    BeatSkeleton,
    OutcomeBranch,
    SceneBeatsRequest,
    SceneBeatsResponse,
    Beat,
    Choice,
)

# Companion generation models
from .party import CompanionRequest, CompanionResponse

# Consequence generation models
from .outcome import ConsequenceRequest, ConsequenceResponse

# Inventory generation models
from .inventory import (
    StartingInventoryRequest,
    StartingInventoryResponse,
    Item,
)

__all__ = [
    # Scene batch generation
    "SceneBatchRequest",
    "SceneBatchResponse",
    "SceneSkeleton",
    "BeatSkeleton",
    "OutcomeBranch",
    # Scene beat expansion
    "SceneBeatsRequest",
    "SceneBeatsResponse",
    "Beat",
    "Choice",
    # Companion generation
    "CompanionRequest",
    "CompanionResponse",
    # Consequence generation
    "ConsequenceRequest",
    "ConsequenceResponse",
    # Inventory generation
    "StartingInventoryRequest",
    "StartingInventoryResponse",
    "Item",
]
