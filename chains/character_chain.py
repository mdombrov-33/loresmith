from models.lore_piece import LorePiece
from services.openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.blacklist import BLACKLIST
from utils.text_formatting import clean_ai_text
from utils.load_prompt_from_file import load_prompt

from utils.logger import logger
from utils.exceptions.generation import CharacterGenerationError

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

    except Exception as e:
        logger.error(f"Failed to generate character: {e}", exc_info=True)
        raise CharacterGenerationError(str(e))

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
