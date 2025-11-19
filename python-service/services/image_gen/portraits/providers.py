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


async def generate_via_replicate(
    prompt: str,
    negative_prompt: str,
    character_id: str,
) -> dict[str, str | None]:
    """
    Generate portrait image via Replicate and return as base64.

    Returns base64 instead of uploading to R2.
    """

    if not REPLICATE_AVAILABLE:
        logger.error("replicate package not installed. Run: pip install replicate")
        return {"image_portrait_base64": None}

    if not settings.REPLICATE_API_TOKEN:
        logger.warning("REPLICATE_API_TOKEN not set, skipping image generation")
        return {"image_portrait_base64": None}

    try:
        os.environ["REPLICATE_API_TOKEN"] = settings.REPLICATE_API_TOKEN

        logger.info("Generating portrait image (1024x1024) via Replicate...")
        portrait_output = await asyncio.to_thread(
            replicate.run,
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",  # change later
            input={
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "width": 1024,
                "height": 1024,
                "num_inference_steps": 40,
                "guidance_scale": 7.5,
                "scheduler": "DPMSolverMultistep",
                "refine": "expert_ensemble_refiner",
                "high_noise_frac": 0.8,
            },
        )

        # Extract URL
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

        # Download image and convert to base64
        async with aiohttp.ClientSession() as session:
            async with session.get(portrait_url) as response:
                if response.status != 200:
                    raise Exception(f"Failed to download image: HTTP {response.status}")

                image_bytes = await response.read()
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        logger.info("Successfully generated portrait via Replicate")
        return {"image_portrait_base64": image_base64}

    except Exception as e:
        logger.error(f"Replicate API error: {e}", exc_info=True)
        return {"image_portrait_base64": None}


async def generate_via_automatic1111(
    prompt: str,
    negative_prompt: str,
    character_id: str,
) -> dict[str, str | None]:
    """
    Generate portrait image via Automatic1111 and return as base64.

    Returns base64 instead of uploading to R2.
    """
    if not settings.AUTOMATIC1111_URL:
        logger.error("AUTOMATIC1111_URL not set in settings")
        return {"image_portrait_base64": None}

    try:
        api_url = settings.AUTOMATIC1111_URL.rstrip("/")

        # Generate portrait image (1024x1024)
        # Optimized settings for character portrait models
        logger.info("Generating portrait image via Automatic1111 (1024x1024)...")
        portrait_payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": 1024,
            "height": 1024,
            "steps": 20,
            "cfg_scale": 7.0,
            "sampler_name": "DPM++ 2M Karras",
            "seed": -1,
            "enable_hr": False,
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

        logger.info("Successfully generated portrait locally")
        return {"image_portrait_base64": portrait_base64}

    except aiohttp.ClientConnectorError:
        logger.error(
            f"Could not connect to Automatic1111 at {settings.AUTOMATIC1111_URL}. "
            "Is it running with --api flag?"
        )
        return {"image_portrait_base64": None}
    except Exception as e:
        logger.error(f"Local image generation error: {e}", exc_info=True)
        return {"image_portrait_base64": None}
