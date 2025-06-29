from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from db.user_selected_lore.models import UserSelectedLore
from db.lore_piece.models import LorePiece
from models.selected_lore_pieces import LoreSelectionCreate


async def create_lore_selection(
    db: AsyncSession, selection: LoreSelectionCreate
) -> Optional[UserSelectedLore]:
    lore_piece = await db.get(LorePiece, selection.lore_piece_id)
    if not lore_piece:
        return None

    new_selection = UserSelectedLore(
        user_id=selection.user_id,
        lore_piece_id=selection.lore_piece_id
    )
    db.add(new_selection)
    await db.commit()
    await db.refresh(new_selection)
    return new_selection


async def get_lore_selections_by_user(
    db: AsyncSession, user_id: str
) -> List[UserSelectedLore]:
    result = await db.execute(
        select(UserSelectedLore).where(UserSelectedLore.user_id == user_id)
    )
    return result.scalars().all()
