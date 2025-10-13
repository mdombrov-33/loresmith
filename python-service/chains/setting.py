from typing import Union

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from models.lore_piece import LorePiece
from services.llm_client import (
    get_llm,
    increment_success_counter,
    increment_failure_counter,
)
from utils.blacklist import BLACKLIST
from utils.format_text import clean_ai_text
from utils.logger import logger
from exceptions.generation import SettingGenerationError

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


async def generate_setting(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a setting by prompting for:
    name, landscape description, dangers, and summary.
    Theme controls the genre/world setting.
    """
    try:
        # Generate Name
        with open("prompts/setting/setting_name.txt", "r") as f:
            name_prompt_text = f.read()

        name_prompt = PromptTemplate.from_template(name_prompt_text)
        name_llm = get_llm(max_tokens=50)
        name_chain = name_prompt | name_llm | StrOutputParser()
        name_raw = await name_chain.ainvoke(
            {"theme": theme, "blacklist": blacklist_str}
        )
        name = clean_ai_text(name_raw)
        logger.info(f"Generated setting name: {name}")

        # Generate Landscape
        with open("prompts/setting/setting_landscape.txt", "r") as f:
            landscape_prompt_text = f.read()

        landscape_prompt = PromptTemplate.from_template(landscape_prompt_text)
        landscape_llm = get_llm(max_tokens=150)
        landscape_chain = landscape_prompt | landscape_llm | StrOutputParser()
        landscape_raw = await landscape_chain.ainvoke({"theme": theme, "name": name})
        landscape = clean_ai_text(landscape_raw)
        logger.info(f"Generated landscape for {name}")

        # Generate Dangers
        with open("prompts/setting/setting_dangers.txt", "r") as f:
            dangers_prompt_text = f.read()

        dangers_prompt = PromptTemplate.from_template(dangers_prompt_text)
        dangers_llm = get_llm(max_tokens=150)
        dangers_chain = dangers_prompt | dangers_llm | StrOutputParser()
        dangers_raw = await dangers_chain.ainvoke(
            {
                "theme": theme,
                "name": name,
                "landscape": landscape,
            }
        )
        dangers = clean_ai_text(dangers_raw)
        logger.info(f"Generated dangers for {name}")

        # Generate Summary
        with open("prompts/setting/setting_summary.txt", "r") as f:
            summary_prompt_text = f.read()

        summary_prompt = PromptTemplate.from_template(summary_prompt_text)
        summary_llm = get_llm(max_tokens=200)
        summary_chain = summary_prompt | summary_llm | StrOutputParser()
        summary_raw = await summary_chain.ainvoke(
            {
                "theme": theme,
                "name": name,
                "landscape": landscape,
                "dangers": dangers,
            }
        )
        summary = clean_ai_text(summary_raw)
        logger.info(f"Generated summary for {name}")

        increment_success_counter()
        logger.info(f"Successfully generated setting: {name}")

    except Exception as e:
        error_type = type(e).__name__
        increment_failure_counter(error_type=error_type)
        logger.error(f"Setting generation error: {e}", exc_info=True)
        raise SettingGenerationError(
            f"Failed to generate setting for theme {theme}: {str(e)}"
        )

    details: dict[str, Union[str, str]] = {
        "landscape": landscape,
        "dangers": dangers,
    }

    return LorePiece(
        name=name,
        description=summary,
        details=details,
        type="setting",
    )
