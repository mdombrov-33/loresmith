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

logger = logging.getLogger(__name__)


async def generate_all_variants(count: int = 3) -> dict[str, list[LorePiece]]:
    try:
        character_task = generate_multiple_characters(count)
        faction_task = generate_multiple_factions(count)
        setting_task = generate_multiple_settings(count)
        event_task = generate_multiple_events(count)
        relic_task = generate_multiple_relics(count)

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
