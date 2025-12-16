import random
from utils.logger import logger
from services.llm_client import get_llm


async def extract_visual_elements(full_story: str, theme: str) -> str:
    """
    Use LLM to extract key visual elements from the full story.

    Returns a concise description of visual elements for image generation.
    """
    extraction_prompt = f"""
You are analyzing a story to extract visual environmental details for image generation.

Story:
{full_story[:1000]}

Extract the key ENVIRONMENTAL visual elements (NO characters/people) in a concise comma-separated format:
- Environment type (ruins, city, forest, mountains, etc.)
- Architectural style and materials
- Atmosphere and lighting (foggy, bright, dark, etc.)
- Weather conditions
- Time of day
- Colors and mood
- Scale and landmarks
- Any unique environmental features

Theme: {theme}

Provide ONLY a single paragraph of comma-separated visual descriptors for environment art, NO explanations.
Example: "ancient stone ruins with overgrown vines, misty atmosphere, golden sunset lighting, crumbling towers in background, mystical blue glow from crystals, weathered cobblestone paths"
"""

    try:
        llm = get_llm(max_tokens=300, temperature=0.3)
        response = await llm.ainvoke(extraction_prompt)
        visual_description = str(response.content).strip()
        logger.info(f"Extracted visual elements: {visual_description[:100]}...")
        return visual_description
    except Exception as e:
        logger.error(f"Failed to extract visual elements via LLM: {e}")
        return "detailed environment"


async def build_world_scene_prompt(
    world_title: str,
    full_story: str,
    theme: str,
    setting_description: str = "",
) -> tuple[str, str]:
    """
    Build optimized prompts for world scene/environment generation.

    Args:
        world_title: Title of the world
        full_story: Full narrative description of the world
        theme: World theme (fantasy, cyberpunk, etc.)
        setting_description: Optional specific setting description

    Returns:
        Tuple of (positive_prompt, negative_prompt)
    """

    compositions = [
        "wide establishing shot",
        "cinematic landscape view",
        "atmospheric environment shot",
        "epic vista",
        "dramatic wide angle scene",
        "panoramic view",
        "environmental establishing shot",
    ]

    lighting_options = [
        "dramatic volumetric lighting",
        "atmospheric fog and mist",
        "golden hour lighting",
        "moody overcast atmosphere",
        "dramatic sunset lighting",
        "atmospheric haze",
        "cinematic lighting",
        "environmental lighting",
    ]

    art_styles = [
        "concept art style",
        "matte painting style",
        "detailed environment art",
        "cinematic game environment",
        "fantasy landscape art",
        "digital landscape painting",
    ]

    composition = random.choice(compositions)
    lighting = random.choice(lighting_options)
    art_style = random.choice(art_styles)

    logger.info(f"Building world scene prompt for '{world_title}' (theme: {theme})")

    visual_cues = await extract_visual_elements(full_story, theme)

    theme_styles = {
        "post-apocalyptic": """
            post-apocalyptic environment, devastated ruins, abandoned structures,
            weathered decay, rust and corrosion, overgrown vegetation reclaiming buildings,
            dramatic dusty atmosphere, muted color palette, gritty realistic style,
            inspired by The Last of Us and Mad Max environments
        """,
        "steampunk": """
            Victorian steampunk cityscape, brass and copper architecture,
            industrial smokestacks, airships in background, clockwork mechanisms visible,
            warm sepia tones, rich browns and brass colors, atmospheric steam,
            inspired by Dishonored and Bioshock environments
        """,
        "norse-mythology": """
            Norse mythological landscape, Viking longhouses and settlements,
            rugged fjords and mountains, ancient rune stones, mystical fog,
            cold color palette, dramatic Nordic lighting, weathered stone and wood,
            inspired by God of War and Vikings series environments
        """,
        "cyberpunk": """
            cyberpunk cityscape, neon-lit buildings, towering megastructures,
            holographic advertisements, rain-slicked streets, dark noir atmosphere,
            vibrant neon colors against dark backgrounds, futuristic architecture,
            inspired by Blade Runner and Cyberpunk 2077 environments
        """,
        "fantasy": """
            high fantasy environment, medieval castles and kingdoms,
            magical elements visible, mystical atmosphere, ancient architecture,
            rich saturated colors, enchanted forests or mystical ruins,
            inspired by Lord of the Rings and Elder Scrolls environments
        """,
    }

    style = theme_styles.get(
        theme, "detailed environment art, professional digital painting"
    )

    positive_prompt = f"""
    masterpiece, best quality, highly detailed environment art,
    {composition}, environment from "{world_title}",
    {visual_cues},
    {setting_description if setting_description else ""},
    {style},
    {art_style}, {lighting},
    professional environment concept art, intricate environmental details,
    atmospheric depth, epic scale, immersive environment,
    detailed architecture, rich environmental storytelling,
    cinematic composition, dramatic perspective,
    photorealistic environmental details, high-quality digital painting,
    no people, no characters, pure environment focus
    """.strip()

    negative_prompt = """
    worst quality, low quality, low resolution, blurry, fuzzy, out of focus,
    jpeg artifacts, compression artifacts, pixelated, grainy,
    watermark, text, logo, signature, username, artist name, copyright,

    people, humans, characters, portraits, faces, figures, person,
    crowds, groups, character focus, any living beings,

    deformed architecture, bad perspective, incorrect proportions,
    floating objects, impossible geometry, structural errors,

    amateur, low-effort, poorly drawn, flat colors,
    overexposed, underexposed, flat lighting,

    3d render, low-poly, video game screenshot, UI elements,
    chibi, cartoon style, anime style,

    modern elements in fantasy setting, anachronistic, out of place objects,

    busy composition, cluttered, chaotic, no focal point,
    boring, generic, uninspired, dull,

    close-up, macro, detail shot, no sense of scale or environment
    """.strip()

    logger.info(
        f"Generated prompt with composition: {composition}, lighting: {lighting}, visual cues: {visual_cues}"
    )

    return positive_prompt, negative_prompt
