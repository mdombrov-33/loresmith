import os
import asyncio
import aiohttp

from utils.logger import logger
from config.settings import get_settings
from .processor import (
    save_base64_image,
    download_and_save_image,
    build_image_urls,
)

settings = get_settings()

try:
    import replicate

    REPLICATE_AVAILABLE = True
except ImportError:
    REPLICATE_AVAILABLE = False


async def generate_via_replicate(
    prompt: str,
    negative_prompt: str,
    world_id: int,
    character_id: str,
) -> dict[str, str | None]:
    """Generate portrait image via Replicate."""

    if not REPLICATE_AVAILABLE:
        logger.error("replicate package not installed. Run: pip install replicate")
        return {"image_portrait": None}

    if not settings.REPLICATE_API_TOKEN:
        logger.warning("REPLICATE_API_TOKEN not set, skipping image generation")
        return {"image_portrait": None}

    try:
        os.environ["REPLICATE_API_TOKEN"] = settings.REPLICATE_API_TOKEN

        # Generate portrait image (768x768)
        logger.info("Generating portrait image (768x768) via Replicate...")
        portrait_output = await asyncio.to_thread(
            replicate.run,
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            input={
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "width": 768,
                "height": 768,
                "num_inference_steps": 40,
                "guidance_scale": 7.5,
                "scheduler": "DPMSolverMultistep",
                "refine": "expert_ensemble_refiner",
                "high_noise_frac": 0.8,
            },
        )

        # Extract URL and download
        def extract_url(output) -> str:
            """Extract string URL from replicate output."""
            if isinstance(output, list):
                if len(output) > 0:
                    return str(output[0])
                raise ValueError("Empty list returned from Replicate")
            try:
                first_item = next(iter(output))
                return str(first_item)
            except (TypeError, StopIteration):
                return str(output)

        portrait_url = extract_url(portrait_output)
        await download_and_save_image(
            portrait_url, world_id, character_id, "portrait"
        )

        logger.info("Successfully generated portrait via Replicate")
        return build_image_urls(world_id, character_id)

    except Exception as e:
        logger.error(f"Replicate API error: {e}", exc_info=True)
        return {"image_portrait": None}


async def generate_via_automatic1111(
    prompt: str,
    negative_prompt: str,
    world_id: int,
    character_id: str,
) -> dict[str, str | None]:
    """
    Generate portrait image via Automatic1111.

    Optimized for SD XL Turbo with proper settings.
    """
    if not settings.AUTOMATIC1111_URL:
        logger.error("AUTOMATIC1111_URL not set in settings")
        return {"image_portrait": None}

    try:
        api_url = settings.AUTOMATIC1111_URL.rstrip("/")

        # Generate portrait image (768x768)
        # SD XL Turbo optimized settings
        logger.info("Generating portrait image via Automatic1111 (768x768)...")
        portrait_payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": 768,
            "height": 768,
            # SD XL Turbo optimal settings
            "steps": 8,  # Turbo works best with 4-8 steps
            "cfg_scale": 2.0,  # Lower CFG for Turbo (1.5-2.5 range)
            "sampler_name": "DPM++ SDE",  # Best sampler for Turbo
            "seed": -1,  # Random seed
            "enable_hr": False,  # Disable hires fix for speed
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{api_url}/sdapi/v1/txt2img",
                json=portrait_payload,
                timeout=aiohttp.ClientTimeout(total=120),  # 2 min
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(
                        f"Automatic1111 API error: {response.status} - {error_text}"
                    )

                result = await response.json()
                portrait_base64 = result["images"][0]

        # Save portrait image
        await save_base64_image(portrait_base64, world_id, character_id, "portrait")

        logger.info("Successfully generated portrait locally")
        return build_image_urls(world_id, character_id)

    except aiohttp.ClientConnectorError:
        logger.error(
            f"Could not connect to Automatic1111 at {settings.AUTOMATIC1111_URL}. "
            "Is it running with --api flag?"
        )
        return {"image_portrait": None}
    except Exception as e:
        logger.error(f"Local image generation error: {e}", exc_info=True)
        return {"image_portrait": None}
