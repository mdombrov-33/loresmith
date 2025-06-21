from openrouter_client import ask_openrouter
from models.faction import Faction
import re


def clean_ai_text(text: str) -> str:
    """
    Clean AI output by removing markdown-like syntax, newlines,
    and collapsing extra whitespace.
    """
    text = re.sub(r"(\*\*|__)(.*?)\1", r"\2", text)
    text = re.sub(r"(\*|_)(.*?)\1", r"\2", text)
    text = re.sub(r"\s*\n\s*", " ", text)
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()


async def generate_faction() -> Faction:
    """
    Generate a post-apocalyptic faction by sequentially prompting the AI for
    name, ideology, appearance, and a final summary.

    Returns:
        Faction: A dataclass instance with faction attributes.

    Raises:
        httpx.RequestError: On network or API errors.
        httpx.HTTPStatusError: On HTTP errors.
    """

    # 1. Name
    name_prompt = (
        "Invent a unique name for a post-apocalyptic faction."
        "\nRespond only with plain text, no markdown or special characters."
        "\nDo not include newlines; write all output in a single paragraph."
    )
    name_raw = await ask_openrouter(name_prompt)
    name = clean_ai_text(name_raw)

    # 2. Ideology
    ideology_prompt = (
        f"What are the core beliefs and goals of the faction named '{name}'? "
        "Respond only with plain text, no markdown, no special characters, no asterisks or underscores. "
        "Do not include newlines; write all output in a single paragraph. "
        "Avoid using punctuation for emphasis like bold or italics."
    )
    ideology_raw = await ask_openrouter(ideology_prompt)
    ideology = clean_ai_text(ideology_raw)

    # 3. Appearance
    appearance_prompt = (
        f"What is the typical appearance of members of the '{name}' faction? What symbols or colors do they use? "
        "Respond only with plain text, no markdown, no special characters, no asterisks or underscores. "
        "Do not include newlines; write all output in a single paragraph. "
        "Avoid using punctuation for emphasis like bold or italics."
    )
    appearance_raw = await ask_openrouter(appearance_prompt)
    appearance = clean_ai_text(appearance_raw)

    # 4. Final Summary
    summary_prompt = (
        f"Write a short lore summary for the faction '{name}', "
        f"based on the following details:\n\nIdeology: {ideology}\nAppearance: {appearance}\n\n"
        "Keep the summary concise, no more than 2 sentences. "
        "Respond only with plain text, no markdown or special characters. "
        "Do not include newlines; write all output in a single paragraph."
    )
    summary_raw = await ask_openrouter(summary_prompt)
    summary = clean_ai_text(summary_raw)

    return Faction(
        name=name,
        ideology=ideology,
        appearance=appearance,
        summary=summary,
    )
