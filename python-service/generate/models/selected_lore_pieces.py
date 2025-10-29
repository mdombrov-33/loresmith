from typing import Optional
from generate.models.lore_piece import LorePiece
from pydantic import BaseModel


class SelectedLorePieces(BaseModel):
    character: Optional[LorePiece] = None
    faction: Optional[LorePiece] = None
    setting: Optional[LorePiece] = None
    event: Optional[LorePiece] = None
    relic: Optional[LorePiece] = None
