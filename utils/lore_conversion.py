from models.lore_piece import LorePiece
from db.lore_piece.schemas import LorePieceCreate
from constants.themes import Theme


def convert_generated_lore_to_db(
    lore_piece: LorePiece, theme: Theme
) -> LorePieceCreate:
    """Convert a generated LorePiece to database format"""
    return LorePieceCreate(
        name=lore_piece.name,
        description=lore_piece.description,
        type=lore_piece.type,
        theme=theme,
        details=lore_piece.details,
    )
