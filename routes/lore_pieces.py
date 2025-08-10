from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_async_db
from db.lore_piece.crud import (
    create_lore_piece,
    get_lore_pieces_by_type_and_theme,
    get_all_lore_pieces,
    get_lore_pieces_by_type,
    get_lore_pieces_by_theme,
)
from db.lore_piece.schemas import LorePieceRead
from models.lore_piece import LorePiece
from constants.themes import Theme
from utils.lore_conversion import convert_generated_lore_to_db

router = APIRouter(prefix="/lore-pieces", tags=["lore-pieces"])


@router.post("/", response_model=LorePieceRead)
async def save_lore_piece_to_db(
    lore_piece: LorePiece,
    theme: Theme,
    db: AsyncSession = Depends(get_async_db),
):
    """Save a generated lore piece to the database for user selection"""
    db_lore_piece = convert_generated_lore_to_db(lore_piece, theme)
    saved_lore = await create_lore_piece(db, db_lore_piece)
    return saved_lore


@router.get("/", response_model=List[LorePieceRead])
async def get_available_lore_pieces(
    lore_type: Optional[str] = Query(
        None, description="Filter by lore type (character, faction, etc.)"
    ),
    theme: Optional[Theme] = Query(None, description="Filter by theme"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_async_db),
):
    """Get available lore pieces for user selection with flexible filtering"""

    # If both filters are provided
    if lore_type and theme:
        return await get_lore_pieces_by_type_and_theme(
            db, lore_type, theme.value, limit
        )

    # If only lore_type is provided
    elif lore_type:
        return await get_lore_pieces_by_type(db, lore_type, limit)

    # If only theme is provided
    elif theme:
        return await get_lore_pieces_by_theme(db, theme.value, limit)

    # If no filters are provided
    else:
        return await get_all_lore_pieces(db, limit)
