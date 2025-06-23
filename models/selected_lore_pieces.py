from dataclasses import dataclass
from typing import Optional
from models.lore_piece import LorePiece


@dataclass
class SelectedLorePieces:
    character: Optional[LorePiece] = None
    faction: Optional[LorePiece] = None
    setting: Optional[LorePiece] = None
    event: Optional[LorePiece] = None
    relic: Optional[LorePiece] = None
