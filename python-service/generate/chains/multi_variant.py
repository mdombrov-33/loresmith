import asyncio

from generate.models.lore_piece import LorePiece
from constants.themes import Theme
from generate.chains.character import generate_character
from generate.chains.faction import generate_faction
from generate.chains.setting import generate_setting
from generate.chains.event import generate_event
from generate.chains.relic import generate_relic
from services.image_gen.portraits.operations import publish_portrait_job
from utils.logger import logger


async def generate_multiple_generic(
    prefix: str,
    generate_func,
    count: int,
    theme: Theme,
) -> list[LorePiece]:
    """
    Generic helper to generate multiple lore pieces.

    Args:
        prefix: Unused (kept for API compatibility).
        generate_func: Async function to generate a single lore piece.
        count: Number of lore pieces to generate.
        theme: Theme for generation.

    Returns:
        List of LorePiece instances.
    """
    # Generate items without caching
    items = await asyncio.gather(*(generate_func(theme) for _ in range(count)))
    return items


async def generate_multiple_characters(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    # Generate characters
    characters = await generate_multiple_generic(
        "characters", generate_character, count, theme
    )

    # Publish portrait jobs to RabbitMQ
    for character in characters:
        try:
            uuid = character.details.get("uuid")
            name = character.name
            appearance = character.details.get("appearance")
            traits = character.details.get("traits", [])
            skills = character.details.get("skills", [])

            if uuid and appearance:
                publish_portrait_job(
                    uuid=uuid,
                    name=name,
                    appearance=appearance,
                    theme=theme,
                    traits=traits,
                    skills=skills
                )
                logger.info(f"Published portrait job for {name}")
            else:
                logger.warning(f"Missing UUID or appearance for {name}, skipping portrait job")
        except Exception as e:
            logger.error(f"Failed to publish portrait job for {character.name}: {e}")

    return characters


async def generate_multiple_factions(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    return await generate_multiple_generic(
        "factions", generate_faction, count, theme
    )


async def generate_multiple_settings(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    return await generate_multiple_generic(
        "settings", generate_setting, count, theme
    )


async def generate_multiple_events(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    return await generate_multiple_generic(
        "events", generate_event, count, theme
    )


async def generate_multiple_relics(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    return await generate_multiple_generic(
        "relics", generate_relic, count, theme
    )
