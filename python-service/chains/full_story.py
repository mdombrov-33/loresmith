from constants.themes import Theme
from models.full_story import FullStory
from models.selected_lore_pieces import SelectedLorePieces
from services.openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.format_text import clean_ai_text, format_details
from utils.load_prompt import load_prompt
from utils.logger import logger
from exceptions.generation import FullStoryGenerationError


async def generate_full_story(
    selected_pieces: SelectedLorePieces, theme: Theme
) -> FullStory:
    """
    Generate a full story based on the selected lore pieces and theme.

    Parameters:
    - selected_pieces: A SelectedLorePieces dataclass containing the selected lore pieces
    - theme: The theme for the story generation.

    Returns:
    A FullStory containing the generated story, selected pieces, quest title, and quest description.
    """
    try:
        # Extract each piece from the selected_pieces dictionary, fallback to dummy data
        character = selected_pieces.character
        faction = selected_pieces.faction
        setting = selected_pieces.setting
        event = selected_pieces.event
        relic = selected_pieces.relic

        # Full story prompt
        full_story_prompt = load_prompt(
            "full_story/full_story.txt",
            theme=theme,
            character_name=character.name if character else "N/A",
            character_description=character.description if character else "N/A",
            character_details=format_details(character.details) if character else "N/A",
            faction_name=faction.name if faction else "N/A",
            faction_description=faction.description if faction else "N/A",
            faction_details=format_details(faction.details) if faction else "N/A",
            setting_name=setting.name if setting else "N/A",
            setting_description=setting.description if setting else "N/A",
            setting_details=format_details(setting.details) if setting else "N/A",
            event_name=event.name if event else "N/A",
            event_description=event.description if event else "N/A",
            event_details=format_details(event.details) if event else "N/A",
            relic_name=relic.name if relic else "N/A",
            relic_description=relic.description if relic else "N/A",
            relic_details=format_details(relic.details) if relic else "N/A",
        )

        full_story_raw = await ask_openrouter(full_story_prompt, max_tokens=500)
        full_story_content = clean_ai_text(full_story_raw)

        # Quest title prompt
        quest_title_prompt = load_prompt(
            "full_story/quest_title.txt",
            theme=theme,
            story_content=full_story_content,
        )

        quest_title_raw = await ask_openrouter(quest_title_prompt, max_tokens=50)
        quest_title = clean_ai_text(quest_title_raw)

        # Quest description prompt
        quest_description_prompt = load_prompt(
            "full_story/quest_description.txt",
            theme=theme,
            story_content=full_story_content,
            quest_title=quest_title,
        )
        quest_description_raw = await ask_openrouter(
            quest_description_prompt, max_tokens=150
        )
        quest_description = clean_ai_text(quest_description_raw)

        return FullStory(
            title="Full Story",
            content=full_story_content,
            theme=theme,
            pieces=selected_pieces,
            quest={"title": quest_title, "description": quest_description},
        )

    except Exception as e:
        logger.error(f"Failed to generate full story: {e}", exc_info=True)
        raise FullStoryGenerationError(f"Full story generation failed: {str(e)}")
