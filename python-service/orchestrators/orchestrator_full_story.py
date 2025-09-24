from utils.logger import logger
from models.full_story import FullStory
from models.selected_lore_pieces import SelectedLorePieces
from constants.themes import Theme
from chains.full_story import generate_full_story
from exceptions.generation import FullStoryGenerationError


async def generate_full_story_orchestrator(
    selected_pieces: SelectedLorePieces, theme: Theme
) -> FullStory:
    try:
        full_story = await generate_full_story(selected_pieces, theme)
        return full_story
    except Exception as e:
        logger.error(f"Error generating full story: {e}", exc_info=True)
        raise FullStoryGenerationError(f"Full story generation failed: {str(e)}")
