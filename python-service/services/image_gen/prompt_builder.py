import random
import re
from utils.logger import logger


def _extract_gender(appearance: str) -> str:
    """
    Extract gender from appearance description.
    Returns 'male', 'female', or 'neutral' based on keywords.
    """
    appearance_lower = appearance.lower()

    # Check for explicit gender keywords
    male_keywords = ["man", "boy", "male", " he ", " his ", "himself"]
    female_keywords = ["woman", "girl", "female", " she ", " her ", "herself"]

    male_count = sum(1 for keyword in male_keywords if keyword in appearance_lower)
    female_count = sum(1 for keyword in female_keywords if keyword in appearance_lower)

    if male_count > female_count:
        gender = "male"
    elif female_count > male_count:
        gender = "female"
    else:
        gender = "neutral"

    logger.info(f"Detected gender: {gender} (male_keywords={male_count}, female_keywords={female_count})")
    return gender


def build_character_prompt(
    name: str,
    appearance: str,
    theme: str,
    traits: list[str] | None = None,
) -> tuple[str, str]:
    """
    Build optimized prompts for character portrait generation.

    Args:
        name: Character name
        appearance: Physical appearance description
        theme: World theme
        traits: List of personality traits

    Returns:
        Tuple of (positive_prompt, negative_prompt)
    """

    # Extract gender from appearance
    gender = _extract_gender(appearance)

    # Gender tags for character models (critical for correct gender generation)
    if gender == "male":
        gender_tags = "1boy, male focus, man, masculine features"
    elif gender == "female":
        gender_tags = "1girl, female focus, woman, feminine features"
    else:
        gender_tags = "1person, androgynous"

    # Portrait-focused composition for character headshots
    portrait_types = [
        "close-up portrait",
        "headshot portrait",
        "bust portrait",
        "upper body portrait",
        "character portrait",
        "facial portrait",
    ]

    expressions = [
        "determined expression",
        "fierce gaze",
        "confident look",
        "intense eyes",
        "focused demeanor",
        "mysterious expression",
        "wise expression",
        "stoic expression",
        "stern look",
        "contemplative gaze",
        "knowing smile",
        "weathered expression",
    ]

    angles = [
        "3/4 view",
        "slight side angle",
        "front facing",
        "turned slightly to side",
        "looking over shoulder",
        "profile view",
    ]

    # Randomize for variety
    portrait_type = random.choice(portrait_types)
    expression = random.choice(expressions)
    angle = random.choice(angles)

    # Build personality visual cues from traits (portrait-focused)
    trait_details = ""
    if traits and len(traits) > 0:
        trait_visuals = []
        for trait in traits[:2]:  # Use top 2 traits
            trait_lower = trait.lower()
            if "brave" in trait_lower or "courageous" in trait_lower:
                trait_visuals.append("confident bearing")
            elif "wise" in trait_lower or "intelligent" in trait_lower:
                trait_visuals.append("thoughtful gaze")
            elif "aggressive" in trait_lower or "fierce" in trait_lower:
                trait_visuals.append("intense expression")
            elif "kind" in trait_lower or "compassionate" in trait_lower:
                trait_visuals.append("warm eyes")
            elif "cunning" in trait_lower or "clever" in trait_lower:
                trait_visuals.append("shrewd look")
            elif "loyal" in trait_lower:
                trait_visuals.append("steady gaze")

        if trait_visuals:
            trait_details = ", " + ", ".join(trait_visuals)

    # Theme-specific style guidance - Portrait focused with simple backgrounds
    theme_styles = {
        "post-apocalyptic": """
            post-apocalyptic survivor aesthetic, weathered rugged look, battle-hardened features,
            worn tactical clothing visible at shoulders/collar, muted earthy color palette,
            dust and grime weathering on skin, survival gear aesthetic,
            dramatic side lighting, gritty realistic style,
            simple dark background - charcoal gray or dusty brown gradient,
            inspired by The Last of Us and Mad Max character portraits
        """,
        "steampunk": """
            Victorian steampunk aesthetic, brass and leather accents visible on collar,
            goggles resting on head or around neck, rich warm color palette,
            sepia and bronze tones, intricate Victorian-era clothing details,
            warm golden lighting, painterly style,
            simple background - warm brown or sepia gradient,
            inspired by Dishonored and Bioshock character portraits
        """,
        "norse-mythology": """
            Norse Viking aesthetic, braided hair with beads, fur-lined collar visible,
            traditional Nordic war paint or tribal markings on face,
            cold muted color palette - grays, blues, earth tones,
            weathered battle-worn features, dramatic side lighting,
            simple background - dark gray or cold blue gradient,
            inspired by God of War and Vikings series character portraits
        """,
        "cyberpunk": """
            cyberpunk futuristic aesthetic, cybernetic implants visible on face/neck,
            sleek tech-wear collar, neon accent lighting on face,
            vibrant neon colors - hot pink, electric blue, purple rim lighting,
            dark noir atmosphere, dramatic contrast lighting,
            simple background - solid black or dark blue gradient,
            inspired by Blade Runner and Cyberpunk 2077 character portraits
        """,
        "fantasy": """
            high fantasy RPG aesthetic, ornate armor or robes visible at shoulders,
            medieval fantasy clothing details, rich saturated colors,
            deep purples, royal blues, emerald greens, warm golden lighting,
            painterly digital art style like Magic: The Gathering portraits,
            simple background - dark solid color or subtle gradient,
            inspired by D&D and Baldur's Gate character portraits
        """,
    }

    style = theme_styles.get(
        theme, "detailed character portrait, professional digital art"
    )

    # Build main prompt - Portrait-focused, optimized for character models
    positive_prompt = f"""
    masterpiece, best quality, highly detailed portrait,
    {gender_tags},
    {portrait_type}, {angle}, {expression}{trait_details},
    {appearance},
    {style},
    professional character art, intricate facial details, sharp focus,
    detailed eyes, expressive face, realistic skin texture with pores and details,
    detailed hair strands, fabric texture on clothing,
    dramatic lighting on face, soft rim lighting, depth of field,
    semi-realistic style, painterly illustration, digital painting,
    character portrait composition, Pathfinder RPG style, Baldur's Gate character art,
    distinctive facial features, unique character design,
    simple clean background, gradient or solid color background,
    portrait photography composition, high-quality character illustration
    """.strip()

    # Negative prompt optimized for character portrait models
    negative_prompt = """
    worst quality, low quality, low resolution, blurry, fuzzy, out of focus,
    jpeg artifacts, compression artifacts, pixelated, grainy,
    watermark, text, logo, signature, username, artist name, copyright, banner,

    deformed, disfigured, malformed, mutated, mutation,
    bad anatomy, wrong anatomy, extra limbs, missing limbs, floating limbs,
    extra fingers, extra digit, fewer digits, fused fingers, missing fingers,
    bad hands, mutated hands, poorly drawn hands, malformed hands,
    extra heads, two heads, multiple heads, double head,
    bad face, poorly drawn face, ugly face, disfigured face, deformed face,
    extra eyes, missing eyes, cross-eyed, asymmetric eyes, uneven eyes,
    extra ears, missing ears, deformed ears,
    bad neck, long neck, thick neck, missing neck,
    bad proportions, gross proportions, incorrect proportions,

    cropped face, cut off head, out of frame face,
    duplicate, multiple people, two characters, crowd, group,

    amateur, low-effort, poorly drawn,
    overexposed, underexposed, flat lighting,

    3d render, low-poly, video game screenshot,
    chibi, child-like proportions, infantile,

    overly anime, extreme anime style, manga style, cartoon,
    huge eyes, anime eyes, oversized eyes, sparkly eyes,
    tiny nose, button nose, minimal nose,
    unrealistic proportions, stylized proportions,
    cel shading, flat colors, lineart,

    busy background, cluttered background, detailed background, complex background,
    landscape, scenery, buildings, environment,
    full body, cowboy shot, wide shot,
    weapons, holding object, props in hands,

    modern clothing in fantasy setting, anachronistic elements
    """.strip()

    return positive_prompt, negative_prompt
