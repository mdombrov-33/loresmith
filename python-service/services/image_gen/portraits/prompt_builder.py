import random
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

    logger.info(
        f"Detected gender: {gender} (male_keywords={male_count}, female_keywords={female_count})"
    )
    return gender


def build_character_prompt(
    name: str,
    appearance: str,
    theme: str,
    traits: list[str] | None = None,
    skills: list[str] | None = None,
) -> tuple[str, str]:
    """
    Build optimized prompts for character portrait generation.

    Args:
        name: Character name
        appearance: Physical appearance description
        theme: World theme
        traits: List of personality traits
        skills: List of skill names for visual elements

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
        "detailed character portrait",
        "hero portrait",
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
        "calm demeanor",
        "wary expression",
        "subtle smirk",
        "neutral expression",
        "calculating gaze",
    ]

    angles = [
        "3/4 view",
        "slight side angle",
        "front facing",
        "turned slightly to side",
        "looking over shoulder",
        "profile view",
        "dynamic angle",
        "cinematic angle",
    ]

    # Art style variations for diversity
    art_styles = [
        "detailed digital portrait art",
        "painterly character illustration",
        "concept art portrait style",
        "fantasy character art",
        "realistic character portrait",
        "illustrated RPG portrait",
        "cinematic character design",
    ]

    # Randomize for variety
    portrait_type = random.choice(portrait_types)
    expression = random.choice(expressions)
    angle = random.choice(angles)
    art_style = random.choice(art_styles)

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

    # Build skill-based visual elements with comprehensive keyword matching
    skill_details = ""
    if skills and len(skills) > 0:
        skill_visuals = []
        for skill in skills[:3]:  # Use top 3 skills
            skill_lower = skill.lower()

            # Melee Combat - Blades
            if any(
                word in skill_lower
                for word in [
                    "sword",
                    "blade",
                    "fencing",
                    "duel",
                    "katana",
                    "saber",
                    "rapier",
                ]
            ):
                skill_visuals.append("sword sheathed at hip or back")
            # Melee Combat - Axes
            elif any(
                word in skill_lower for word in ["axe", "hatchet", "cleaver", "chop"]
            ):
                skill_visuals.append("battle axe handle visible at belt")
            # Melee Combat - Spears/Polearms
            elif any(
                word in skill_lower
                for word in [
                    "spear",
                    "lance",
                    "pike",
                    "polearm",
                    "halberd",
                    "staff combat",
                ]
            ):
                skill_visuals.append("spear or staff visible over shoulder")
            # Melee Combat - Unarmed
            elif any(
                word in skill_lower
                for word in [
                    "brawl",
                    "martial",
                    "fist",
                    "hand-to-hand",
                    "boxing",
                    "wrestling",
                    "monk",
                    "unarmed",
                ]
            ):
                skill_visuals.append("wrapped knuckles, combat wraps on hands")
            # Ranged Combat - Bows
            elif any(
                word in skill_lower
                for word in ["archer", "bow", "arrow", "longbow", "crossbow"]
            ):
                skill_visuals.append("quiver strap visible over shoulder, bow visible")
            # Ranged Combat - Firearms
            elif any(
                word in skill_lower
                for word in [
                    "gun",
                    "rifle",
                    "pistol",
                    "firearm",
                    "shoot",
                    "marksman",
                    "sniper",
                ]
            ):
                skill_visuals.append("holstered weapon at hip, ammunition belt")
            # Combat - Shields
            elif any(
                word in skill_lower for word in ["shield", "buckler", "defensive"]
            ):
                skill_visuals.append("shield strapped to back or arm")
            # Combat - Dual Weapons
            elif any(
                word in skill_lower
                for word in ["dual wield", "two weapon", "twin blade"]
            ):
                skill_visuals.append("twin weapons at hips")

            # Magic - Fire
            elif any(
                word in skill_lower
                for word in ["fire", "flame", "pyro", "inferno", "burn"]
            ):
                skill_visuals.append("red and orange robes, flame motifs on clothing")
            # Magic - Ice/Frost
            elif any(
                word in skill_lower
                for word in ["ice", "frost", "cryo", "frozen", "cold"]
            ):
                skill_visuals.append("blue and white robes, frost patterns on clothing")
            # Magic - Lightning/Storm
            elif any(
                word in skill_lower
                for word in ["lightning", "thunder", "storm", "electro", "shock"]
            ):
                skill_visuals.append("purple and blue robes, lightning symbols")
            # Magic - Healing/Divine
            elif any(
                word in skill_lower
                for word in [
                    "heal",
                    "restor",
                    "divine",
                    "holy",
                    "white magic",
                    "cleric",
                    "priest",
                    "medicine",
                    "medic",
                ]
            ):
                skill_visuals.append(
                    "healing pouches on belt, herbs visible, white robes, medical bag, staff with healing symbols"
                )
            # Magic - Necromancy/Dark
            elif any(
                word in skill_lower
                for word in [
                    "necro",
                    "death",
                    "dark",
                    "shadow",
                    "unholy",
                    "curse",
                    "hex",
                ]
            ):
                skill_visuals.append("dark robes, skull motifs, shadow aesthetic")
            # Magic - Illusion/Mind
            elif any(
                word in skill_lower
                for word in ["illusion", "mind", "enchant", "charm", "mesmer"]
            ):
                skill_visuals.append("mystical robes with hypnotic patterns")
            # Magic - Summoning
            elif any(
                word in skill_lower
                for word in ["summon", "conjur", "binding", "familiar"]
            ):
                skill_visuals.append("robes with summoning runes, mystical talismans")
            # Magic - General
            elif any(
                word in skill_lower
                for word in [
                    "magic",
                    "mage",
                    "wizard",
                    "sorc",
                    "arcane",
                    "mystic",
                    "spell",
                    "cast",
                ]
            ):
                skill_visuals.append(
                    "mystical robes, arcane symbols on clothing, magical staff"
                )
            # Alchemy/Potions
            elif any(
                word in skill_lower
                for word in ["alche", "potion", "brew", "elixir", "transmut", "herbal"]
            ):
                skill_visuals.append(
                    "alchemical vials on belt, mystical tools, ingredient pouches"
                )

            # Crafting - Smithing
            elif any(
                word in skill_lower
                for word in ["blacksmith", "forg", "metal", "smith", "weaponcraft"]
            ):
                skill_visuals.append(
                    "leather apron, forge tools at belt, soot-stained work clothes"
                )
            # Crafting - Woodworking
            elif any(
                word in skill_lower for word in ["carpen", "wood", "lumber", "craft"]
            ):
                skill_visuals.append(
                    "tool belt, woodworking tools, practical work clothes"
                )
            # Crafting - Leather
            elif any(word in skill_lower for word in ["leather", "tann", "hide"]):
                skill_visuals.append("leather working tools, material samples")
            # Crafting - Engineering
            elif any(
                word in skill_lower
                for word in ["engineer", "mechanic", "tinker", "gadget", "inventor"]
            ):
                skill_visuals.append("tool belt, mechanical parts, goggles on forehead")
            # Crafting - Cooking
            elif any(
                word in skill_lower for word in ["cook", "culinary", "chef", "baking"]
            ):
                skill_visuals.append("apron, cooking utensils at belt")

            # Stealth - General
            elif any(
                word in skill_lower
                for word in [
                    "stealth",
                    "sneak",
                    "infiltrat",
                    "shadow",
                    "assassin",
                    "ninja",
                ]
            ):
                skill_visuals.append(
                    "dark hooded cloak, concealing garments, face wrap"
                )
            # Stealth - Thievery
            elif any(
                word in skill_lower
                for word in [
                    "thief",
                    "steal",
                    "lockpick",
                    "pickpocket",
                    "burglar",
                    "rogue",
                ]
            ):
                skill_visuals.append(
                    "leather vest, lockpicks visible at belt, dark practical clothing"
                )
            # Stealth - Disguise
            elif any(
                word in skill_lower
                for word in ["disguise", "decept", "spy", "espionage"]
            ):
                skill_visuals.append("nondescript practical clothing, hidden tools")

            # Survival - Hunting/Tracking
            elif any(
                word in skill_lower
                for word in ["hunt", "track", "trap", "ranger", "scout", "wilderness"]
            ):
                skill_visuals.append(
                    "practical survival gear, rugged outdoor attire, hunting knife visible"
                )
            # Survival - Foraging
            elif any(
                word in skill_lower
                for word in ["forag", "scaveng", "salvag", "loot", "gather"]
            ):
                skill_visuals.append(
                    "collection pouches, worn practical gear, backpack straps visible"
                )
            # Survival - Animal Handling
            elif any(
                word in skill_lower
                for word in ["animal", "beast", "taming", "falconry", "riding"]
            ):
                skill_visuals.append(
                    "leather gear, animal training tools, rugged outdoor clothing"
                )
            # Survival - Fishing
            elif any(word in skill_lower for word in ["fish", "angling", "maritime"]):
                skill_visuals.append("fishing tools, net on belt, waterproof gear")
            # Survival - General
            elif any(
                word in skill_lower for word in ["survival", "bushcraft", "outdoors"]
            ):
                skill_visuals.append(
                    "survival knife, rope coils, weatherproof clothing"
                )

            # No visual elements for pure social skills like persuasion, leadership, etc.

        if skill_visuals:
            skill_details = ", " + ", ".join(skill_visuals)

    # Theme-specific style guidance - Portrait focused with simple backgrounds
    # Note: Removed mandatory goggles/implants/scars to allow more variety
    theme_styles = {
        "post-apocalyptic": """
            post-apocalyptic survivor aesthetic, weathered rugged look, battle-hardened features,
            practical worn clothing visible at shoulders/collar, muted earthy color palette,
            dust and grime weathering on skin, survival aesthetic,
            dramatic side lighting, gritty realistic style,
            simple dark background - charcoal gray or dusty brown gradient,
            inspired by The Last of Us and Mad Max character portraits
        """,
        "steampunk": """
            Victorian steampunk aesthetic, brass and leather accents visible on collar,
            rich warm color palette, sepia and bronze tones,
            intricate Victorian-era clothing details, warm golden lighting, painterly style,
            simple background - warm brown or sepia gradient,
            inspired by Dishonored and Bioshock character portraits
        """,
        "norse-mythology": """
            Norse Viking aesthetic, fur-lined collar visible,
            cold muted color palette - grays, blues, earth tones,
            weathered battle-worn features, dramatic side lighting,
            simple background - dark gray or cold blue gradient,
            inspired by God of War and Vikings series character portraits
        """,
        "cyberpunk": """
            cyberpunk futuristic aesthetic, sleek tech-wear collar,
            neon accent lighting on face, vibrant neon colors - hot pink, electric blue, purple rim lighting,
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
    {skill_details},
    {style},
    {art_style},
    professional character art, intricate facial details, sharp focus,
    detailed eyes, expressive face, realistic skin texture with pores and details,
    detailed hair strands, fabric texture on clothing,
    dramatic lighting on face, soft rim lighting, depth of field,
    distinctive facial features, unique character design,
    diverse body type, varied appearance, unconventional design,
    simple clean background, gradient or solid color background,
    portrait photography composition, high-quality character illustration
    """.strip()

    # Negative prompt optimized for character portrait models
    # Added stereotypical features to avoid repetitive designs
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

    modern clothing in fantasy setting, anachronistic elements,

    generic design, stereotypical, cliché appearance,
    same face syndrome, repetitive design,
    overly similar characters, cookie-cutter design
    """.strip()

    return positive_prompt, negative_prompt
