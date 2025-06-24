import logging

from models.lore_piece import LorePiece
from services.openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.blacklist import BLACKLIST
from utils.text_formatting import clean_ai_text
from utils.load_prompt_from_file import load_prompt

logger = logging.getLogger(__name__)

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


async def generate_faction(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a faction by prompting for:
    name, ideology, appearance, and summary.
    Theme controls the genre/world setting.
    """
    try:
        # Name prompt
        name_prompt = load_prompt(
            "faction/faction_name.txt",
            theme=theme,
            blacklist=blacklist_str,
        )
        name_raw = await ask_openrouter(name_prompt, max_tokens=50)
        name = clean_ai_text(name_raw)

        # Ideology prompt
        ideology_prompt = load_prompt(
            "faction/faction_ideology.txt",
            theme=theme,
            name=name,
        )
        ideology_raw = await ask_openrouter(ideology_prompt, max_tokens=100)
        ideology = clean_ai_text(ideology_raw)

        # Appearance prompt
        appearance_prompt = load_prompt(
            "faction/faction_appearance.txt",
            theme=theme,
            name=name,
            ideology=ideology,
        )
        appearance_raw = await ask_openrouter(appearance_prompt, max_tokens=150)
        appearance = clean_ai_text(appearance_raw)

        # Summary prompt
        summary_prompt = load_prompt(
            "faction/faction_summary.txt",
            theme=theme,
            name=name,
            ideology=ideology,
            appearance=appearance,
        )
        summary_raw = await ask_openrouter(summary_prompt, max_tokens=200)
        summary = clean_ai_text(summary_raw)

    except Exception as e:
        logger.error(f"Failed to generate faction: {e}", exc_info=True)
        raise

    details = {
        "ideology": ideology,
        "appearance": appearance,
    }

    return LorePiece(
        name=name,
        description=summary,
        details=details,
        type="faction",
    )
