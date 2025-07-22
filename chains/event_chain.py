import logging

from models.lore_piece import LorePiece
from services.openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.blacklist import BLACKLIST
from utils.text_formatting import clean_ai_text
from utils.load_prompt_from_file import load_prompt

from utils.logger import logger
from utils.exceptions.generation import EventGenerationError

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


async def generate_event(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a notable event by prompting for:
    name, description, and impact.
    Theme controls the genre/world setting.
    """
    try:
        # Name prompt
        name_prompt = load_prompt(
            "event/event_name.txt",
            theme=theme,
            blacklist=blacklist_str,
        )
        name_raw = await ask_openrouter(name_prompt, max_tokens=50)
        name = clean_ai_text(name_raw)

        # Description prompt
        description_prompt = load_prompt(
            "event/event_description.txt",
            theme=theme,
            name=name,
        )

        description_raw = await ask_openrouter(description_prompt, max_tokens=200)
        description = clean_ai_text(description_raw)

        # Impact prompt
        impact_prompt = load_prompt(
            "event/event_impact.txt",
            theme=theme,
            name=name,
            description=description,
        )
        impact_raw = await ask_openrouter(impact_prompt, max_tokens=150)
        impact = clean_ai_text(impact_raw)

    except Exception as e:
        logger.error(f"Failed to generate event: {e}", exc_info=True)
        raise EventGenerationError(str(e))

    details = {"impact": impact}

    return LorePiece(
        name=name,
        description=description,
        details=details,
        type="event",
    )
