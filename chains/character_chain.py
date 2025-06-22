import logging

from models.lore_piece import LorePiece
from openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.blacklist import BLACKLIST
from utils.clean_ai_text import clean_ai_text

logger = logging.getLogger(__name__)

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


async def generate_character() -> LorePiece:
    """
    Generate a character by prompting for:
    name, personality traits, appearance traits, and backstory.
    """

    try:
        # Name prompt
        name_prompt = (
            f"Invent a unique name for a character in a post-apocalyptic world that does NOT contain or match any of the following words or names: {blacklist_str}. "
            " Be creative and avoid repetition."
            " Respond only with plain text, no markdown or special characters."
            " No newlines; output a single paragraph."
            " Name should be 1-2 words only."
        )
        name_raw = await ask_openrouter(name_prompt, 50)
        name = clean_ai_text(name_raw)

        # Personality prompt
        personality_prompt = (
            f"List exactly 3 personality traits of the character named '{name}',"
            " separated by commas."
            " Respond only with plain text, no markdown."
            " No newlines; output a single paragraph."
        )
        personality_raw = await ask_openrouter(personality_prompt, 70)
        personality = clean_ai_text(personality_raw)

        # Appearance prompt
        appearance_prompt = (
            f"List key physical appearance traits of the character named '{name}',"
            " separated by commas."
            " Respond only with plain text, no markdown."
            " No newlines; output a single paragraph."
        )
        appearance_raw = await ask_openrouter(appearance_prompt, 70)
        appearance = clean_ai_text(appearance_raw)

        # Backstory prompt
        backstory_prompt = (
            f"Write a brief backstory for the character named '{name}',"
            " in 1-2 sentences."
            " Respond only with plain text, no markdown or special characters."
            " No newlines; output a single paragraph."
        )
        backstory_raw = await ask_openrouter(backstory_prompt, 150)
        backstory = clean_ai_text(backstory_raw)

    except Exception as e:
        logger.error(f"Failed to generate character: {e}", exc_info=True)
        raise

    details = {
        "personality": personality,
        "appearance": appearance,
    }

    return LorePiece(
        name=name,
        description=backstory,
        details=details,
        type="character",
    )
