from dataclasses import dataclass
from typing import List
from models.lore_piece import LorePiece


@dataclass
class GeneratedLoreBundle:
    character: List[LorePiece]
    faction: List[LorePiece]
    setting: List[LorePiece]
    event: List[LorePiece]
    relic: List[LorePiece]
