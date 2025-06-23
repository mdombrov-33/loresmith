from dataclasses import dataclass
from typing import List
from models.lore_piece import LorePiece


@dataclass
class GeneratedLoreBundle:
    characters: List[LorePiece]
    factions: List[LorePiece]
    settings: List[LorePiece]
    events: List[LorePiece]
    relics: List[LorePiece]
