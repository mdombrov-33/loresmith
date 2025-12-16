import os
import asyncio
import aiohttp
import base64

from utils.logger import logger
from config.settings import get_settings

settings = get_settings()

try:
    import replicate

    REPLICATE_AVAILABLE = True
except ImportError:
    REPLICATE_AVAILABLE = False


async def generate_world_via_automatic1111(
    prompt: str,
    negative_prompt: str,
    width: int = 1024,
    height: int = 768,
) -> str:
    """
    Generate world scene image via local Automatic1111 API.

    NOTE: Uses whatever model is currently loaded in Automatic1111.
    For better results, load a landscape/environment-focused model.

    Args:
        prompt: Positive prompt for world scene
        negative_prompt: Negative prompt
        width: Image width (default 1024 for landscape)
        height: Image height (default 768 for landscape)

    Returns:
        Base64 encoded image string
    """
    api_url = settings.AUTOMATIC1111_URL
    if not api_url:
        raise ValueError("AUTOMATIC1111_URL not configured")

    payload = {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "steps": 20,
        "cfg_scale": 7.0,
        "width": width,
        "height": height,
        "sampler_name": "DPM++ 2M",
        "seed": -1,
    }

    logger.info(f"Generating world image ({width}x{height}) via Automatic1111...")

    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{api_url}/sdapi/v1/txt2img", json=payload
        ) as response:
            if response.status != 200:
                error_text = await response.text()
                raise Exception(f"Automatic1111 API error: {error_text}")

            result = await response.json()
            if not result.get("images") or len(result["images"]) == 0:
                raise Exception("No images returned from Automatic1111")

            image_base64 = result["images"][0]
            logger.info("World image generated successfully via Automatic1111")
            return image_base64


async def generate_world_via_replicate(
    prompt: str,
    negative_prompt: str,
    width: int = 1024,
    height: int = 768,
) -> str:
    """
    Generate world scene image via Replicate API.

    TODO: In production, use a landscape/environment-focused model like:
    - stability-ai/sdxl for general scenes
    - Or a fine-tuned landscape model

    Args:
        prompt: Positive prompt for world scene
        negative_prompt: Negative prompt
        width: Image width
        height: Image height

    Returns:
        Base64 encoded image string
    """
    if not REPLICATE_AVAILABLE:
        raise ImportError("replicate package not installed. Run: pip install replicate")

    if not settings.REPLICATE_API_TOKEN:
        raise ValueError("REPLICATE_API_TOKEN not set")

    os.environ["REPLICATE_API_TOKEN"] = settings.REPLICATE_API_TOKEN

    logger.info(f"Generating world image ({width}x{height}) via Replicate...")

    # TODO: Switch to a landscape/environment-specific model in production
    # Current: using SDXL as placeholder
    output = await asyncio.to_thread(
        replicate.run,
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input={
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": width,
            "height": height,
            "num_inference_steps": 40,
            "guidance_scale": 7.5,
            "scheduler": "DPMSolverMultistep",
        },
    )

    # Extract URL from replicate output
    def extract_url(output) -> str:
        if isinstance(output, list):
            if len(output) > 0:
                return str(output[0])
            raise ValueError("Empty list returned from Replicate")
        try:
            first_item = next(iter(output))
            return str(first_item)
        except (TypeError, StopIteration):
            return str(output)

    image_url = extract_url(output)

    # Download and convert to base64
    async with aiohttp.ClientSession() as session:
        async with session.get(image_url) as response:
            if response.status != 200:
                raise Exception(f"Failed to download image: HTTP {response.status}")

            image_bytes = await response.read()
            image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    logger.info("World image generated successfully via Replicate")
    return image_base64
