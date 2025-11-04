import os
import asyncio
from pathlib import Path
from typing import Optional, Dict
import aiohttp

try:
    import replicate

    REPLICATE_AVAILABLE = True
except ImportError:
    REPLICATE_AVAILABLE = False

from utils.logger import logger
from config.settings import get_settings

settings = get_settings()


async def generate_character_images(
    name: str,
    appearance: str,
    theme: str,
    world_id: int,
    character_id: str,
) -> Dict[str, Optional[str]]:
    """
    Generate card and portrait images for a character.

    Args:
        name: Character name
        appearance: Physical appearance description
        theme: World theme (steampunk, cyberpunk, etc.)
        world_id: ID of the world this character belongs to
        character_id: Unique identifier for the character

    Returns:
        Dict with image_card and image_portrait URLs (or None if disabled)
    """
    if not settings.ENABLE_IMAGE_GENERATION:
        logger.info("Image generation disabled, skipping")
        return {"image_card": None, "image_portrait": None}

    try:
        logger.info(f"Generating images for {name} using {settings.IMAGE_PROVIDER}")

        # Build optimized prompt
        prompt, negative_prompt = build_character_prompt(name, appearance, theme)

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
            return {"image_card": None, "image_portrait": None}

    except Exception as e:
        logger.error(f"Failed to generate character images: {e}", exc_info=True)
        # Don't fail character generation if images fail
        return {"image_card": None, "image_portrait": None}


def build_character_prompt(name: str, appearance: str, theme: str) -> tuple[str, str]:
    """
    Build optimized prompts for character portrait generation.

    Returns:
        Tuple of (positive_prompt, negative_prompt)
    """
    # Theme-specific style guidance - DRAMATICALLY IMPROVED
    theme_styles = {
        "post-apocalyptic": """
            post-apocalyptic wasteland survivor, harsh dramatic lighting, dusty atmosphere,
            worn leather and scavenged metal armor, weathered tactical gear, battle scars,
            makeshift weapons, desaturated earthy tones with rust and ochre accents,
            gritty photorealistic style inspired by The Last of Us and Mad Max,
            desolate wasteland background with ruins, sand storms, decaying infrastructure,
            cinematic composition, moody atmosphere, survival gear details, tactical vest,
            gas mask hanging on belt, wrapped bandages, dirt and grime texture,
            volumetric dust particles, golden hour lighting through haze
        """,
        "steampunk": """
            Victorian steampunk engineer, intricate brass goggles with leather straps,
            ornate clockwork mechanisms visible, steam-powered gadgets and gears,
            rich brown leather coat with copper rivets and buckles, Victorian waistcoat,
            mechanical arm enhancements, pressure gauges and pipes,
            sepia and bronze color palette with brass highlights,
            industrial revolution aesthetic, gear-work background with steam pipes,
            oil lamps, cogwheel motifs, detailed metalwork, polished brass surfaces,
            warm ambient lighting from gas lamps, dramatic rim lighting,
            inspired by Bioshock Infinite and Dishonored, painterly digital art style,
            intricate Victorian era clothing details, leather straps and buckles
        """,
        "norse-mythology": """
            Norse Viking warrior, traditional Nordic aesthetic, intricate knotwork patterns,
            braided hair with bone beads and metal rings, thick fur-lined cloak over shoulders,
            detailed leather armor with embossed runic symbols, chainmail visible underneath,
            weathered iron weapons with elder futhark runes, war paint and tribal markings,
            cold misty atmosphere, northern lights in background, snowy pine forests,
            realistic historical accuracy mixed with mythological grandeur,
            muted blues, grays, and earth tones with silver and ice-blue accents,
            dramatic side lighting, volumetric fog, inspired by God of War and Vikings series,
            authentic Viking age clothing and armor details, hand-forged metal textures,
            rough-hewn wood and carved runes, ceremonial jewelry
        """,
        "cyberpunk": """
            cyberpunk street mercenary, neon-lit futuristic aesthetic, cybernetic enhancements,
            glowing circuit patterns under synthetic skin, holographic HUD elements,
            sleek tactical techwear, carbon fiber armor plates, LED strips integrated into clothing,
            reflective surfaces, lens flares from neon signs, rain-slicked streets reflecting lights,
            vibrant neon colors - hot pink, electric blue, acid green against dark urban noir,
            dystopian megacity background, towering skyscrapers with digital billboards,
            inspired by Blade Runner, Ghost in the Shell, Cyberpunk 2077, and Akira,
            cinematic composition, dramatic contrast, volumetric lighting through fog,
            advanced prosthetic limbs with exposed mechanical parts, neural implants,
            futuristic weapons with glowing energy cores, augmented reality overlays
        """,
        "fantasy": """
            high fantasy RPG character, epic heroic composition, magical atmosphere,
            ornate medieval armor with intricate engravings and gemstone inlays,
            flowing cape or cloak with detailed fabric textures, leather straps and buckles,
            enchanted weapons glowing with arcane energy, mystical runes and symbols,
            rich saturated colors - deep purples, royal blues, emerald greens, gold accents,
            dramatic fantasy lighting with god rays and magical particle effects,
            medieval castle or enchanted forest background, ancient ruins,
            inspired by D&D, World of Warcraft, and Lord of the Rings aesthetic,
            painterly digital art style like Magic: The Gathering card art,
            detailed costume design, leather and metal armor pieces, fur trim,
            belt pouches and adventuring gear, fantasy races aesthetic if applicable,
            ethereal magical glow, dramatic pose suggesting heroism and adventure
        """,
    }

    style = theme_styles.get(
        theme, "detailed character portrait, professional digital art"
    )

    # Build main prompt combining appearance + style - MUCH MORE DETAILED
    positive_prompt = f"""
    Masterpiece quality character portrait, {appearance},
    {style},
    professional concept art, highly detailed, intricate details, sharp focus,
    8k resolution, artstation trending, award-winning composition,
    cinematic dramatic lighting, volumetric lighting, rim lighting,
    rich color grading, photorealistic rendering with painterly touches,
    character design sheet aesthetic, hero shot composition,
    detailed facial features, expressive eyes, realistic skin texture,
    professional character artist quality, AAA game art style,
    centered composition with dynamic pose, 3/4 view portrait,
    detailed costume and clothing textures, fabric folds and wrinkles,
    atmospheric depth, bokeh background, environmental storytelling
    """.strip()

    # Negative prompt - EXPANDED to avoid more issues
    negative_prompt = """
    blurry, low quality, low resolution, jpeg artifacts, compression artifacts,
    watermark, text, logo, signature, username, artist name, copyright,
    distorted anatomy, bad anatomy, extra limbs, missing limbs, floating limbs,
    bad hands, mutated hands, poorly drawn hands, fused fingers, extra fingers,
    bad face, poorly drawn face, mutation, deformed, disfigured,
    ugly, gross proportions, bad proportions, malformed,
    cropped, cut off, out of frame, worst quality,
    duplicate, cloned face, multiple people, two characters,
    photographic, amateur photo, selfie, low-effort,
    3d render, CGI, video game screenshot, anime, cartoon,
    overexposed, underexposed, oversaturated, desaturated,
    modern clothing in fantasy setting, anachronistic elements
    """.strip()

    return positive_prompt, negative_prompt


