from openrouter_client import ask_openrouter
from models.npc import NPC
from models.faction import Faction
import re


def clean_ai_text(text: str) -> str:
    """
    Basic cleaning to remove unwanted markdown and newlines from AI output.
    """
    # Remove common markdown bold/italic
    text = re.sub(r"(\*\*|__)(.*?)\1", r"\2", text)
    text = re.sub(r"(\*|_)(.*?)\1", r"\2", text)
    # Replace newlines with space
    text = re.sub(r"\s*\n\s*", " ", text)
    # Collapse multiple spaces
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()


async def generate_npc(faction: Faction) -> NPC:
    """
    Generate a post-apocalyptic NPC connected to the given faction,
    by sequentially prompting the AI for name, role, personality, appearance, and backstory.

    Each prompt includes faction details to ensure coherence.

    Returns:
        NPC: A dataclass instance with NPC attributes.

    Raises:
        httpx.RequestError: On network or API errors.
        httpx.HTTPStatusError: On HTTP errors.
    """

    # 1. Name
    name_prompt = (
        "Invent a unique name for a post-apocalyptic NPC."
        "\nRespond only with plain text, no markdown or special characters."
        "\nDo not include newlines; write all output in a single paragraph."
    )
    name_raw = await ask_openrouter(name_prompt)
    name = clean_ai_text(name_raw)

    # 2. Role
    role_prompt = (
        f"Based on the faction '{faction.name}', which is described as follows:\n"
        f"Ideology: {faction.ideology}\n"
        f"Appearance: {faction.appearance}\n\n"
        f"What is the primary role of the NPC named '{name}' within this faction? "
        "Answer in 1-2 sentences. "
        "Respond only with plain text, no markdown or special characters. "
        "Do not include newlines; write all output in a single paragraph."
    )
    role_raw = await ask_openrouter(role_prompt)
    role = clean_ai_text(role_raw)

    # 3. Personality
    personality_prompt = (
        f"Describe the personality traits of the NPC named '{name}'. "
        f"Ensure the traits reflect the ideology and culture of the faction '{faction.name}' described below:\n"
        f"Ideology: {faction.ideology}\n\n"
        "Answer in 1-2 sentences. Respond only with plain text, no markdown or special characters. "
        "Do not include newlines; write all output in a single paragraph."
    )
    personality_raw = await ask_openrouter(personality_prompt)
    personality = clean_ai_text(personality_raw)

    # 4. Appearance
    appearance_prompt = (
        f"Describe the physical appearance of the NPC named '{name}', "
        f"reflecting the visual style and symbolism of the faction '{faction.name}':\n"
        f"{faction.appearance}\n\n"
        "Answer in 1-2 sentences. Respond only with plain text, no markdown or special characters. "
        "Do not include newlines; write all output in a single paragraph."
    )
    appearance_raw = await ask_openrouter(appearance_prompt)
    appearance = clean_ai_text(appearance_raw)

    # 5. Backstory
    backstory_prompt = (
        f"Write a brief backstory for the NPC named '{name}', "
        f"that fits with the history and values of the faction '{faction.name}'.\n\n"
        "Keep it concise, no more than 2 sentences. Respond only with plain text, no markdown or special characters. "
        "Do not include newlines; write all output in a single paragraph."
    )
    backstory_raw = await ask_openrouter(backstory_prompt)
    backstory = clean_ai_text(backstory_raw)

    return NPC(
        name=name,
        role=role,
        personality=personality,
        appearance=appearance,
        backstory=backstory,
    )
