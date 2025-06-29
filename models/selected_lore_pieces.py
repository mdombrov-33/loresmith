from typing import Optional
from models.lore_piece import LorePiece
from pydantic import BaseModel


# For UI selection
class SelectedLorePieces(BaseModel):
    character: Optional[LorePiece] = None
    faction: Optional[LorePiece] = None
    setting: Optional[LorePiece] = None
    event: Optional[LorePiece] = None
    relic: Optional[LorePiece] = None

# For DB insertion
class LoreSelectionCreate(BaseModel):
    user_id: str
    lore_piece_id: int