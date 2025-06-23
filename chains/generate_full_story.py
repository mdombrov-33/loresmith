import logging

from constants.themes import Theme
from models.full_story import FullStory
from models.selected_lore_pieces import SelectedLorePieces
from openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.text_formatting import clean_ai_text, format_details

logger = logging.getLogger(__name__)


async def generate_full_story(
    selected_pieces: SelectedLorePieces, theme: Theme
) -> FullStory:
    """
    Generate a full story based on the selected lore pieces and theme.

    Parameters:
    - selected_pieces: A SelectedLorePieces dataclass containing the selected lore pieces
    - theme: The theme for the story generation.

    Returns:
    A FullStory dataclass containing the generated story and the selected pieces.
    """
    try:
        # Extract each piece from the selected_pieces dictionary, fallback to dummy data
        character = selected_pieces.character
        faction = selected_pieces.faction
        setting = selected_pieces.setting
        event = selected_pieces.event
        relic = selected_pieces.relic

        prompt = f"""
You are an expert storyteller creating a lore-rich narrative in a {theme} world.
Combine the following elements into a cohesive and immersive story summary:

Character:
Name: {character.name if character else 'N/A'}
Description: {character.description if character else 'N/A'}
Details: {format_details(character.details) if character else 'N/A'}

Faction:
Name: {faction.name if faction else 'N/A'}
Description: {faction.description if faction else 'N/A'}
Details: {format_details(faction.details) if faction else 'N/A'}

Setting:
Name: {setting.name if setting else 'N/A'}
Description: {setting.description if setting else 'N/A'}
Details: {format_details(setting.details) if setting else 'N/A'}

Event:
Name: {event.name if event else 'N/A'}
Description: {event.description if event else 'N/A'}
Details: {format_details(event.details) if event else 'N/A'}

Relic:
Name: {relic.name if relic else 'N/A'}
Description: {relic.description if relic else 'N/A'}
Details: {format_details(relic.details) if relic else 'N/A'}

Write a creative story summary connecting all these elements naturally.
Use vivid language and keep it under 5 sentences.
Respond only with plain text, no markdown or special characters.
""".strip()

        full_story_raw = await ask_openrouter(prompt, max_tokens=500)
        full_story_content = clean_ai_text(full_story_raw)

        return FullStory(
            title="Full Story",
            content=full_story_content,
            theme=theme,
            pieces=selected_pieces,
        )

    except Exception as e:
        logger.error(f"Failed to generate full story: {e}", exc_info=True)
        raise
