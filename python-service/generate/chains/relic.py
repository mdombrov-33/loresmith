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
from exceptions.generation import RelicGenerationError

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


@observe()
async def generate_relic(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a relic/artifact by prompting for:
    name, description, and history.
    Theme controls the genre/world setting.
    """
    try:
        # Generate Name
        with open("generate/prompts/relic/relic_name.txt", "r") as f:
            name_prompt_text = f.read()

        name_prompt = PromptTemplate.from_template(name_prompt_text)
        name_llm = get_llm(max_tokens=50)
        name_chain = name_prompt | name_llm | StrOutputParser()
        name_raw = await name_chain.ainvoke(
            {"theme": theme, "blacklist": blacklist_str}
        )
        name = clean_ai_text(name_raw)
        logger.info(f"Generated relic name: {name}")

        # Generate Description
        with open("generate/prompts/relic/relic_description.txt", "r") as f:
            description_prompt_text = f.read()

        description_prompt = PromptTemplate.from_template(description_prompt_text)
        description_llm = get_llm(max_tokens=150)
        description_chain = description_prompt | description_llm | StrOutputParser()
        description_raw = await description_chain.ainvoke(
            {"theme": theme, "name": name}
        )
        description = clean_ai_text(description_raw)
        logger.info(f"Generated description for {name}")

        # Generate History
        with open("generate/prompts/relic/relic_history.txt", "r") as f:
            history_prompt_text = f.read()

        history_prompt = PromptTemplate.from_template(history_prompt_text)
        history_llm = get_llm(max_tokens=150)
        history_chain = history_prompt | history_llm | StrOutputParser()
        history_raw = await history_chain.ainvoke(
            {
                "theme": theme,
                "name": name,
                "description": description,
            }
        )
        history = clean_ai_text(history_raw)
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

    details: dict[str, Union[str, str]] = {"history": history}

    return LorePiece(
        name=name,
        description=description,
        details=details,
        type="relic",
    )
