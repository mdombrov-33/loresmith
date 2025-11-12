import base64
from pathlib import Path
import aiohttp
from PIL import Image

from utils.logger import logger


async def save_base64_image(
    base64_data: str, world_id: int, character_id: str, image_type: str
) -> str:
    """
    Save base64-encoded image from Automatic1111 to file.

    Args:
        base64_data: Base64 encoded image data
        world_id: World ID for organizing files
        character_id: Character ID for file naming
        image_type: "card" or "portrait"

    Returns:
        Local file path where image was saved
    """
    # Use mounted volume path
    base_dir = Path("/app/generated")
    try:
        base_dir.mkdir(parents=True, exist_ok=True)
    except (OSError, PermissionError) as e:
        raise Exception(f"Could not access mounted image directory: {e}")

    world_dir = base_dir / str(world_id)
    world_dir.mkdir(parents=True, exist_ok=True)

    # File path
    filename = f"{character_id}_{image_type}.png"
    filepath = world_dir / filename

    # Decode and save
    image_data = base64.b64decode(base64_data)
    with open(filepath, "wb") as f:
        f.write(image_data)

    logger.info(f"Saved image to {filepath}")
    return str(filepath)


async def download_and_save_image(
    url: str, world_id: int, character_id: str, image_type: str
) -> str:
    """
    Download image from URL (Replicate) and save to mounted directory.

    Args:
        url: Image URL from Replicate
        world_id: World ID for organizing files
        character_id: Character ID for file naming
        image_type: "card" or "portrait"

    Returns:
        Local file path where image was saved
    """
    # Use mounted volume path
    base_dir = Path("/app/generated")
    try:
        base_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Using image directory: {base_dir}")
    except (OSError, PermissionError) as e:
        raise Exception(f"Could not access mounted image directory: {e}")

    world_dir = base_dir / str(world_id)
    world_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{character_id}_{image_type}.png"
    filepath = world_dir / filename

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                content = await response.read()
                with open(filepath, "wb") as f:
                    f.write(content)
                logger.info(f"Saved image to {filepath}")
                return str(filepath)
            else:
                raise Exception(f"Failed to download image: HTTP {response.status}")


async def crop_center_portrait(
    card_image_path: str, world_id: int, character_id: str
) -> str:
    """
    Crop center 256x256 portrait from card image.

    Args:
        card_image_path: Path to the card image
        world_id: World ID for organizing files
        character_id: Character ID for file naming

    Returns:
        Local file path where portrait was saved
    """
    base_dir = Path("/app/generated")
    world_dir = base_dir / str(world_id)
    world_dir.mkdir(parents=True, exist_ok=True)

    portrait_filename = f"{character_id}_portrait.png"
    portrait_path = world_dir / portrait_filename

    # Crop center 256x256
    with Image.open(card_image_path) as img:
        width, height = img.size
        left = (width - 256) // 2
        top = (height - 256) // 2
        right = left + 256
        bottom = top + 256

        portrait = img.crop((left, top, right, bottom))
        portrait.save(portrait_path, "PNG")

    logger.info(f"Cropped portrait to {portrait_path}")
    return str(portrait_path)


def build_image_urls(world_id: int, character_id: str) -> dict[str, str | None]:
    """Build public URL for generated portrait image."""
    return {
        "image_portrait": f"/generated/{world_id}/{character_id}_portrait.png",
    }
