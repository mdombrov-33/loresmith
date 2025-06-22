from openrouter_client import ask_openrouter
from models.setting import Setting
from utils.clean_ai_text import clean_ai_text


async def generate_setting() -> Setting:
    """
    Generate a post-apocalyptic setting with name, landscape, dangers, and summary.
    """

    name_prompt = (
        " Invent a unique name for a post-apocalyptic setting."
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
    )
    name_raw = await ask_openrouter(name_prompt)
    name = clean_ai_text(name_raw)

    landscape_prompt = (
        f" Describe the primary landscape of the setting '{name}'."
        " Include terrain, climate, and notable features."
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
    )
    landscape_raw = await ask_openrouter(landscape_prompt)
    landscape = clean_ai_text(landscape_raw)

    dangers_prompt = (
        f" What are the main dangers and threats in the setting '{name}'?"
        " Include environmental hazards, creatures, or other challenges."
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
    )
    dangers_raw = await ask_openrouter(dangers_prompt)
    dangers = clean_ai_text(dangers_raw)

    summary_prompt = (
        f" Write a short lore summary for the setting '{name}' using:"
        f"\n\nLandscape: {landscape}\nDangers: {dangers}\n\n"
        " Keep it concise, no more than 2 sentences."
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
    )
    summary_raw = await ask_openrouter(summary_prompt)
    summary = clean_ai_text(summary_raw)

    return Setting(
        name=name,
        landscape=landscape,
        dangers=dangers,
        summary=summary,
    )
