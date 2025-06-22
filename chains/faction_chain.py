from openrouter_client import ask_openrouter
from models.faction import Faction
from utils.clean_ai_text import clean_ai_text


async def generate_faction() -> Faction:
    """
    Generate a post-apocalyptic faction by prompting for:
    name, ideology, appearance, and a summary.
    """

    name_prompt = (
        " Invent a unique name for a post-apocalyptic faction."
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
    )
    name_raw = await ask_openrouter(name_prompt)
    name = clean_ai_text(name_raw)

    ideology_prompt = (
        f" What are the core beliefs and goals of the faction named '{name}'?"
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
    )
    ideology_raw = await ask_openrouter(ideology_prompt)
    ideology = clean_ai_text(ideology_raw)

    appearance_prompt = (
        f" Describe the typical appearance of members of the '{name}' faction."
        " Include details about attire, symbols, and color schemes."
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
    )
    appearance_raw = await ask_openrouter(appearance_prompt)
    appearance = clean_ai_text(appearance_raw)

    summary_prompt = (
        f" Write a short lore summary for the faction '{name}' based on the following:"
        f"\n\nIdeology: {ideology}\nAppearance: {appearance}\n\n"
        " Keep the summary concise, no more than 2 sentences."
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
    )
    summary_raw = await ask_openrouter(summary_prompt)
    summary = clean_ai_text(summary_raw)

    return Faction(
        name=name,
        ideology=ideology,
        appearance=appearance,
        summary=summary,
    )
