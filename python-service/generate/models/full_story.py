from constants.themes import Theme
from generate.models.selected_lore_pieces import SelectedLorePieces
from pydantic import BaseModel


class FullStory(BaseModel):
    content: str
    theme: Theme
    pieces: SelectedLorePieces
    quest: dict[str, str]
