from typing import cast

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langfuse import observe

from generate.models.lore_piece import LorePiece
from generate.models.structured_llm_output.relic_schema import (
    RelicDescription,
    RelicHistory,
)
from services.llm_client import (
    get_llm,
    increment_success_counter,
    increment_failure_counter,
)
from utils.blacklist import BLACKLIST
from utils.format_text import clean_ai_text
from utils.logger import logger
from exceptions.generation import RelicGenerationError

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


@observe()
async def generate_relic(
    theme: str = "post-apocalyptic",
    setting: LorePiece | None = None,
    event: LorePiece | None = None,
) -> LorePiece:
    try:
        with open("generate/prompts/shared/theme_references.txt", "r") as f:
            theme_references = f.read()

        lore_context = ""
        if setting and event:
            lore_context = f"This relic is connected to:\nLocation: {setting.name} - {setting.description}\nEvent: {event.name} - {event.description}\n\nNaturally reference this location and/or event in the relic's description."
        elif setting:
            lore_context = f"This relic is found at:\nLocation: {setting.name} - {setting.description}\n\nNaturally reference this location in the relic's description."
        elif event:
            lore_context = f"This relic is connected to:\nEvent: {event.name} - {event.description}\n\nNaturally reference this event in the relic's description."

        # Generate Name
        with open("generate/prompts/relic/relic_name.txt", "r") as f:
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
        logger.info(f"Generated relic name: {name}")

        # Generate Description
        with open("generate/prompts/relic/relic_description.txt", "r") as f:
            description_prompt_text = f.read()

        description_prompt = PromptTemplate.from_template(description_prompt_text)
        description_llm = get_llm(max_tokens=150).with_structured_output(RelicDescription)
        description_chain = description_prompt | description_llm
        description_result = cast(
            RelicDescription,
            await description_chain.ainvoke(
                {
                    "theme": theme,
                    "theme_references": theme_references,
                    "name": name,
                    "lore_context": lore_context,
                }
            )
        )
        description = description_result.description
        logger.info(f"Generated description for {name}")

        # Generate History
        with open("generate/prompts/relic/relic_history.txt", "r") as f:
            history_prompt_text = f.read()

        history_prompt = PromptTemplate.from_template(history_prompt_text)
        history_llm = get_llm(max_tokens=150).with_structured_output(RelicHistory)
        history_chain = history_prompt | history_llm
        history_result = cast(
            RelicHistory,
            await history_chain.ainvoke(
                {
                    "theme": theme,
                    "theme_references": theme_references,
                    "name": name,
                    "description": description,
                }
            )
        )
        history = history_result.history
        logger.info(f"Generated history for {name}")

        increment_success_counter()
        logger.info(f"Successfully generated relic: {name}")

    except Exception as e:
        error_type = type(e).__name__
        increment_failure_counter(error_type=error_type)
        logger.error(f"Relic generation error: {e}", exc_info=True)
        raise RelicGenerationError(
            f"Failed to generate relic for theme {theme}: {str(e)}"
        )

    details: dict[str, str | str] = {"history": history}

    return LorePiece(
        name=name,
        description=description,
        details=details,
        type="relic",
    )
