from typing import List

from fastapi import APIRouter, Body, Query

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

router = APIRouter()


@router.get("/generate/all", response_model=GeneratedLoreBundle)
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
    return await generate_lore_variants(count, theme)


@router.get("/generate/characters", response_model=List[LorePiece])
async def generate_characters(
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
    return await generate_multiple_characters(count, theme, regenerate)


@router.get("/generate/factions", response_model=List[LorePiece])
async def generate_factions(
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
    return await generate_multiple_factions(count, theme, regenerate)


@router.get("/generate/settings", response_model=List[LorePiece])
async def generate_settings(
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
    return await generate_multiple_settings(count, theme, regenerate)


@router.get("/generate/events", response_model=List[LorePiece])
async def generate_events(
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
    return await generate_multiple_events(count, theme, regenerate)


@router.get("/generate/relics", response_model=List[LorePiece])
async def generate_relics(
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
    return await generate_multiple_relics(count, theme, regenerate)


@router.post("/generate/full-story", response_model=FullStory)
async def generate_story(
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
    """
    return await generate_full_story(selected_pieces, theme)
