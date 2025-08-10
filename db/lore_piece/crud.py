from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from db.user_selected_lore.models import UserSelectedLore
from db.lore_piece.models import LorePiece
from db.lore_piece.schemas import LorePieceCreate
from models.selected_lore_pieces import LoreSelectionCreate


async def create_lore_piece(db: AsyncSession, lore_piece: LorePieceCreate) -> LorePiece:
    """Create a new lore piece in the database"""
    db_lore_piece = LorePiece(**lore_piece.dict())
    db.add(db_lore_piece)
    await db.commit()
    await db.refresh(db_lore_piece)
    return db_lore_piece


async def get_lore_piece_by_id(
    db: AsyncSession, lore_piece_id: int
) -> Optional[LorePiece]:
    """Get a lore piece by ID"""
    return await db.get(LorePiece, lore_piece_id)


async def get_lore_pieces_by_type_and_theme(
    db: AsyncSession, lore_type: str, theme: str, limit: int = 50
) -> List[LorePiece]:
    """Get lore pieces by type and theme"""
    result = await db.execute(
        select(LorePiece)
        .where(LorePiece.type == lore_type, LorePiece.theme == theme)
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_lore_pieces_by_type(
    db: AsyncSession, lore_type: str, limit: int = 50
) -> List[LorePiece]:
    """Get lore pieces by type only"""
    result = await db.execute(
        select(LorePiece)
        .where(LorePiece.type == lore_type)
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_lore_pieces_by_theme(
    db: AsyncSession, theme: str, limit: int = 50
) -> List[LorePiece]:
    """Get lore pieces by theme only"""
    result = await db.execute(
        select(LorePiece)
        .where(LorePiece.theme == theme)
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_all_lore_pieces(db: AsyncSession, limit: int = 100) -> List[LorePiece]:
    """Get all lore pieces"""
    result = await db.execute(select(LorePiece).limit(limit))
    return list(result.scalars().all())


async def create_lore_selection(
    db: AsyncSession, selection: LoreSelectionCreate
) -> Optional[UserSelectedLore]:
    lore_piece = await db.get(LorePiece, selection.lore_piece_id)
    if not lore_piece:
        return None

    new_selection = UserSelectedLore(
        user_id=selection.user_id, lore_piece_id=selection.lore_piece_id
    )
    db.add(new_selection)
    await db.commit()
    await db.refresh(new_selection)

    # Load the relationship explicitly
    result = await db.execute(
        select(UserSelectedLore)
        .where(UserSelectedLore.id == new_selection.id)
        .options(selectinload(UserSelectedLore.lore_piece))
    )
    return result.scalar_one()


async def get_lore_selections_by_user(
    db: AsyncSession, user_id: str
) -> List[UserSelectedLore]:
    result = await db.execute(
        select(UserSelectedLore)
        .where(UserSelectedLore.user_id == user_id)
        .options(selectinload(UserSelectedLore.lore_piece))
    )
    return list(result.scalars().all())
