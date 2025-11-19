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
    skills: list[str] | None = None,
) -> dict[str, str | None]:
    """
    Generate portrait image for a character and return as base64.

    Returns base64 instead of uploading straight to R2.
    Go will upload to R2 AFTER world creation with real world_id.

    Args:
        name: Character name
        appearance: Physical appearance description
        theme: World theme (steampunk, cyberpunk, etc.)
        world_id: Ignored for now (will be 0 during generation)
        character_id: Unique identifier for the character
        traits: List of personality traits
        skills: List of skill names for visual elements

    Returns:
        Dict with image_portrait_base64 (or None if disabled/failed)
    """
    if not settings.ENABLE_IMAGE_GENERATION:
        logger.info("Image generation disabled, skipping")
        return {"image_portrait_base64": None}

    try:
        logger.info(f"Generating images for {name} using {settings.IMAGE_PROVIDER}")

        # Build optimized prompt with skills for more distinctive portraits
        prompt, negative_prompt = build_character_prompt(
            name, appearance, theme, traits, skills
        )

        if settings.IMAGE_PROVIDER == "replicate":
            return await generate_via_replicate(prompt, negative_prompt, character_id)
        elif settings.IMAGE_PROVIDER == "local":
            return await generate_via_automatic1111(
                prompt, negative_prompt, character_id
            )
        else:
            logger.warning(f"Unknown image provider: {settings.IMAGE_PROVIDER}")
            return {"image_portrait_base64": None}

    except Exception as e:
        logger.error(f"Failed to generate character images: {e}", exc_info=True)
        # Don't fail character generation if images fail
        return {"image_portrait_base64": None}
