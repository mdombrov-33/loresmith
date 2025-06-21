from openrouter_client import ask_openrouter
from models.faction import Faction


async def generate_faction() -> Faction:
    """
    Generate a post -apocalyptic faction by sequentially prompting the AI for
    name, ideology, appearance, and a final summary.

    Returns:
        Faction: A dataclass instance with faction attributes.

    Raises:
        httpx.RequestError: On network or API errors.
        httpx.HTTPStatusError: On HTTP errors.
    """

    # 1. Name
    name_prompt = "Invent a unique name for a post-apocalyptic faction."
    name = await ask_openrouter(name_prompt)

    # 2. Ideology
    ideology_prompt = (
        f"What are the core beliefs and goals of the faction named '{name.strip()}'? "
        "Answer in 2-3 sentences, avoid headings, markdown, and detailed explanations."
    )
    ideology = await ask_openrouter(ideology_prompt)

    # 3. Appearance
    appearance_prompt = (
        f"What is the typical appearance of members of the '{name.strip()}' faction? What symbols or colors do they use? "
        "Answer in 2-3 sentences, avoid headings, markdown, and detailed explanations."
    )
    appearance = await ask_openrouter(appearance_prompt)

    # 4. Final Summary
    summary_prompt = (
        f"Write a short lore summary for the faction '{name.strip()}', "
        "based on the following details: \n\n"
        f"Ideology: {ideology.strip()}\nAppearance: {appearance.strip()}\n\n"
        "Keep the summary concise, no more than 3 sentences"
    )
    summary = await ask_openrouter(summary_prompt)

    return Faction(
        name=name.strip(),
        ideology=ideology.strip(),
        appearance=appearance.strip(),
        summary=summary.strip(),
    )
