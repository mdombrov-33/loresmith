import logging

from models.lore_piece import LorePiece
from openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.blacklist import BLACKLIST
from utils.clean_ai_text import clean_ai_text

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
        name_prompt = (
            f"Invent a unique name for a {theme} faction that does NOT contain or match any of the following words or names: {blacklist_str}. "
            "Respond only with plain text, no markdown."
            "No newlines; output a single paragraph."
            "Name should be 2-3 words only."
        )
        name_raw = await ask_openrouter(name_prompt, max_tokens=50)
        name = clean_ai_text(name_raw)

        # Ideology prompt
        ideology_prompt = (
            f"Describe the core beliefs and goals of the {theme} faction named '{name}'."
            " Respond only with plain text, no markdown."
            " No newlines; output exactly 1 sentence."
        )
        ideology_raw = await ask_openrouter(ideology_prompt, max_tokens=70)
        ideology = clean_ai_text(ideology_raw)

        # Appearance prompt
        appearance_prompt = (
            f"Describe the typical appearance of members of the faction '{name}',"
            f" including attire, symbols, or colors typical in a {theme} setting."
            " Respond only with plain text, no markdown."
            " No newlines; output exactly 1 sentence."
        )
        appearance_raw = await ask_openrouter(appearance_prompt, max_tokens=70)
        appearance = clean_ai_text(appearance_raw)

        # Summary prompt
        summary_prompt = (
            f"Write a brief lore summary for the {theme} faction '{name}' based on ideology and appearance."
            " Keep it to 2 sentences."
            " Respond only with plain text, no markdown."
            " No newlines; output a single paragraph."
        )
        summary_raw = await ask_openrouter(summary_prompt, max_tokens=150)
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
