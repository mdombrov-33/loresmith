from constants.themes import Theme
from models.full_story import FullStory
from models.selected_lore_pieces import SelectedLorePieces
from services.openrouter_client import ask_openrouter_with_retries as ask_openrouter
from utils.text_formatting import clean_ai_text, format_details
from utils.load_prompt_from_file import load_prompt

from utils.logger import logger
from utils.exceptions.generation import FullStoryGenerationError


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

        JSON Body example:
        {
      "character": {
        "name": "Echo",
        "description": "A skilled scavenger navigating the ruins of a fallen city.",
        "details": {
          "personality": "Cautious, intelligent, burdened by the past",
          "appearance": "Dust-covered cloak, reflective goggles, scavenged tech gear"
        },
        "type": "character"
      },
      "faction": {
        "name": "Steel Reclaimers",
        "description": "A militant faction obsessed with recovering pre-war technology.",
        "details": {
          "ideology": "Technology must be controlled to enforce order",
          "appearance": "Armored uniforms, metallic insignia, glowing visors"
        },
        "type": "faction"
      },
      "setting": {
        "name": "Ashfall City",
        "description": "A ruined megacity buried in ash and fog.",
        "details": {
          "landscape": "Collapsed skyscrapers, toxic rivers, ash storms",
          "dangers": "Radioactive zones, rogue drones, scavenger gangs"
        },
        "type": "setting"
      },
      "event": {
        "name": "The Collapse",
        "description": "The catastrophic shutdown of global power grids that marked the end of the old world.",
        "details": {
          "impact": "Plunged the world into chaos and birthed new powers"
        },
        "type": "event"
      },
      "relic": {
        "name": "The Pathseeker Map",
        "description": "A shimmering, semi-holographic map once used for space exploration.",
        "details": {
          "history": "Said to hold data that could restart civilization",
          "appearance": "Translucent surface, faint glowing constellations"
        },
        "type": "relic"
      }
    }
    """
    try:
        # Extract each piece from the selected_pieces dictionary, fallback to dummy data
        character = selected_pieces.character
        faction = selected_pieces.faction
        setting = selected_pieces.setting
        event = selected_pieces.event
        relic = selected_pieces.relic

        prompt = load_prompt(
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
        raise FullStoryGenerationError(str(e))
