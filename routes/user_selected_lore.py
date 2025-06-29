from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from db.lore_piece.schemas import UserSelectedLoreRead
from db.session import get_async_db
from db.lore_piece.crud import create_lore_selection, get_lore_selections_by_user
from models.selected_lore_pieces import LoreSelectionCreate

router = APIRouter()


@router.post(
    "/user-selected-lore",
    response_model=List[UserSelectedLoreRead],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new lore selection for a user",
)
async def add_lore_selection(
    selection: LoreSelectionCreate,
    db: AsyncSession = Depends(get_async_db),
):
    new_selection = await create_lore_selection(db, selection)
    if not new_selection:
        raise HTTPException(status_code=400, detail="Failed to create lore selection")
    return new_selection


@router.get(
    "/user-selected-lore/{user_id}",
    response_model=List[UserSelectedLoreRead],
    summary="Get all lore selections by a user",
)
async def read_user_selected_lore(
    user_id: str,
    db: AsyncSession = Depends(get_async_db),
):
    selections = await get_lore_selections_by_user(db, user_id)
    if not selections:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No lore selections found for this user",
        )
    return selections
