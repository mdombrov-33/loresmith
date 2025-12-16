from utils.logger import logger
from config.settings import get_settings
from .prompt_builder import build_world_scene_prompt
from .providers import generate_world_via_automatic1111, generate_world_via_replicate

settings = get_settings()


async def generate_world_image(
    world_title: str,
    full_story: str,
    theme: str,
    setting_description: str = "",
    use_replicate: bool = False,
) -> str:
    """
    Generate a world scene/environment image based on world story.

    Args:
        world_title: Title of the world
        full_story: Full narrative description
        theme: World theme (fantasy, cyberpunk, etc.)
        setting_description: Optional specific setting description
        use_replicate: If True, use Replicate API. Otherwise use Automatic1111.

    Returns:
        Base64 encoded image string

    Raises:
        Exception if generation fails
    """
    logger.info(f"Generating world image for '{world_title}' (theme: {theme})")

    positive_prompt, negative_prompt = await build_world_scene_prompt(
        world_title=world_title,
        full_story=full_story,
        theme=theme,
        setting_description=setting_description,
    )

    logger.info(f"World scene prompt: {positive_prompt[:150]}...")

    if use_replicate:
        image_base64 = await generate_world_via_replicate(
            prompt=positive_prompt,
            negative_prompt=negative_prompt,
            width=1024,
            height=768,  # Landscape aspect ratio for world scenes
        )
    else:
        image_base64 = await generate_world_via_automatic1111(
            prompt=positive_prompt,
            negative_prompt=negative_prompt,
            width=1024,
            height=768,
        )

    logger.info(f"Successfully generated world image for '{world_title}'")
    return image_base64
