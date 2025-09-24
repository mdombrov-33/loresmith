from models.lore_piece import LorePiece
from services.openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.blacklist import BLACKLIST
from utils.format_text import clean_ai_text
from utils.load_prompt import load_prompt
from utils.logger import logger
from exceptions.generation import RelicGenerationError

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


async def generate_relic(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a relic/artifact by prompting for:
    name, description, and history.
    Theme controls the genre/world setting.
    """
    try:
        # Name prompt
        name_prompt = load_prompt(
            "relic/relic_name.txt",
            theme=theme,
            blacklist=blacklist_str,
        )
        name_raw = await ask_openrouter(name_prompt, max_tokens=50)
        name = clean_ai_text(name_raw)

        # Description prompt
        description_prompt = load_prompt(
            "relic/relic_description.txt",
            theme=theme,
            name=name,
        )
        description_raw = await ask_openrouter(description_prompt, max_tokens=150)
        description = clean_ai_text(description_raw)

        # History prompt
        history_prompt = load_prompt(
            "relic/relic_history.txt",
            theme=theme,
            name=name,
            description=description,
        )
        history_raw = await ask_openrouter(history_prompt, max_tokens=150)
        history = clean_ai_text(history_raw)

    except Exception as e:
        logger.error(f"Relic generation error: {e}", exc_info=True)
        raise RelicGenerationError(
            f"Failed to generate relic for theme {theme}: {str(e)}"
        )

    details = {
        "history": history,
    }

    return LorePiece(
        name=name,
        description=description,
        details=details,
        type="relic",
    )
