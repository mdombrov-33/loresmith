from typing import Literal
from pydantic import BaseModel


class LorePiece(BaseModel):
    name: str
    description: str
    details: dict[str, str]
    type: Literal["character", "faction", "setting", "relic", "event"]
