from utils.logger import logger
from config.settings import get_settings
from .prompt_builder import build_character_prompt
from .providers import generate_via_replicate, generate_via_automatic1111

settings = get_settings()


async def generate_character_images(
    name: str,
    appearance: str,
    theme: str,
    world_id: int,
    character_id: str,
    traits: list[str] | None = None,
    skills: list[dict] | None = None,
) -> dict[str, str | None]:
    """
    Generate portrait image for a character.

    Args:
        name: Character name
        appearance: Physical appearance description
        theme: World theme (steampunk, cyberpunk, etc.)
        world_id: ID of the world this character belongs to
        character_id: Unique identifier for the character
        traits: List of personality traits
        skills: List of skills with levels

    Returns:
        Dict with image_portrait URL (or None if disabled/failed)
    """
    if not settings.ENABLE_IMAGE_GENERATION:
        logger.info("Image generation disabled, skipping")
        return {"image_portrait": None}

    try:
        logger.info(f"Generating images for {name} using {settings.IMAGE_PROVIDER}")

        # Build optimized prompt
        prompt, negative_prompt = build_character_prompt(
            name, appearance, theme, traits, skills
        )

        if settings.IMAGE_PROVIDER == "replicate":
            return await generate_via_replicate(
                prompt, negative_prompt, world_id, character_id
            )
        elif settings.IMAGE_PROVIDER == "local":
            return await generate_via_automatic1111(
                prompt, negative_prompt, world_id, character_id
            )
        else:
            logger.warning(f"Unknown image provider: {settings.IMAGE_PROVIDER}")
            return {"image_portrait": None}

    except Exception as e:
        logger.error(f"Failed to generate character images: {e}", exc_info=True)
        # Don't fail character generation if images fail
        return {"image_portrait": None}
