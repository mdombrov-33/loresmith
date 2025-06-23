import logging

from models.lore_piece import LorePiece
from services.openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.blacklist import BLACKLIST
from utils.text_formatting import clean_ai_text

logger = logging.getLogger(__name__)

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


async def generate_character(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a character by prompting for:
    name, personality traits, appearance traits, and backstory.
    The generation is adapted to the provided theme.
    """

    try:
        # Name prompt
        name_prompt = (
            f"Invent a unique name for a character in a {theme} world."
            f" Be creative and avoid repetition. Do not use any of the following banned words or names: {blacklist_str}."
            " Respond only with plain text, no markdown or special characters."
            " No newlines; output a single paragraph."
            " Name should be 1-2 words only."
        )
        name_raw = await ask_openrouter(name_prompt, 50)
        name = clean_ai_text(name_raw)

        # Personality prompt
        personality_prompt = (
            f"List exactly 3 personality traits of the character named '{name}',"
            f" who exists in a {theme} world."
            " Separate the traits with commas. Respond only with plain text."
            " No newlines; output a single paragraph."
        )
        personality_raw = await ask_openrouter(personality_prompt, 70)
        personality = clean_ai_text(personality_raw)

        # Appearance prompt
        appearance_prompt = (
            f"Describe key physical appearance traits of the character named '{name}',"
            f" considering they live in a {theme} world."
            " Include clothing, body, or other visual features."
            " Separate traits with commas. Respond only with plain text."
            " No newlines; output a single paragraph."
        )
        appearance_raw = await ask_openrouter(appearance_prompt, 70)
        appearance = clean_ai_text(appearance_raw)

        # Backstory prompt
        backstory_prompt = (
            f"Write a brief backstory for the character named '{name}',"
            f" who lives in a {theme} world."
            " Use 1-2 sentences max. Keep it concise and lore-friendly."
            " Respond only with plain text, no markdown or special characters."
            " No newlines; output a single paragraph."
        )
        backstory_raw = await ask_openrouter(backstory_prompt, 150)
        backstory = clean_ai_text(backstory_raw)

    except Exception as e:
        logger.error(f"Failed to generate character: {e}", exc_info=True)
        raise

    details = [
        f"Personality: {personality}",
        f"Appearance: {appearance}",
    ]

    return LorePiece(
        name=name,
        description=backstory,
        details=details,
        type="character",
    )
