from fastapi import APIRouter, Query
from orchestrators.orchestrator import generate_all_variants
from models.lore_piece import LorePiece
from typing import List, Dict
from chains.multi_variant import (
    generate_multiple_characters,
    generate_multiple_factions,
    generate_multiple_settings,
    generate_multiple_events,
    generate_multiple_relics,
)
from constants.themes import Theme

router = APIRouter()


@router.get("/generate/all", response_model=Dict[str, List[LorePiece]])
async def generate_all(
    count: int = Query(3, ge=1, le=10), theme: Theme = Theme.post_apocalyptic
):
    """
    Generate all lore variants including characters, factions, settings, events, and relics.

    Parameters:
    - count: Number of variants to generate (default is 3, must be between 1 and 10).

    Returns:
    A dictionary containing lists of generated lore pieces.
    """
    return await generate_all_variants(count, theme)


@router.get("/generate/characters", response_model=List[LorePiece])
async def generate_characters(
    count: int = Query(3, ge=1, le=10), theme: Theme = Theme.post_apocalyptic
):
    """
    Generate a list of character lore pieces.

    Parameters:
    - count: Number of characters to generate (default is 3, must be between 1 and 10).

    Returns:
    A list of generated character lore pieces.
    """
    return await generate_multiple_characters(count, theme)


@router.get("/generate/factions", response_model=List[LorePiece])
async def generate_factions(
    count: int = Query(3, ge=1, le=10), theme: Theme = Theme.post_apocalyptic
):
    """
    Generate a list of faction lore pieces.

    Parameters:
    - count: Number of factions to generate (default is 3, must be between 1 and 10).

    Returns:
    A list of generated faction lore pieces.
    """
    return await generate_multiple_factions(count, theme)


@router.get("/generate/settings", response_model=List[LorePiece])
async def generate_settings(
    count: int = Query(3, ge=1, le=10), theme: Theme = Theme.post_apocalyptic
):
    """
    Generate a list of setting lore pieces.

    Parameters:
    - count: Number of settings to generate (default is 3, must be between 1 and 10).

    Returns:
    A list of generated setting lore pieces.
    """
    return await generate_multiple_settings(count, theme)


@router.get("/generate/events", response_model=List[LorePiece])
async def generate_events(
    count: int = Query(3, ge=1, le=10), theme: Theme = Theme.post_apocalyptic
):
    """
    Generate a list of event lore pieces.

    Parameters:
    - count: Number of events to generate (default is 3, must be between 1 and 10).

    Returns:
    A list of generated event lore pieces.
    """
    return await generate_multiple_events(count, theme)


@router.get("/generate/relics", response_model=List[LorePiece])
async def generate_relics(
    count: int = Query(3, ge=1, le=10), theme: Theme = Theme.post_apocalyptic
):
    """
    Generate a list of relic lore pieces.

    Parameters:
    - count: Number of relics to generate (default is 3, must be between 1 and 10).

    Returns:
    A list of generated relic lore pieces.
    """
    return await generate_multiple_relics(count, theme)