async def generate_via_replicate(
    prompt: str,
    negative_prompt: str,
    world_id: int,
    character_id: str,
) -> Dict[str, Optional[str]]:
    """Generate images using Replicate API (SDXL)"""

    if not REPLICATE_AVAILABLE:
        logger.error("replicate package not installed. Run: pip install replicate")
        return {"image_card": None, "image_portrait": None}

    if not settings.REPLICATE_API_TOKEN:
        logger.warning("REPLICATE_API_TOKEN not set, skipping image generation")
        return {"image_card": None, "image_portrait": None}

    try:
        os.environ["REPLICATE_API_TOKEN"] = settings.REPLICATE_API_TOKEN

        logger.info("Generating card image (768x768)...")
        card_output = await asyncio.to_thread(
            replicate.run,
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            input={
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "width": 768,
                "height": 768,
                "num_inference_steps": 40,  # Increased for better quality
                "guidance_scale": 7.5,
                "scheduler": "DPMSolverMultistep",
                "refine": "expert_ensemble_refiner",  # Better quality
                "high_noise_frac": 0.8,
            },
        )

        # Generate portrait (256x256 - Pathfinder-style for adventure mode)
        portrait_prompt = (
            prompt
            + ", close-up portrait, headshot, face focus, circular frame composition, profile picture style"
        )
        logger.info("Generating portrait image (256x256)...")
        portrait_output = await asyncio.to_thread(
            replicate.run,
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            input={
                "prompt": portrait_prompt,
                "negative_prompt": negative_prompt,
                "width": 256,
                "height": 256,
                "num_inference_steps": 35,
                "guidance_scale": 7.5,
                "scheduler": "DPMSolverMultistep",
                "refine": "expert_ensemble_refiner",
                "high_noise_frac": 0.8,
            },
        )

        # Download and save images - Extract URL strings with proper type handling
        def extract_url(output) -> str:
            """Extract string URL from replicate output (list, iterator, or direct string)"""
            # Handle list
            if isinstance(output, list):
                if len(output) > 0:
                    return str(output[0])
                raise ValueError("Empty list returned from Replicate")

            # Handle iterator
            try:
                # Try to get first item from iterator
                first_item = next(iter(output))
                return str(first_item)
            except (TypeError, StopIteration):
                # Not an iterator or empty, try direct conversion
                return str(output)

        card_url = extract_url(card_output)
        portrait_url = extract_url(portrait_output)

        card_path = await download_and_save_image(
            card_url, world_id, character_id, "card"
        )
        portrait_path = await download_and_save_image(
            portrait_url, world_id, character_id, "portrait"
        )

        logger.info(f"Successfully generated images: {card_path}, {portrait_path}")

        return {
            "image_card": f"/generated/{world_id}/{character_id}_card.png",
            "image_portrait": f"/generated/{world_id}/{character_id}_portrait.png",
        }

    except Exception as e:
        logger.error(f"Replicate API error: {e}", exc_info=True)
        return {"image_card": None, "image_portrait": None}


