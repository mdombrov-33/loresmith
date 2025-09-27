from typing import Union
from utils.blacklist import BLACKLIST
from utils.logger import logger
from utils.load_prompt import load_prompt
from models.lore_piece import LorePiece
from services.openrouter_client import ask_openrouter_with_retries as ask_openrouter
from exceptions.generation import CharacterGenerationError
from utils.format_text import clean_ai_text

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


async def generate_character(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a character by prompting for:
    name, personality traits, appearance traits, and backstory.
    The generation is adapted to the provided theme.
    """

    try:
        # Name prompt
        name_prompt = load_prompt(
            "character/character_name.txt",
            theme=theme,
            blacklist=blacklist_str,
        )
        name_raw = await ask_openrouter(name_prompt, 50)
        name = clean_ai_text(name_raw)

        # Personality prompt
        personality_prompt = load_prompt(
            "character/character_personality.txt",
            theme=theme,
            name=name,
        )
        personality_raw = await ask_openrouter(personality_prompt, 70)
        personality = clean_ai_text(personality_raw)

        # Appearance prompt
        appearance_prompt = load_prompt(
            "character/character_appearance.txt",
            theme=theme,
            name=name,
        )
        appearance_raw = await ask_openrouter(appearance_prompt, 150)
        appearance = clean_ai_text(appearance_raw)

        # Backstory prompt
        backstory_prompt = load_prompt(
            "character/character_backstory.txt",
            theme=theme,
            name=name,
            personality=personality,
        )
        backstory_raw = await ask_openrouter(backstory_prompt, 200)
        backstory = clean_ai_text(backstory_raw)

        # Skills prompt
        skills_prompt = load_prompt(
            "character/character_skills.txt",
            theme=theme,
            name=name,
            personality=personality,
            appearance=appearance,
        )
        skills_raw = await ask_openrouter(skills_prompt, 70)
        skills = clean_ai_text(skills_raw)

        # Stats prompt
        stats_prompt = load_prompt(
            "character/character_stats.txt",
            theme=theme,
            name=name,
            personality=personality,
            appearance=appearance,
            description=backstory,
            skills=skills,
        )
        stats_raw = await ask_openrouter(stats_prompt, 70)
        stats = clean_ai_text(stats_raw)

        health = 100
        stress = 0
        import re

        health_match = re.search(r"health[:\s]*(\d+)", stats, re.IGNORECASE)
        if health_match:
            try:
                health = int(health_match.group(1))
                health = max(50, min(150, health))
            except Exception as e:
                logger.warning(f"Failed to parse health: {e}")
        stress_match = re.search(r"stress[:\s]*(\d+)", stats, re.IGNORECASE)
        if stress_match:
            try:
                stress = int(stress_match.group(1))
                stress = max(0, min(50, stress))
            except Exception as e:
                logger.warning(f"Failed to parse stress: {e}")

    except Exception as e:
        logger.error(f"Character generation error: {e}", exc_info=True)
        raise CharacterGenerationError(
            f"Failed to generate character for theme {theme}: {str(e)}"
        )

    details: dict[str, Union[str, str]] = {
        "personality": personality,
        "appearance": appearance,
        "health": "100",
        "stress": "0",
        "skills": skills,
    }

    details["health"] = str(health)
    details["stress"] = str(stress)

    return LorePiece(
        name=name,
        description=backstory,
        details=details,
        type="character",
    )
