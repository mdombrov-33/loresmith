from typing import List
from models.lore_piece import LorePiece
from pydantic import BaseModel


class GeneratedLoreBundle(BaseModel):
    characters: List[LorePiece]
    factions: List[LorePiece]
    settings: List[LorePiece]
    events: List[LorePiece]
    relics: List[LorePiece]