async def generate_via_automatic1111(
    prompt: str,
    negative_prompt: str,
    world_id: int,
    character_id: str,
) -> Dict[str, Optional[str]]:
    """
    Generate images using local Automatic1111 WebUI.

    Requires Automatic1111 running with --api flag.
    Install: https://github.com/AUTOMATIC1111/stable-diffusion-webui
    """
    if not settings.AUTOMATIC1111_URL:
        logger.error("AUTOMATIC1111_URL not set in settings")
        return {"image_card": None, "image_portrait": None}

    try:
        api_url = settings.AUTOMATIC1111_URL.rstrip("/")

        # Generate main card image (768x768)
        logger.info("Generating card image via Automatic1111 (768x768)...")
        card_payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": 768,
            "height": 768,
            "steps": 20,  # Fewer steps for speed (SDXL-Turbo works with 4-8)
            "cfg_scale": 7.5,
            "sampler_name": "DPM++ 2M Karras",
            "seed": -1,  # Random seed
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{api_url}/sdapi/v1/txt2img",
                json=card_payload,
                timeout=aiohttp.ClientTimeout(total=300)  # 5 min timeout
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"Automatic1111 API error (card): {response.status} - {error_text}")

                result = await response.json()
                card_base64 = result["images"][0]

        # Generate portrait (256x256)
        logger.info("Generating portrait image via Automatic1111 (256x256)...")
        portrait_prompt = (
            prompt
            + ", close-up portrait, headshot, face focus, circular frame composition, profile picture style"
        )
        portrait_payload = {
            "prompt": portrait_prompt,
            "negative_prompt": negative_prompt,
            "width": 256,
            "height": 256,
            "steps": 15,  # Even fewer for small portrait
            "cfg_scale": 7.5,
            "sampler_name": "DPM++ 2M Karras",
            "seed": -1,
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{api_url}/sdapi/v1/txt2img",
                json=portrait_payload,
                timeout=aiohttp.ClientTimeout(total=300)
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"Automatic1111 API error (portrait): {response.status} - {error_text}")

                result = await response.json()
                portrait_base64 = result["images"][0]

        # Save base64 images to files
        import base64

        card_path = await save_base64_image(
            card_base64, world_id, character_id, "card"
        )
        portrait_path = await save_base64_image(
            portrait_base64, world_id, character_id, "portrait"
        )

        logger.info(f"Successfully generated images locally: {card_path}, {portrait_path}")

        return {
            "image_card": f"/generated/{world_id}/{character_id}_card.png",
            "image_portrait": f"/generated/{world_id}/{character_id}_portrait.png",
        }

    except aiohttp.ClientConnectorError as e:
        logger.error(f"Could not connect to Automatic1111 at {settings.AUTOMATIC1111_URL}. Is it running with --api flag?")
        return {"image_card": None, "image_portrait": None}
    except Exception as e:
        logger.error(f"Local image generation error: {e}", exc_info=True)
        return {"image_card": None, "image_portrait": None}


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
    import base64

    # Use mounted volume path (mounted in docker-compose.yml)
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
    Download image from URL and save to frontend public directory.

    Args:
        url: Image URL from Replicate
        world_id: World ID for organizing files
        character_id: Character ID for file naming
        image_type: "card" or "portrait"

    Returns:
        Local file path where image was saved
    """
    # Use mounted volume path (mounted in docker-compose.yml)
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
