from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langfuse import observe

from constants.themes import Theme
from generate.models.full_story import FullStory
from generate.models.selected_lore_pieces import SelectedLorePieces
from services.llm_client import (
    get_llm,
    increment_success_counter,
    increment_failure_counter,
)
from utils.format_text import clean_ai_text, format_details
from utils.logger import logger
from exceptions.generation import FullStoryGenerationError


@observe()
async def generate_full_story(
    selected_pieces: SelectedLorePieces, theme: Theme
) -> FullStory:
    """
    Generate a full story based on the selected lore pieces and theme.

    Parameters:
    - selected_pieces: SelectedLorePieces containing the selected lore pieces (character, faction, setting, event, relic).
    - theme: The theme for the story generation.

    Returns:
    A FullStory containing the generated story, selected pieces, quest title, and quest description.
    """
    try:
        # Load shared theme references
        with open("generate/prompts/shared/theme_references.txt", "r") as f:
            theme_references = f.read()

        character = selected_pieces.character
        faction = selected_pieces.faction
        setting = selected_pieces.setting
        event = selected_pieces.event
        relic = selected_pieces.relic

        # Generate Full Story
        with open("generate/prompts/full_story/full_story.txt", "r") as f:
            full_story_prompt_text = f.read()

        full_story_prompt = PromptTemplate.from_template(full_story_prompt_text)
        full_story_llm = get_llm(max_tokens=500)
        full_story_chain = full_story_prompt | full_story_llm | StrOutputParser()

        full_story_raw = await full_story_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "character_name": character.name if character else "N/A",
                "character_description": character.description if character else "N/A",
                "character_details": format_details(character.details)
                if character
                else "N/A",
                "faction_name": faction.name if faction else "N/A",
                "faction_description": faction.description if faction else "N/A",
                "faction_details": format_details(faction.details)
                if faction
                else "N/A",
                "setting_name": setting.name if setting else "N/A",
                "setting_description": setting.description if setting else "N/A",
                "setting_details": format_details(setting.details)
                if setting
                else "N/A",
                "event_name": event.name if event else "N/A",
                "event_description": event.description if event else "N/A",
                "event_details": format_details(event.details) if event else "N/A",
                "relic_name": relic.name if relic else "N/A",
                "relic_description": relic.description if relic else "N/A",
                "relic_details": format_details(relic.details) if relic else "N/A",
            }
        )
        full_story_content = clean_ai_text(full_story_raw)
        logger.info("Generated full story content")

        # Generate Quest Title
        with open("generate/prompts/full_story/quest_title.txt", "r") as f:
            quest_title_prompt_text = f.read()

        quest_title_prompt = PromptTemplate.from_template(quest_title_prompt_text)
        quest_title_llm = get_llm(max_tokens=50)
        quest_title_chain = quest_title_prompt | quest_title_llm | StrOutputParser()

        quest_title_raw = await quest_title_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "story_content": full_story_content,
            }
        )
        quest_title = clean_ai_text(quest_title_raw)
        logger.info(f"Generated quest title: {quest_title}")

        # Generate Quest Description
        with open("generate/prompts/full_story/quest_description.txt", "r") as f:
            quest_description_prompt_text = f.read()

        quest_description_prompt = PromptTemplate.from_template(
            quest_description_prompt_text
        )
        quest_description_llm = get_llm(max_tokens=150)
        quest_description_chain = (
            quest_description_prompt | quest_description_llm | StrOutputParser()
        )

        quest_description_raw = await quest_description_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "story_content": full_story_content,
                "quest_title": quest_title,
            }
        )
        quest_description = clean_ai_text(quest_description_raw)
        logger.info("Generated quest description")

        increment_success_counter()
        logger.info("Successfully generated full story with quest")

        return FullStory(
            content=full_story_content,
            theme=theme,
            pieces=selected_pieces,
            quest={"title": quest_title, "description": quest_description},
        )

    except Exception as e:
        error_type = type(e).__name__
        increment_failure_counter(error_type=error_type)
        logger.error(f"Failed to generate full story: {e}", exc_info=True)
        raise FullStoryGenerationError(f"Full story generation failed: {str(e)}")
