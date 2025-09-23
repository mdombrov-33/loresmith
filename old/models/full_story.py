from constants.themes import Theme
from models.selected_lore_pieces import SelectedLorePieces
from pydantic import BaseModel


class FullStory(BaseModel):
    title: str
    content: str
    theme: Theme
    pieces: SelectedLorePieces
