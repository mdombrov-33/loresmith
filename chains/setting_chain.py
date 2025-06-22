from openrouter_client import ask_openrouter_with_retries as ask_openrouter
from models.setting import Setting
from utils.clean_ai_text import clean_ai_text
import logging

logger = logging.getLogger(__name__)


async def generate_setting() -> Setting:
    """
    Generate a post-apocalyptic setting with name, landscape, dangers, and summary.
    """
    try:
        name_prompt = (
            " Invent a unique name for a post-apocalyptic setting."
            " Respond only with plain text, no markdown or special characters."
            " Do not include newlines; write all output in a single paragraph."
            " It should be 2-4 words long, no more."
            " The result must be a name only, not a sentence or description."
        )
        name_raw = await ask_openrouter(name_prompt, 50)
        name = clean_ai_text(name_raw)

        landscape_prompt = (
            f" Describe the primary landscape of the setting '{name}'."
            " Include terrain, climate, and notable features."
            " Respond only with plain text, no markdown or special characters."
            " Do not include newlines; write all output in a single paragraph."
            " Respond in exactly 2 sentences, no more."
            " This 2 sentences should be descriptive, medium length, and provide a vivid image of the setting."
        )
        landscape_raw = await ask_openrouter(landscape_prompt, 150)
        landscape = clean_ai_text(landscape_raw)

        dangers_prompt = (
            f" What are the main dangers and threats in the setting '{name}'?"
            " Include environmental hazards, creatures, or other challenges."
            " Respond only with plain text, no markdown or special characters."
            " Do not include newlines; write all output in a single paragraph."
            " Respond in exactly 1 sentence, no more."
            " This 1 sentence should describe the dangers in a concise and impactful way."
            " This 1 sentence should describe 2-3 dangers or threats max."
        )
        dangers_raw = await ask_openrouter(dangers_prompt, 80)
        dangers = clean_ai_text(dangers_raw)

        summary_prompt = (
            f" Write a short lore summary for the setting '{name}' using:"
            f"\n\nLandscape: {landscape}\nDangers: {dangers}\n\n"
            " Keep it concise, no more than 2 sentences."
            " Respond only with plain text, no markdown or special characters."
            " Do not include newlines; write all output in a single paragraph."
        )
        summary_raw = await ask_openrouter(summary_prompt, 150)
        summary = clean_ai_text(summary_raw)

        return Setting(
            name=name,
            landscape=landscape,
            dangers=dangers,
            summary=summary,
        )
    except Exception as e:
        logger.error(f"Error generating setting: {e}", exc_info=True)
        raise
