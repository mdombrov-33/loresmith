from typing import Union

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langfuse import observe

from generate.models.lore_piece import LorePiece
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
async def generate_faction(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a faction by prompting for:
    name, ideology, appearance, and summary.
    Theme controls the genre/world setting.
    """
    try:
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
            {"theme": theme, "theme_references": theme_references, "blacklist": blacklist_str}
        )
        name = clean_ai_text(name_raw)
        logger.info(f"Generated faction name: {name}")

        # Generate Ideology
        with open("generate/prompts/faction/faction_ideology.txt", "r") as f:
            ideology_prompt_text = f.read()

        ideology_prompt = PromptTemplate.from_template(ideology_prompt_text)
        ideology_llm = get_llm(max_tokens=100)
        ideology_chain = ideology_prompt | ideology_llm | StrOutputParser()
        ideology_raw = await ideology_chain.ainvoke({"theme": theme, "theme_references": theme_references, "name": name})
        ideology = clean_ai_text(ideology_raw)
        logger.info(f"Generated ideology for {name}")

        # Generate Appearance
        with open("generate/prompts/faction/faction_appearance.txt", "r") as f:
            appearance_prompt_text = f.read()

        appearance_prompt = PromptTemplate.from_template(appearance_prompt_text)
        appearance_llm = get_llm(max_tokens=150)
        appearance_chain = appearance_prompt | appearance_llm | StrOutputParser()
        appearance_raw = await appearance_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
                "ideology": ideology,
            }
        )
        appearance = clean_ai_text(appearance_raw)
        logger.info(f"Generated appearance for {name}")

        # Generate Summary
        with open("generate/prompts/faction/faction_summary.txt", "r") as f:
            summary_prompt_text = f.read()

        summary_prompt = PromptTemplate.from_template(summary_prompt_text)
        summary_llm = get_llm(max_tokens=200)
        summary_chain = summary_prompt | summary_llm | StrOutputParser()
        summary_raw = await summary_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
                "ideology": ideology,
                "appearance": appearance,
            }
        )
        summary = clean_ai_text(summary_raw)
        logger.info(f"Generated summary for {name}")

        increment_success_counter()
        logger.info(f"Successfully generated faction: {name}")

    except Exception as e:
        error_type = type(e).__name__
        increment_failure_counter(error_type=error_type)
        logger.error(f"Faction generation error: {e}", exc_info=True)
        raise FactionGenerationError(
            f"Failed to generate faction for theme {theme}: {str(e)}"
        )

    details: dict[str, Union[str, str]] = {
        "ideology": ideology,
        "appearance": appearance,
    }

    return LorePiece(
        name=name,
        description=summary,
        details=details,
        type="faction",
    )
