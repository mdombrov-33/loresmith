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
        " It should be 2-4 words long, no more."
        " The result must be a name only, not a sentence or description."
    )
    name_raw = await ask_openrouter(name_prompt, 50)
    name = clean_ai_text(name_raw)

    ideology_prompt = (
        f" What are the core beliefs and goals of the faction named '{name}'?"
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
        " Respond in exactly 1 sentence, no more."
        " This 1 sentence should be descriptive, but not too long."
        " It should capture the essence of the faction's ideology."
    )
    ideology_raw = await ask_openrouter(ideology_prompt, 100)
    ideology = clean_ai_text(ideology_raw)

    appearance_prompt = (
        f" Describe the typical appearance of members of the '{name}' faction."
        " Include details about attire, symbols, and color schemes."
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
        " Respond in exactly 1 sentence, no more."
        " This 1 sentence should be descriptive, but not too long."
        " It should reflect the faction's ideology and culture."
    )
    appearance_raw = await ask_openrouter(appearance_prompt, 100)
    appearance = clean_ai_text(appearance_raw)

    summary_prompt = (
        f" Write a short lore summary for the faction '{name}' based on the following:"
        f"\n\nIdeology: {ideology}\nAppearance: {appearance}\n\n"
        " Keep the summary concise, no more than 2 sentences."
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
    )
    summary_raw = await ask_openrouter(summary_prompt, 150)
    summary = clean_ai_text(summary_raw)

    return Faction(
        name=name,
        ideology=ideology,
        appearance=appearance,
        summary=summary,
    )
