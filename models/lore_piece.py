from dataclasses import dataclass
from typing import List, Literal


@dataclass
class LorePiece:
    name: str
    description: str
    details: List[str]
    type: Literal["character", "faction", "setting", "relic", "event"]
