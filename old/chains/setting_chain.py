from models.lore_piece import LorePiece
from services.openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.blacklist import BLACKLIST
from utils.text_formatting import clean_ai_text
from utils.load_prompt_from_file import load_prompt

from utils.logger import logger
from utils.exceptions.generation import SettingGenerationError

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


async def generate_setting(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a setting by prompting for:
    name, landscape description, dangers, and summary.
    Theme controls the genre/world setting.
    """
    try:
        # Name prompt
        name_prompt = load_prompt(
            "setting/setting_name.txt",
            theme=theme,
            blacklist=blacklist_str,
        )
        name_raw = await ask_openrouter(name_prompt, max_tokens=50)
        name = clean_ai_text(name_raw)

        # Landscape prompt
        landscape_prompt = load_prompt(
            "setting/setting_landscape.txt",
            theme=theme,
            name=name,
        )
        landscape_raw = await ask_openrouter(landscape_prompt, max_tokens=150)
        landscape = clean_ai_text(landscape_raw)

        # Dangers prompt
        dangers_prompt = load_prompt(
            "setting/setting_dangers.txt",
            theme=theme,
            name=name,
            landscape=landscape,
        )
        dangers_raw = await ask_openrouter(dangers_prompt, max_tokens=150)
        dangers = clean_ai_text(dangers_raw)

        # Summary prompt
        summary_prompt = load_prompt(
            "setting/setting_summary.txt",
            theme=theme,
            name=name,
            landscape=landscape,
            dangers=dangers,
        )
        summary_raw = await ask_openrouter(summary_prompt, max_tokens=200)
        summary = clean_ai_text(summary_raw)

    except Exception as e:
        logger.error(f"Failed to generate setting: {e}", exc_info=True)
        raise SettingGenerationError(str(e))

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
