import asyncio

from generate.models.lore_piece import LorePiece
from constants.themes import Theme
from generate.chains.character.character import generate_character
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
    progress_callback=None,
) -> list[LorePiece]:
    """
    Generic helper to generate multiple lore pieces.

    Args:
        prefix: Unused (kept for API compatibility).
        generate_func: Async function to generate a single lore piece.
        count: Number of lore pieces to generate.
        theme: Theme for generation.
        progress_callback: Optional async callback(progress, message) for tracking overall progress.

    Returns:
        List of LorePiece instances.
    """
    # Track completed steps across all parallel generations
    completed_steps = {"count": 0}
    # We'll calculate total_steps dynamically based on first callback
    total_steps = {"value": 0}

    async def item_progress_callback(step, item_total_steps, message):
        """Callback for individual item progress - aggregates to overall progress."""
        # Set total_steps on first callback
        if total_steps["value"] == 0:
            total_steps["value"] = count * item_total_steps

        completed_steps["count"] += 1

        if progress_callback:
            # Calculate overall progress: 20% at start, 90% when all done
            progress = 20 + int((completed_steps["count"] / total_steps["value"]) * 70)

            # Use the actual message from the generation function
            await progress_callback(progress, message)

    # Generate items in parallel, each with progress tracking
    items = await asyncio.gather(*(
        generate_func(theme, progress_callback=item_progress_callback)
        for _ in range(count)
    ))
    return items


async def generate_multiple_characters(
    count: int = 3, theme: Theme = Theme.post_apocalyptic, progress_callback=None
) -> list[LorePiece]:
    # Generate characters
    characters = await generate_multiple_generic(
        "characters", generate_character, count, theme, progress_callback
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
                    skills=skills,
                )
                logger.info(f"Published portrait job for {name}")
            else:
                logger.warning(
                    f"Missing UUID or appearance for {name}, skipping portrait job"
                )
        except Exception as e:
            logger.error(f"Failed to publish portrait job for {character.name}: {e}")

    return characters


async def generate_multiple_factions(
    count: int = 3, theme: Theme = Theme.post_apocalyptic, progress_callback=None
) -> list[LorePiece]:
    return await generate_multiple_generic("factions", generate_faction, count, theme, progress_callback)


async def generate_multiple_settings(
    count: int = 3, theme: Theme = Theme.post_apocalyptic, progress_callback=None
) -> list[LorePiece]:
    return await generate_multiple_generic("settings", generate_setting, count, theme, progress_callback)


async def generate_multiple_events(
    count: int,
    theme: Theme,
    setting: LorePiece,
    progress_callback=None
) -> list[LorePiece]:
    events = []
    total_steps = count * 3  # Each event has 3 steps (name, description, impact)
    completed_steps = {"count": 0}

    async def item_progress_callback(step, item_total_steps, message):
        """Callback for individual event progress - aggregates to overall progress."""
        completed_steps["count"] += 1

        if progress_callback:
            # Calculate overall progress: 20% at start, 90% when all done
            progress = 20 + int((completed_steps["count"] / total_steps) * 70)
            await progress_callback(progress, message)

    for i in range(count):
        event = await generate_event(theme, setting=setting, progress_callback=item_progress_callback)
        events.append(event)

    return events


async def generate_multiple_relics(
    count: int,
    theme: Theme,
    setting: LorePiece,
    event: LorePiece,
    progress_callback=None
) -> list[LorePiece]:
    relics = []
    total_steps = count * 3  # Each relic has 3 steps (name, description, history)
    completed_steps = {"count": 0}

    async def item_progress_callback(step, item_total_steps, message):
        """Callback for individual relic progress - aggregates to overall progress."""
        completed_steps["count"] += 1

        if progress_callback:
            # Calculate overall progress: 20% at start, 90% when all done
            progress = 20 + int((completed_steps["count"] / total_steps) * 70)
            await progress_callback(progress, message)

    for i in range(count):
        relic = await generate_relic(theme, setting=setting, event=event, progress_callback=item_progress_callback)
        relics.append(relic)

    return relics
