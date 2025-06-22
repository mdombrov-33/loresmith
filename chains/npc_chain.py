from openrouter_client import ask_openrouter
from models.npc import NPC
from models.faction import Faction
from utils.clean_ai_text import clean_ai_text


async def generate_npc(faction: Faction) -> NPC:
    """
    Generate an NPC based on a faction by prompting for:
    name, role, personality, appearance, and backstory.
    """

    name_prompt = (
        " Invent a unique name for a post-apocalyptic NPC."
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
        " It should be 2-4 words long, no more."
        " The result must be a name only, not a sentence or description."
    )
    name_raw = await ask_openrouter(name_prompt, 50)
    name = clean_ai_text(name_raw)

    role_prompt = (
        f" Based on the faction '{faction.name}' with the following traits:"
        f"\n\nIdeology: {faction.ideology}\nAppearance: {faction.appearance}\n\n"
        f" What is the primary role of the NPC named '{name}' within this faction?"
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
        " Respond in exactly 1 sentence, no more."
        " This 1 sentence should not be too descriptive, but rather give light context"
    )
    role_raw = await ask_openrouter(role_prompt, 70)
    role = clean_ai_text(role_raw)

    personality_prompt = (
        f" Describe the personality traits of the NPC named '{name}' based on the faction:"
        f"\n\nIdeology: {faction.ideology}\n\n"
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
        " Respond in exactly 1 sentence, no more."
        " This 1 sentence should be descriptive, but abstract."
    )
    personality_raw = await ask_openrouter(personality_prompt, 70)
    personality = clean_ai_text(personality_raw)

    appearance_prompt = (
        f" Describe the physical appearance of the NPC named '{name}',"
        f" based on the faction's style and symbols:\n\n{faction.appearance}\n\n"
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
        " Respond in exactly 1 sentences, no more."
        " This 1 sentence should be descriptive, but not too long."
    )
    appearance_raw = await ask_openrouter(appearance_prompt, 120)
    appearance = clean_ai_text(appearance_raw)

    backstory_prompt = (
        f" Write a brief backstory for the NPC named '{name}',"
        f" based on the values and goals of the faction '{faction.name}'."
        " Keep it concise, no more than 2 sentences."
        " Respond only with plain text, no markdown or special characters."
        " Do not include newlines; write all output in a single paragraph."
    )
    backstory_raw = await ask_openrouter(backstory_prompt, 150)
    backstory = clean_ai_text(backstory_raw)

    return NPC(
        name=name,
        role=role,
        personality=personality,
        appearance=appearance,
        backstory=backstory,
    )
