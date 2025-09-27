from models.lore_piece import LorePiece
from pydantic import BaseModel


class GeneratedLoreBundle(BaseModel):
    characters: list[LorePiece]
    factions: list[LorePiece]
    settings: list[LorePiece]
    events: list[LorePiece]
    relics: list[LorePiece]
