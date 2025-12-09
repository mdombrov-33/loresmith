from typing import cast

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langfuse import observe

from generate.models.lore_piece import LorePiece
from generate.models.structured_llm_output.faction_schema import (
    FactionIdeology,
    FactionAppearance,
    FactionSummary,
)
from services.llm_client import (
    get_llm,
    increment_success_counter,
    increment_failure_counter,
)
from utils.blacklist import BLACKLIST
from utils.format_text import clean_ai_text
from utils.logger import logger
from exceptions.generation import FactionGenerationError

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


@observe()
async def generate_faction(theme: str = "post-apocalyptic", progress_callback=None) -> LorePiece:
    """
    Generate a faction by prompting for:
    name, ideology, appearance, and summary.
    Theme controls the genre/world setting.

    Args:
        theme: Theme for generation
        progress_callback: Optional async callback(step, total_steps, message) for progress tracking
    """
    try:
        total_steps = 4  # name, ideology, appearance, summary
        current_step = 0

        # Load shared theme references
        with open("generate/prompts/shared/theme_references.txt", "r") as f:
            theme_references = f.read()

        # Generate Name
        with open("generate/prompts/faction/faction_name.txt", "r") as f:
            name_prompt_text = f.read()

        name_prompt = PromptTemplate.from_template(name_prompt_text)
        name_llm = get_llm(max_tokens=50)
        name_chain = name_prompt | name_llm | StrOutputParser()
        name_raw = await name_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "blacklist": blacklist_str,
            }
        )
        name = clean_ai_text(name_raw)
        logger.info(f"Generated faction name: {name}")

        current_step += 1
        if progress_callback:
            await progress_callback(current_step, total_steps, "Generated names...")

        # Generate Ideology
        with open("generate/prompts/faction/faction_ideology.txt", "r") as f:
            ideology_prompt_text = f.read()

        ideology_prompt = PromptTemplate.from_template(ideology_prompt_text)
        ideology_llm = get_llm(max_tokens=100).with_structured_output(FactionIdeology)
        ideology_chain = ideology_prompt | ideology_llm
        ideology_result = cast(
            FactionIdeology,
            await ideology_chain.ainvoke(
                {"theme": theme, "theme_references": theme_references, "name": name}
            ),
        )
        ideology = ideology_result.ideology
        logger.info(f"Generated ideology for {name}")

        current_step += 1
        if progress_callback:
            await progress_callback(current_step, total_steps, "Generated ideologies...")

        # Generate Appearance
        with open("generate/prompts/faction/faction_appearance.txt", "r") as f:
            appearance_prompt_text = f.read()

        appearance_prompt = PromptTemplate.from_template(appearance_prompt_text)
        appearance_llm = get_llm(max_tokens=150).with_structured_output(
            FactionAppearance
        )
        appearance_chain = appearance_prompt | appearance_llm
        appearance_result = cast(
            FactionAppearance,
            await appearance_chain.ainvoke(
                {
                    "theme": theme,
                    "theme_references": theme_references,
                    "name": name,
                    "ideology": ideology,
                }
            ),
        )
        appearance = appearance_result.appearance
        logger.info(f"Generated appearance for {name}")

        current_step += 1
        if progress_callback:
            await progress_callback(current_step, total_steps, "Generated appearances...")

        # Generate Summary
        with open("generate/prompts/faction/faction_summary.txt", "r") as f:
            summary_prompt_text = f.read()

        summary_prompt = PromptTemplate.from_template(summary_prompt_text)
        summary_llm = get_llm(max_tokens=200).with_structured_output(FactionSummary)
        summary_chain = summary_prompt | summary_llm
        summary_result = cast(
            FactionSummary,
            await summary_chain.ainvoke(
                {
                    "theme": theme,
                    "theme_references": theme_references,
                    "name": name,
                    "ideology": ideology,
                    "appearance": appearance,
                }
            ),
        )
        summary = summary_result.summary
        logger.info(f"Generated summary for {name}")

        current_step += 1
        if progress_callback:
            await progress_callback(current_step, total_steps, "Generated summaries...")

        increment_success_counter()
        logger.info(f"Successfully generated faction: {name}")

    except Exception as e:
        error_type = type(e).__name__
        increment_failure_counter(error_type=error_type)
        logger.error(f"Faction generation error: {e}", exc_info=True)
        raise FactionGenerationError(
            f"Failed to generate faction for theme {theme}: {str(e)}"
        )

    details: dict[str, str] = {
        "ideology": ideology,
        "appearance": appearance,
    }

    return LorePiece(
        name=name,
        description=summary,
        details=details,
        type="faction",
    )
