from typing import Dict, Literal
from pydantic import BaseModel


class LorePiece(BaseModel):
    name: str
    description: str
    details: Dict[str, str]
    type: Literal["character", "faction", "setting", "relic", "event"]
