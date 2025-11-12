"""
Prompt building utilities for character image generation.

Optimized for SD XL Turbo with enhanced negative prompts.
"""

import random


def build_character_prompt(
    name: str,
    appearance: str,
    theme: str,
    traits: list[str] | None = None,
    skills: list[dict] | None = None,
) -> tuple[str, str]:
    """
    Build optimized prompts for character portrait generation.

    Args:
        name: Character name
        appearance: Physical appearance description
        theme: World theme
        traits: List of personality traits
        skills: List of skills with levels

    Returns:
        Tuple of (positive_prompt, negative_prompt)
    """

    # Add variety through randomization
    poses = [
        "heroic stance",
        "action pose",
        "confident posture",
        "dynamic pose",
        "battle-ready stance",
        "dramatic composition",
        "powerful pose",
        "commanding presence"
    ]

    expressions = [
        "determined expression",
        "fierce gaze",
        "confident look",
        "intense eyes",
        "focused demeanor",
        "mysterious aura",
        "wise countenance",
        "stoic face"
    ]

    angles = [
        "3/4 view",
        "side profile view",
        "front facing",
        "dramatic angle",
        "cinematic angle",
        "low angle hero shot",
        "slight upward angle"
    ]

    # Randomize for variety
    pose = random.choice(poses)
    expression = random.choice(expressions)
    angle = random.choice(angles)

    # Build character-specific details from skills
    skill_details = ""
    if skills and len(skills) > 0:
        # Get top 2 skills
        top_skills = sorted(skills, key=lambda x: x.get("level", 0), reverse=True)[:2]
        skill_actions = []

        for skill in top_skills:
            skill_name = skill.get("name", "").lower()
            # Map skills to visual elements
            if "sword" in skill_name or "combat" in skill_name or "melee" in skill_name:
                skill_actions.append("gripping ornate sword")
            elif "magic" in skill_name or "arcane" in skill_name or "spell" in skill_name:
                skill_actions.append("magical energy swirling around hands")
            elif "archery" in skill_name or "bow" in skill_name:
                skill_actions.append("bow slung over shoulder")
            elif "stealth" in skill_name or "sneak" in skill_name:
                skill_actions.append("shadowy cloak wrapped around body")
            elif "healing" in skill_name or "medicine" in skill_name:
                skill_actions.append("holding mystical healing vial")
            elif "craft" in skill_name or "smith" in skill_name:
                skill_actions.append("wearing craftsman's tools")

        if skill_actions:
            skill_details = ", " + ", ".join(skill_actions)

    # Build personality visual cues from traits
    trait_details = ""
    if traits and len(traits) > 0:
        trait_visuals = []
        for trait in traits[:2]:  # Use top 2 traits
            trait_lower = trait.lower()
            if "brave" in trait_lower or "courageous" in trait_lower:
                trait_visuals.append("fearless posture")
            elif "wise" in trait_lower or "intelligent" in trait_lower:
                trait_visuals.append("thoughtful gaze")
            elif "aggressive" in trait_lower or "fierce" in trait_lower:
                trait_visuals.append("battle-hardened look")
            elif "kind" in trait_lower or "compassionate" in trait_lower:
                trait_visuals.append("gentle demeanor")
            elif "cunning" in trait_lower or "clever" in trait_lower:
                trait_visuals.append("sly expression")
            elif "loyal" in trait_lower:
                trait_visuals.append("noble bearing")

        if trait_visuals:
            trait_details = ", " + ", ".join(trait_visuals)

    # Theme-specific style guidance
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

    # Build main prompt - optimized for quality with variety
    positive_prompt = f"""
    masterpiece, best quality, {appearance}{skill_details}{trait_details},
    {style},
    {pose}, {expression}, {angle},
    professional concept art, highly detailed, intricate details, sharp focus,
    8k resolution, award-winning composition,
    cinematic dramatic lighting, volumetric lighting, rim lighting,
    rich color grading, photorealistic rendering,
    character design sheet aesthetic, hero shot composition,
    detailed facial features, expressive eyes, realistic skin texture,
    professional character artist quality, AAA game art style,
    detailed costume and clothing textures, fabric folds,
    atmospheric depth, environmental storytelling,
    unique character design, distinctive features
    """.strip()

    # ENHANCED negative prompt specifically for SD XL Turbo to fix deformities
    negative_prompt = """
    worst quality, low quality, low resolution, blurry, fuzzy, out of focus,
    jpeg artifacts, compression artifacts, pixelated, grainy,
    watermark, text, logo, signature, username, artist name, copyright, banner,

    deformed, disfigured, malformed, mutated, mutation,
    bad anatomy, wrong anatomy, extra limbs, missing limbs, floating limbs, disconnected limbs,
    extra arms, missing arms, extra legs, missing legs,
    extra fingers, extra digit, fewer digits, fused fingers, missing fingers,
    bad hands, mutated hands, poorly drawn hands, malformed hands,
    extra heads, two heads, multiple heads, double head, duplicate head,
    bad face, poorly drawn face, ugly face, disfigured face, deformed face,
    extra eyes, missing eyes, cross-eyed, asymmetric eyes,
    extra ears, missing ears, deformed ears,
    bad neck, long neck, thick neck, missing neck,
    bad proportions, gross proportions, incorrect proportions, unnatural proportions,
    asymmetric, asymmetry, disproportionate body parts,

    cropped, cut off, out of frame, partially out of frame,
    duplicate, cloned, cloning, multiple people, two characters, crowd,

    photographic, amateur photo, selfie, low-effort, casual photo,
    overexposed, underexposed, over-saturated, under-saturated, flat lighting,

    3d render, CGI, video game screenshot, console graphics,
    anime, manga, cartoon, illustration, comic, drawing,
    chibi, child-like proportions, infantile,

    modern clothing in fantasy setting, anachronistic elements, wrong era clothing
    """.strip()

    return positive_prompt, negative_prompt
