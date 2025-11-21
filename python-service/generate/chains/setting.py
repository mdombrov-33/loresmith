from typing import cast

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langfuse import observe

from generate.models.lore_piece import LorePiece
from generate.models.structured_llm_output.setting_schema import (
    SettingLandscape,
    SettingCulture,
    SettingHistory,
    SettingEconomy,
    SettingSummary,
)
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


@observe()
async def generate_setting(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a comprehensive setting by prompting for:
    name, landscape, culture, history, economy, and summary.
    Theme controls the genre/world setting.
    """
    try:
        # Load shared theme references
        with open("generate/prompts/shared/theme_references.txt", "r") as f:
            theme_references = f.read()

        # Generate Name
        with open("generate/prompts/setting/setting_name.txt", "r") as f:
            name_prompt_text = f.read()

        name_prompt = PromptTemplate.from_template(name_prompt_text)
        name_llm = get_llm(max_tokens=50)
        name_chain = name_prompt | name_llm | StrOutputParser()
        name_raw = await name_chain.ainvoke(
            {"theme": theme, "theme_references": theme_references, "blacklist": blacklist_str}
        )
        name = clean_ai_text(name_raw)
        logger.info(f"Generated setting name: {name}")

        # Generate Landscape
        with open("generate/prompts/setting/setting_landscape.txt", "r") as f:
            landscape_prompt_text = f.read()

        landscape_prompt = PromptTemplate.from_template(landscape_prompt_text)
        landscape_llm = get_llm(max_tokens=150).with_structured_output(SettingLandscape)
        landscape_chain = landscape_prompt | landscape_llm
        landscape_result = cast(
            SettingLandscape,
            await landscape_chain.ainvoke({"theme": theme, "theme_references": theme_references, "name": name})
        )
        landscape = landscape_result.landscape
        logger.info(f"Generated landscape for {name}")

        # Generate Culture
        with open("generate/prompts/setting/setting_culture.txt", "r") as f:
            culture_prompt_text = f.read()

        culture_prompt = PromptTemplate.from_template(culture_prompt_text)
        culture_llm = get_llm(max_tokens=150).with_structured_output(SettingCulture)
        culture_chain = culture_prompt | culture_llm
        culture_result = cast(
            SettingCulture,
            await culture_chain.ainvoke(
                {
                    "theme": theme,
                    "theme_references": theme_references,
                    "name": name,
                    "landscape": landscape,
                }
            )
        )
        culture = culture_result.culture
        logger.info(f"Generated culture for {name}")

        # Generate History
        with open("generate/prompts/setting/setting_history.txt", "r") as f:
            history_prompt_text = f.read()

        history_prompt = PromptTemplate.from_template(history_prompt_text)
        history_llm = get_llm(max_tokens=150).with_structured_output(SettingHistory)
        history_chain = history_prompt | history_llm
        history_result = cast(
            SettingHistory,
            await history_chain.ainvoke(
                {
                    "theme": theme,
                    "theme_references": theme_references,
                    "name": name,
                    "landscape": landscape,
                    "culture": culture,
                }
            )
        )
        history = history_result.history
        logger.info(f"Generated history for {name}")

        # Generate Economy
        with open("generate/prompts/setting/setting_economy.txt", "r") as f:
            economy_prompt_text = f.read()

        economy_prompt = PromptTemplate.from_template(economy_prompt_text)
        economy_llm = get_llm(max_tokens=150).with_structured_output(SettingEconomy)
        economy_chain = economy_prompt | economy_llm
        economy_result = cast(
            SettingEconomy,
            await economy_chain.ainvoke(
                {
                    "theme": theme,
                    "theme_references": theme_references,
                    "name": name,
                    "landscape": landscape,
                    "culture": culture,
                    "history": history,
                }
            )
        )
        economy = economy_result.economy
        logger.info(f"Generated economy for {name}")

        # Generate Summary
        with open("generate/prompts/setting/setting_summary.txt", "r") as f:
            summary_prompt_text = f.read()

        summary_prompt = PromptTemplate.from_template(summary_prompt_text)
        summary_llm = get_llm(max_tokens=200).with_structured_output(SettingSummary)
        summary_chain = summary_prompt | summary_llm
        summary_result = cast(
            SettingSummary,
            await summary_chain.ainvoke(
                {
                    "theme": theme,
                    "theme_references": theme_references,
                    "name": name,
                    "landscape": landscape,
                    "culture": culture,
                    "history": history,
                    "economy": economy,
                }
            )
        )
        summary = summary_result.summary
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

    details: dict[str, str] = {
        "landscape": landscape,
        "culture": culture,
        "history": history,
        "economy": economy,
    }

    return LorePiece(
        name=name,
        description=summary,
        details=details,
        type="setting",
    )
