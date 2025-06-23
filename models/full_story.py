from dataclasses import dataclass
from constants.themes import Theme
from models.selected_lore_pieces import SelectedLorePieces


@dataclass
class FullStory:
    title: str
    content: str
    theme: Theme
    pieces: SelectedLorePieces
