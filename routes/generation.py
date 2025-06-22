from fastapi import APIRouter, Query
from orchestrators.orchestrator import generate_all_variants
from models.lore_piece import LorePiece
from typing import List, Dict

router = APIRouter()


@router.get("/generate/all", response_model=Dict[str, List[LorePiece]])
async def generate_all(count: int = Query(3, ge=1, le=10)):
    """
    Generate all lore variants including characters, factions, settings, events, and relics.

    Parameters:
    - count: Number of variants to generate (default is 3, must be between 1 and 10).

    Returns:
    A dictionary containing lists of generated lore pieces.
    """
    return await generate_all_variants(count)
