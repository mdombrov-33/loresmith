import asyncio
import logging

from chains.multi_variant import (
    generate_multiple_characters,
    generate_multiple_factions,
    generate_multiple_settings,
    generate_multiple_events,
    generate_multiple_relics,
)
from models.lore_piece import LorePiece
from constants.themes import Theme
from fastapi import HTTPException

logger = logging.getLogger(__name__)


async def generate_all_variants(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> dict[str, list[LorePiece]]:
    try:
        character_task = generate_multiple_characters(count, theme)
        faction_task = generate_multiple_factions(count, theme)
        setting_task = generate_multiple_settings(count, theme)
        event_task = generate_multiple_events(count, theme)
        relic_task = generate_multiple_relics(count, theme)

        characters, factions, settings, events, relics = await asyncio.gather(
            character_task, faction_task, setting_task, event_task, relic_task
        )

        return {
            "characters": characters,
            "factions": factions,
            "settings": settings,
            "events": events,
            "relics": relics,
        }

    except Exception as e:
        logger.error(f"Error generating all variants: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Lore generation failed")
