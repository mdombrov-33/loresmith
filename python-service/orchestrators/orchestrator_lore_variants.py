import asyncio

from utils.logger import logger
from models.generated_lore_bundle import GeneratedLoreBundle
from chains.multi_variant import (
    generate_multiple_characters,
    generate_multiple_factions,
    generate_multiple_settings,
    generate_multiple_events,
    generate_multiple_relics,
)
from constants.themes import Theme
from exceptions.generation import LoreVariantsGenerationError


async def generate_lore_variants(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> GeneratedLoreBundle:
    try:
        character_task = generate_multiple_characters(count, theme)
        faction_task = generate_multiple_factions(count, theme)
        setting_task = generate_multiple_settings(count, theme)
        event_task = generate_multiple_events(count, theme)
        relic_task = generate_multiple_relics(count, theme)

        characters, factions, settings, events, relics = await asyncio.gather(
            character_task, faction_task, setting_task, event_task, relic_task
        )

        return GeneratedLoreBundle(
            characters=characters,
            factions=factions,
            settings=settings,
            events=events,
            relics=relics,
        )

    except Exception as e:
        logger.error(f"Error generating lore variants: {e}", exc_info=True)
        raise LoreVariantsGenerationError(f"Lore variants generation failed: {str(e)}")
