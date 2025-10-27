import re
from typing import Union

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langfuse import observe

from utils.blacklist import BLACKLIST
from utils.logger import logger
from models.lore_piece import LorePiece
from services.llm_client import (
    get_llm,
    increment_success_counter,
    increment_failure_counter,
)
from exceptions.generation import CharacterGenerationError
from utils.format_text import clean_ai_text

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


@observe()
async def generate_character(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a character by prompting for:
    name, personality traits, appearance traits, backstory, skills, and stats.
    The generation is adapted to the provided theme.
    """

    try:
        # Generate Name
        with open("prompts/character/character_name.txt", "r") as f:
            name_prompt_text = f.read()

        name_prompt = PromptTemplate.from_template(name_prompt_text)
        name_llm = get_llm(max_tokens=50)
        name_chain = name_prompt | name_llm | StrOutputParser()
        name_raw = await name_chain.ainvoke(
            {
                "theme": theme,
                "blacklist": blacklist_str,
            }
        )
        name = clean_ai_text(name_raw)
        logger.info(f"Generated character name: {name}")

        # Generate Appearance
        with open("prompts/character/character_appearance.txt", "r") as f:
            appearance_prompt_text = f.read()

        appearance_prompt = PromptTemplate.from_template(appearance_prompt_text)
        appearance_llm = get_llm(max_tokens=150)
        appearance_chain = appearance_prompt | appearance_llm | StrOutputParser()
        appearance_raw = await appearance_chain.ainvoke(
            {
                "theme": theme,
                "name": name,
            }
        )
        appearance = clean_ai_text(appearance_raw)
        logger.info(f"Generated appearance for {name}")

        # Generate Personality
        with open("prompts/character/character_personality.txt", "r") as f:
            personality_prompt_text = f.read()

        personality_prompt = PromptTemplate.from_template(personality_prompt_text)
        personality_llm = get_llm(max_tokens=70)
        personality_chain = personality_prompt | personality_llm | StrOutputParser()
        personality_raw = await personality_chain.ainvoke(
            {
                "theme": theme,
                "name": name,
                "appearance": appearance,
            }
        )
        personality = clean_ai_text(personality_raw)
        logger.info(f"Generated personality for {name}")

        # Generate Backstory
        with open("prompts/character/character_backstory.txt", "r") as f:
            backstory_prompt_text = f.read()

        backstory_prompt = PromptTemplate.from_template(backstory_prompt_text)
        backstory_llm = get_llm(max_tokens=200)
        backstory_chain = backstory_prompt | backstory_llm | StrOutputParser()
        backstory_raw = await backstory_chain.ainvoke(
            {
                "theme": theme,
                "name": name,
                "personality": personality,
            }
        )
        backstory = clean_ai_text(backstory_raw)
        logger.info(f"Generated backstory for {name}")

        # Generate Skills
        with open("prompts/character/character_skills.txt", "r") as f:
            skills_prompt_text = f.read()

        skills_prompt = PromptTemplate.from_template(skills_prompt_text)
        skills_llm = get_llm(max_tokens=70)
        skills_chain = skills_prompt | skills_llm | StrOutputParser()
        skills_raw = await skills_chain.ainvoke(
            {
                "theme": theme,
                "name": name,
                "personality": personality,
                "appearance": appearance,
            }
        )
        skills = clean_ai_text(skills_raw)
        logger.info(f"Generated skills for {name}")

        # Generate Flaw
        with open("prompts/character/character_flaw.txt", "r") as f:
            flaw_prompt_text = f.read()

        flaw_prompt = PromptTemplate.from_template(flaw_prompt_text)
        flaw_llm = get_llm(max_tokens=50)
        flaw_chain = flaw_prompt | flaw_llm | StrOutputParser()
        flaw_raw = await flaw_chain.ainvoke(
            {
                "theme": theme,
                "name": name,
                "personality": personality,
                "description": backstory,
            }
        )
        flaw = clean_ai_text(flaw_raw)
        logger.info(f"Generated flaw for {name}")

        # Generate Stats
        with open("prompts/character/character_stats.txt", "r") as f:
            stats_prompt_text = f.read()

        stats_prompt = PromptTemplate.from_template(stats_prompt_text)
        stats_llm = get_llm(max_tokens=70)
        stats_chain = stats_prompt | stats_llm | StrOutputParser()
        stats_raw = await stats_chain.ainvoke(
            {
                "theme": theme,
                "name": name,
                "personality": personality,
                "appearance": appearance,
                "description": backstory,
                "skills": skills,
            }
        )
        stats = clean_ai_text(stats_raw)
        logger.info(f"Generated stats for {name}")

        # Parse Stats
        health = 100
        stress = 0
        lore_mastery = 10
        empathy = 10
        resilience = 10
        creativity = 10
        influence = 10
        perception = 10

        health_match = re.search(r"health[:\s]*(\d+)", stats, re.IGNORECASE)
        if health_match:
            try:
                health = int(health_match.group(1))
                health = max(50, min(150, health))
            except Exception as e:
                logger.warning(f"Failed to parse health: {e}")

        stress_match = re.search(r"stress[:\s]*(\d+)", stats, re.IGNORECASE)
        if stress_match:
            try:
                stress = int(stress_match.group(1))
                stress = max(0, min(50, stress))
            except Exception as e:
                logger.warning(f"Failed to parse stress: {e}")

        lore_mastery_match = re.search(r"lore_mastery[:\s]*(\d+)", stats, re.IGNORECASE)
        if lore_mastery_match:
            try:
                lore_mastery = int(lore_mastery_match.group(1))
                lore_mastery = max(8, min(18, lore_mastery))
            except Exception as e:
                logger.warning(f"Failed to parse lore_mastery: {e}")

        empathy_match = re.search(r"empathy[:\s]*(\d+)", stats, re.IGNORECASE)
        if empathy_match:
            try:
                empathy = int(empathy_match.group(1))
                empathy = max(8, min(18, empathy))
            except Exception as e:
                logger.warning(f"Failed to parse empathy: {e}")

        resilience_match = re.search(r"resilience[:\s]*(\d+)", stats, re.IGNORECASE)
        if resilience_match:
            try:
                resilience = int(resilience_match.group(1))
                resilience = max(8, min(18, resilience))
            except Exception as e:
                logger.warning(f"Failed to parse resilience: {e}")

        creativity_match = re.search(r"creativity[:\s]*(\d+)", stats, re.IGNORECASE)
        if creativity_match:
            try:
                creativity = int(creativity_match.group(1))
                creativity = max(8, min(18, creativity))
            except Exception as e:
                logger.warning(f"Failed to parse creativity: {e}")

        influence_match = re.search(r"influence[:\s]*(\d+)", stats, re.IGNORECASE)
        if influence_match:
            try:
                influence = int(influence_match.group(1))
                influence = max(8, min(18, influence))
            except Exception as e:
                logger.warning(f"Failed to parse influence: {e}")

        perception_match = re.search(r"perception[:\s]*(\d+)", stats, re.IGNORECASE)
        if perception_match:
            try:
                perception = int(perception_match.group(1))
                perception = max(8, min(18, perception))
            except Exception as e:
                logger.warning(f"Failed to parse perception: {e}")

        # Increment Success Counter
        # All 6 steps completed successfully, track metrics
        increment_success_counter()
        logger.info(f"Successfully generated complete character: {name}")

    except Exception as e:
        # Increment Failure Counter
        error_type = type(e).__name__
        increment_failure_counter(error_type=error_type)
        logger.error(f"Character generation error: {e}", exc_info=True)
        raise CharacterGenerationError(
            f"Failed to generate character for theme {theme}: {str(e)}"
        )

    details: dict[str, Union[str, str]] = {
        "personality": personality,
        "appearance": appearance,
        "flaw": flaw,
        "health": str(health),
        "stress": str(stress),
        "lore_mastery": str(lore_mastery),
        "empathy": str(empathy),
        "resilience": str(resilience),
        "creativity": str(creativity),
        "influence": str(influence),
        "perception": str(perception),
        "skills": skills,
    }

    return LorePiece(
        name=name,
        description=backstory,
        details=details,
        type="character",
    )
