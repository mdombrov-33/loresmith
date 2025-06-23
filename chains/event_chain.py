import logging

from models.lore_piece import LorePiece
from openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.blacklist import BLACKLIST
from utils.text_formatting import clean_ai_text

logger = logging.getLogger(__name__)

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


async def generate_event(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a notable event by prompting for:
    name, description, and impact.
    Theme controls the genre/world setting.
    """
    try:
        # Name prompt
        name_prompt = (
            f"Invent a unique name for a significant {theme} event that does NOT contain or match any of the following words or names: {blacklist_str}. "
            "Respond only with plain text, no markdown or special characters."
            "No newlines; output a single paragraph."
            "Name should be 2-5 words only."
        )
        name_raw = await ask_openrouter(name_prompt, max_tokens=50)
        name = clean_ai_text(name_raw)

        # Description prompt
        description_prompt = (
            f"Describe the event named '{name}' in 2-3 sentences in a {theme} setting."
            "Include what happened and key details."
            "Respond only with plain text, no markdown."
            "No newlines; output a single paragraph."
        )
        description_raw = await ask_openrouter(description_prompt, max_tokens=150)
        description = clean_ai_text(description_raw)

        # Impact prompt
        impact_prompt = (
            f"Explain the impact or consequences of the event '{name}' in a {theme} world."
            "Respond only with plain text, no markdown."
            "No newlines; output a single paragraph."
            "Respond in exactly 1 sentence."
        )
        impact_raw = await ask_openrouter(impact_prompt, max_tokens=70)
        impact = clean_ai_text(impact_raw)

    except Exception as e:
        logger.error(f"Failed to generate event: {e}", exc_info=True)
        raise

    details = {
        "impact": impact,
    }

    return LorePiece(
        name=name,
        description=description,
        details=details,
        type="event",
    )
