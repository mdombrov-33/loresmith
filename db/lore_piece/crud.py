from sqlalchemy.ext.asyncio import AsyncSession

from db.user_selected_lore.models import UserSelectedLore
from models.selected_lore_pieces import LoreSelectionCreate


async def create_lore_selection(
    db: AsyncSession, selection: LoreSelectionCreate
) -> UserSelectedLore:
    new_selection = UserSelectedLore(
        user_id=selection.user_id,
        lore_piece_id=selection.lore_piece_id
    )
    db.add(new_selection)
    await db.commit()
    await db.refresh(new_selection)
    return new_selection