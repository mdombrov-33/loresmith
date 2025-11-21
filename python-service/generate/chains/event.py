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
from exceptions.generation import EventGenerationError

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


@observe()
async def generate_event(
    theme: str = "post-apocalyptic", setting: LorePiece | None = None
) -> LorePiece:
    try:
        with open("generate/prompts/shared/theme_references.txt", "r") as f:
            theme_references = f.read()

        setting_context = ""
        if setting:
            setting_context = f"This event occurs at or involves this location:\nLocation: {setting.name}\nDescription: {setting.description}\n\nNaturally weave this location into the event description."

        # Generate Name
        with open("generate/prompts/event/event_name.txt", "r") as f:
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
        logger.info(f"Generated event name: {name}")

        # Generate Description
        with open("generate/prompts/event/event_description.txt", "r") as f:
            description_prompt_text = f.read()

        description_prompt = PromptTemplate.from_template(description_prompt_text)
        description_llm = get_llm(max_tokens=200)
        description_chain = description_prompt | description_llm | StrOutputParser()
        description_raw = await description_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
                "setting_context": setting_context,
            }
        )
        description = clean_ai_text(description_raw)
        logger.info(f"Generated description for {name}")

        # Generate Impact
        with open("generate/prompts/event/event_impact.txt", "r") as f:
            impact_prompt_text = f.read()

        impact_prompt = PromptTemplate.from_template(impact_prompt_text)
        impact_llm = get_llm(max_tokens=150)
        impact_chain = impact_prompt | impact_llm | StrOutputParser()
        impact_raw = await impact_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
                "description": description,
            }
        )
        impact = clean_ai_text(impact_raw)
        logger.info(f"Generated impact for {name}")

        increment_success_counter()
        logger.info(f"Successfully generated event: {name}")

    except Exception as e:
        error_type = type(e).__name__
        increment_failure_counter(error_type=error_type)
        logger.error(f"Failed to generate event: {e}", exc_info=True)
        raise EventGenerationError(
            f"Failed to generate event for theme {theme}: {str(e)}"
        )

    details: dict[str, str | str] = {"impact": impact}

    return LorePiece(
        name=name,
        description=description,
        details=details,
        type="event",
    )
