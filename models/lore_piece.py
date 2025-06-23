from typing import List, Literal
from pydantic import BaseModel


class LorePiece(BaseModel):
    name: str
    description: str
    details: List[str]
    type: Literal["character", "faction", "setting", "relic", "event"]
