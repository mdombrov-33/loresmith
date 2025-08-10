from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from db.lore_piece.schemas import UserSelectedLoreRead
from db.session import get_async_db
from db.lore_piece.crud import create_lore_selection, get_lore_selections_by_user
from models.selected_lore_pieces import LoreSelectionCreate
from utils.jwt import verify_jwt_token
from typing import List

router = APIRouter()


async def get_current_user_id(request: Request) -> str:
    """Extract user ID from JWT token in cookies"""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        raise HTTPException(status_code=401, detail="Invalid token")

    return user_id


@router.post(
    "/user-selected-lore",
    response_model=UserSelectedLoreRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new lore selection for current user",
)
async def add_lore_selection(
    selection: LoreSelectionCreate,
    request: Request,
    db: AsyncSession = Depends(get_async_db),
):
    current_user_id = await get_current_user_id(request)

    # Ensure user can only select lore for themselves
    if selection.user_id != current_user_id:
        raise HTTPException(
            status_code=403, detail="Cannot select lore for other users"
        )

    new_selection = await create_lore_selection(db, selection)
    if not new_selection:
        raise HTTPException(status_code=400, detail="Lore piece not found")
    return new_selection


@router.get(
    "/user-selected-lore",
    response_model=List[UserSelectedLoreRead],
    summary="Get all lore selections for current user",
)
async def read_my_selected_lore(
    request: Request,
    db: AsyncSession = Depends(get_async_db),
):
    current_user_id = await get_current_user_id(request)
    selections = await get_lore_selections_by_user(db, current_user_id)
    return selections


@router.get(
    "/user-selected-lore/{user_id}",
    response_model=List[UserSelectedLoreRead],
    summary="Get all lore selections by a user (admin only)",
)
async def read_user_selected_lore(
    user_id: str,
    db: AsyncSession = Depends(get_async_db),
):
    # TODO: Add admin check here
    selections = await get_lore_selections_by_user(db, user_id)
    return selections
