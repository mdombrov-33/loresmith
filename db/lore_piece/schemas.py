from typing import Optional, Dict
from pydantic import BaseModel
from constants.themes import Theme


class LorePieceCreate(BaseModel):
    name: str
    description: str
    type: str
    theme: Theme
    details: Optional[Dict] = None


class LorePieceRead(LorePieceCreate):
    id: int

    class Config:
        orm_mode = True


class UserSelectedLoreRead(BaseModel):
    id: int
    user_id: str
    lore_piece_id: int

    class Config:
        orm_mode = True
