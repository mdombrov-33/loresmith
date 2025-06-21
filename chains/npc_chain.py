from openrouter_client import ask_openrouter
from models.npc import NPC


async def generate_npc() -> NPC:
    """
    Generate a post-apocalyptic NPC by sequentially prompting the AI for
    name, role, personality, appearance, and backstory.

    Returns:
        NPC: A dataclass instance with NPC attributes.

    Raises:
        httpx.RequestError: On network or API errors.
        httpx.HTTPStatusError: On HTTP errors.
    """

    # 1. Name
    name_prompt = "Invent a unique name for a post-apocalyptic NPC."
    name = await ask_openrouter(name_prompt)

    # 2. Role
    role_prompt = (
        f"What is the primary role of the NPC named '{name.strip()}'? "
        "Answer in 2-3 sentences, avoid headings, markdown, and detailed explanations."
    )
    role = await ask_openrouter(role_prompt)

    # 3. Personality
    personality_prompt = (
        f"Describe the personality traits of the NPC named '{name.strip()}'. "
        "Answer in 2-3 sentences, avoid headings, markdown, and detailed explanations."
    )
    personality = await ask_openrouter(personality_prompt)

    # 4. Appearance
    appearance_prompt = (
        f"Describe the physical appearance of the NPC named '{name.strip()}'. "
        "Answer in 2-3 sentences, avoid headings, markdown, and detailed explanations."
    )
    appearance = await ask_openrouter(appearance_prompt)

    # 5. Backstory
    backstory_prompt = (
        f"Write a brief backstory for the NPC named '{name.strip()}'. "
        "Keep it concise, no more than 3 sentences."
    )
    backstory = await ask_openrouter(backstory_prompt)

    return NPC(
        name=name.strip(),
        role=role.strip(),
        personality=personality.strip(),
        appearance=appearance.strip(),
        backstory=backstory.strip(),
    )
