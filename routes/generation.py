from typing import List
from services.rate_limiter import is_rate_limited

from fastapi import APIRouter, Body, Query, Request, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from chains.multi_variant import (
    generate_multiple_characters,
    generate_multiple_events,
    generate_multiple_factions,
    generate_multiple_relics,
    generate_multiple_settings,
)
from constants.themes import Theme
from models.full_story import FullStory
from models.generated_lore_bundle import GeneratedLoreBundle
from models.lore_piece import LorePiece
from models.selected_lore_pieces import SelectedLorePieces
from orchestrators import generate_full_story, generate_lore_variants
from db.session import get_async_db
from db.lore_piece.crud import create_lore_piece
from db.lore_piece.schemas import LorePieceRead
from utils.lore_conversion import convert_generated_lore_to_db


router = APIRouter()


@router.get("/generate/all", response_model=GeneratedLoreBundle)
async def generate_all(
    request: Request,
    count: int = Query(3, ge=1, le=10),
    theme: Theme = Theme.post_apocalyptic,
):
    """
    Generate all lore variants including characters, factions, settings, events, and relics.

    Parameters:
    - count: Number of variants to generate (default is 3, must be between 1 and 10).

    Returns:
    A dictionary containing lists of generated lore pieces.
    """

    client_ip = request.client.host

    if await is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
        )

    return await generate_lore_variants(count, theme)


@router.get("/generate/characters", response_model=List[LorePiece])
async def generate_characters(
    request: Request,
    count: int = Query(3, ge=1, le=10),
    theme: Theme = Theme.post_apocalyptic,
    regenerate: bool = False,
):
    """
    Generate a list of character lore pieces.

    Parameters:
    - count: Number of characters to generate (default is 3, must be between 1 and 10).

    Returns:
    A list of generated character lore pieces.
    """

    client_ip = request.client.host

    if await is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
        )

    return await generate_multiple_characters(count, theme, regenerate)


@router.get("/generate/factions", response_model=List[LorePiece])
async def generate_factions(
    request: Request,
    count: int = Query(3, ge=1, le=10),
    theme: Theme = Theme.post_apocalyptic,
    regenerate: bool = False,
):
    """
    Generate a list of faction lore pieces.

    Parameters:
    - count: Number of factions to generate (default is 3, must be between 1 and 10).

    Returns:
    A list of generated faction lore pieces.
    """

    client_ip = request.client.host

    if await is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
        )

    return await generate_multiple_factions(count, theme, regenerate)


@router.get("/generate/settings", response_model=List[LorePiece])
async def generate_settings(
    request: Request,
    count: int = Query(3, ge=1, le=10),
    theme: Theme = Theme.post_apocalyptic,
    regenerate: bool = False,
):
    """
    Generate a list of setting lore pieces.

    Parameters:
    - count: Number of settings to generate (default is 3, must be between 1 and 10).

    Returns:
    A list of generated setting lore pieces.
    """

    client_ip = request.client.host

    if await is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
        )

    return await generate_multiple_settings(count, theme, regenerate)


@router.get("/generate/events", response_model=List[LorePiece])
async def generate_events(
    request: Request,
    count: int = Query(3, ge=1, le=10),
    theme: Theme = Theme.post_apocalyptic,
    regenerate: bool = False,
):
    """
    Generate a list of event lore pieces.

    Parameters:
    - count: Number of events to generate (default is 3, must be between 1 and 10).

    Returns:
    A list of generated event lore pieces.
    """

    client_ip = request.client.host

    if await is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
        )

    return await generate_multiple_events(count, theme, regenerate)


@router.get("/generate/relics", response_model=List[LorePiece])
async def generate_relics(
    request: Request,
    count: int = Query(3, ge=1, le=10),
    theme: Theme = Theme.post_apocalyptic,
    regenerate: bool = False,
):
    """
    Generate a list of relic lore pieces.

    Parameters:
    - count: Number of relics to generate (default is 3, must be between 1 and 10).

    Returns:
    A list of generated relic lore pieces.
    """

    client_ip = request.client.host

    if await is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
        )

    return await generate_multiple_relics(count, theme, regenerate)


@router.post("/generate/full-story", response_model=FullStory)
async def generate_story(
    request: Request,
    selected_pieces: SelectedLorePieces = Body(...),
    theme: Theme = Query(Theme.post_apocalyptic),
):
    """
    Generate a full story based on selected lore pieces and a theme.

    Parameters:
    - selected_pieces: Selected lore pieces (character, faction, etc.) as JSON body.
    - theme: Theme of the story (query param, defaults to post-apocalyptic).

    Returns:
    A full story combining all selected pieces.

    JSON Body example:
        {
      "character": {
        "name": "Echo",
        "description": "A skilled scavenger navigating the ruins of a fallen city.",
        "details": {
          "personality": "Cautious, intelligent, burdened by the past",
          "appearance": "Dust-covered cloak, reflective goggles, scavenged tech gear"
        },
        "type": "character"
      },
      "faction": {
        "name": "Steel Reclaimers",
        "description": "A militant faction obsessed with recovering pre-war technology.",
        "details": {
          "ideology": "Technology must be controlled to enforce order",
          "appearance": "Armored uniforms, metallic insignia, glowing visors"
        },
        "type": "faction"
      },
      "setting": {
        "name": "Ashfall City",
        "description": "A ruined megacity buried in ash and fog.",
        "details": {
          "landscape": "Collapsed skyscrapers, toxic rivers, ash storms",
          "dangers": "Radioactive zones, rogue drones, scavenger gangs"
        },
        "type": "setting"
      },
      "event": {
        "name": "The Collapse",
        "description": "The catastrophic shutdown of global power grids that marked the end of the old world.",
        "details": {
          "impact": "Plunged the world into chaos and birthed new powers"
        },
        "type": "event"
      },
      "relic": {
        "name": "The Pathseeker Map",
        "description": "A shimmering, semi-holographic map once used for space exploration.",
        "details": {
          "history": "Said to hold data that could restart civilization",
          "appearance": "Translucent surface, faint glowing constellations"
        },
        "type": "relic"
      }
    }
    """

    client_ip = request.client.host

    if await is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
        )

    return await generate_full_story(selected_pieces, theme)


@router.post("/save-lore-piece", response_model=LorePieceRead)
async def save_lore_piece_to_db(
    lore_piece: LorePiece,
    theme: Theme,
    db: AsyncSession = Depends(get_async_db),
):
    """Save a generated lore piece to the database for user selection"""
    db_lore_piece = convert_generated_lore_to_db(lore_piece, theme)
    saved_lore = await create_lore_piece(db, db_lore_piece)
    return saved_lore


@router.get("/lore-pieces", response_model=List[LorePieceRead])
async def get_available_lore_pieces(
    lore_type: str = Query(
        None, description="Filter by lore type (character, faction, etc.)"
    ),
    theme: Theme = Query(None, description="Filter by theme"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_async_db),
):
    """Get available lore pieces for user selection"""
    from db.lore_piece.crud import (
        get_lore_pieces_by_type_and_theme,
        get_all_lore_pieces,
    )

    if lore_type and theme:
        return await get_lore_pieces_by_type_and_theme(
            db, lore_type, theme.value, limit
        )
    else:
        return await get_all_lore_pieces(db, limit)
