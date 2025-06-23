import logging

from models.lore_piece import LorePiece
from services.openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.blacklist import BLACKLIST
from utils.text_formatting import clean_ai_text

logger = logging.getLogger(__name__)

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


async def generate_relic(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a relic/artifact by prompting for:
    name, description, and history.
    Theme controls the genre/world setting.
    """
    try:
        # Name prompt
        name_prompt = (
            f"Invent a unique name for a mysterious {theme} relic or artifact that does NOT contain or match any of the following words or names: {blacklist_str}. "
            "Respond only with plain text, no markdown or special characters."
            "No newlines; output a single paragraph."
            "Name should be 2-4 words only."
        )
        name_raw = await ask_openrouter(name_prompt, max_tokens=50)
        name = clean_ai_text(name_raw)

        # Description prompt
        description_prompt = (
            f"Describe the appearance and notable features of the relic named '{name}' in a {theme} setting."
            "Respond only with plain text, no markdown."
            "No newlines; output a single paragraph."
            "Respond in exactly 2 sentences."
        )
        description_raw = await ask_openrouter(description_prompt, max_tokens=120)
        description = clean_ai_text(description_raw)

        # History prompt
        history_prompt = (
            f"Explain the history and significance of the relic '{name}' in the context of a {theme} world."
            "Respond only with plain text, no markdown."
            "No newlines; output a single paragraph."
            "Respond in exactly 2 sentences."
        )
        history_raw = await ask_openrouter(history_prompt, max_tokens=150)
        history = clean_ai_text(history_raw)

    except Exception as e:
        logger.error(f"Failed to generate relic: {e}", exc_info=True)
        raise

    details = [
        f"History: {history}",
    ]

    return LorePiece(
        name=name,
        description=description,
        details=details,
        type="relic",
    )
