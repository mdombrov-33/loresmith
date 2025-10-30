from typing import Literal, Any
from pydantic import BaseModel


class LorePiece(BaseModel):
    name: str
    description: str
    details: dict[str, Any]
    type: Literal["character", "faction", "setting", "relic", "event"]
