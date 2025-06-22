import logging

from models.lore_piece import LorePiece
from openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.blacklist import BLACKLIST
from utils.clean_ai_text import clean_ai_text

logger = logging.getLogger(__name__)

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


async def generate_setting() -> LorePiece:
    """
    Generate a setting by prompting for:
    name, landscape description, dangers, and summary.
    """
    try:
        # Name prompt
        name_prompt = (
            f"Invent a unique name for a post-apocalyptic setting that does NOT contain or match any of the following words or names: {blacklist_str}. "
            " Respond only with plain text, no markdown or special characters."
            " No newlines; output a single paragraph."
            " Name should be 2-4 words only."
        )
        name_raw = await ask_openrouter(name_prompt, max_tokens=50)
        name = clean_ai_text(name_raw)

        # Landscape prompt
        landscape_prompt = (
            f"Describe the primary landscape of the setting '{name}',"
            " including terrain, climate, and notable features."
            " Respond only with plain text, no markdown."
            " No newlines; output a single paragraph."
            " Respond in exactly 2 sentences."
        )
        landscape_raw = await ask_openrouter(landscape_prompt, max_tokens=150)
        landscape = clean_ai_text(landscape_raw)

        # Dangers prompt
        dangers_prompt = (
            f"List the main dangers and threats in the setting '{name}',"
            " including environmental hazards, creatures, or other challenges."
            " Respond only with plain text, no markdown."
            " No newlines; output a single paragraph."
            " Respond in exactly 1 sentence."
            " Describe 2-3 dangers or threats."
        )
        dangers_raw = await ask_openrouter(dangers_prompt, max_tokens=80)
        dangers = clean_ai_text(dangers_raw)

        # Summary prompt
        summary_prompt = (
            f"Write a concise lore summary for the setting '{name}', using:"
            f"\n\nLandscape: {landscape}\nDangers: {dangers}\n\n"
            " Keep it no more than 2 sentences."
            " Respond only with plain text, no markdown or special characters."
            " No newlines; output a single paragraph."
        )
        summary_raw = await ask_openrouter(summary_prompt, max_tokens=150)
        summary = clean_ai_text(summary_raw)

    except Exception as e:
        logger.error(f"Failed to generate setting: {e}", exc_info=True)
        raise

    details = {
        "landscape": landscape,
        "dangers": dangers,
    }

    return LorePiece(
        name=name,
        description=summary,
        details=details,
        type="setting",
    )
