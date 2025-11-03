import json
from typing import Any

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langfuse import observe

from utils.blacklist import BLACKLIST
from utils.logger import logger
from generate.models.lore_piece import LorePiece
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
        # Load shared theme references
        with open("generate/prompts/shared/theme_references.txt", "r") as f:
            theme_references = f.read()

        # Generate Name
        with open("generate/prompts/character/character_name.txt", "r") as f:
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
        logger.info(f"Generated character name: {name}")

        # Generate Appearance
        with open("generate/prompts/character/character_appearance.txt", "r") as f:
            appearance_prompt_text = f.read()

        appearance_prompt = PromptTemplate.from_template(appearance_prompt_text)
        appearance_llm = get_llm(max_tokens=150)
        appearance_chain = appearance_prompt | appearance_llm | StrOutputParser()
        appearance_raw = await appearance_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
            }
        )
        appearance = clean_ai_text(appearance_raw)
        logger.info(f"Generated appearance for {name}")

        # Generate Personality
        with open("generate/prompts/character/character_personality.txt", "r") as f:
            personality_prompt_text = f.read()

        personality_prompt = PromptTemplate.from_template(personality_prompt_text)
        personality_llm = get_llm(max_tokens=70)
        personality_chain = personality_prompt | personality_llm | StrOutputParser()
        personality_raw = await personality_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
                "appearance": appearance,
            }
        )
        personality = clean_ai_text(personality_raw)
        logger.info(f"Generated personality for {name}")

        # Generate Backstory
        with open("generate/prompts/character/character_backstory.txt", "r") as f:
            backstory_prompt_text = f.read()

        backstory_prompt = PromptTemplate.from_template(backstory_prompt_text)
        backstory_llm = get_llm(max_tokens=200)
        backstory_chain = backstory_prompt | backstory_llm | StrOutputParser()
        backstory_raw = await backstory_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
                "personality": personality,
            }
        )
        backstory = clean_ai_text(backstory_raw)
        logger.info(f"Generated backstory for {name}")

        # Generate Skills
        with open("generate/prompts/character/character_skills.txt", "r") as f:
            skills_prompt_text = f.read()

        skills_prompt = PromptTemplate.from_template(skills_prompt_text)
        skills_llm = get_llm(max_tokens=70)
        skills_chain = skills_prompt | skills_llm | StrOutputParser()
        skills_raw = await skills_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
                "personality": personality,
                "appearance": appearance,
            }
        )
        skills_text = clean_ai_text(skills_raw)

        # Parse simple format: "Lockpicking:85, Combat:70, Survival:60"
        skills_array = []
        try:
            for skill_item in skills_text.split(","):
                skill_item = skill_item.strip()
                if ":" in skill_item:
                    parts = skill_item.split(":")
                    skill_name = parts[0].strip()
                    skill_level = int(parts[1].strip())
                    # Clamp level to 1-100
                    skill_level = max(1, min(100, skill_level))
                    skills_array.append({"name": skill_name, "level": skill_level})

            if len(skills_array) == 0:
                raise ValueError("No skills parsed")

            logger.info(f"Parsed {len(skills_array)} skills from simple format")
        except (ValueError, IndexError) as e:
            logger.warning(f"Failed to parse skills: {e}. Using fallback.")
            # Fallback defaults
            skills_array = [
                {"name": "Basic Training", "level": 50},
                {"name": "Survival", "level": 50},
                {"name": "Combat", "level": 50},
            ]

        # Generate Flaw
        with open("generate/prompts/character/character_flaw.txt", "r") as f:
            flaw_prompt_text = f.read()

        flaw_prompt = PromptTemplate.from_template(flaw_prompt_text)
        flaw_llm = get_llm(max_tokens=70)
        flaw_chain = flaw_prompt | flaw_llm | StrOutputParser()
        flaw_raw = await flaw_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
                "personality": personality,
                "description": backstory,
            }
        )
        flaw = clean_ai_text(flaw_raw)
        logger.info(f"Generated flaw for {name}")

        # Generate Stats
        with open("generate/prompts/character/character_stats.txt", "r") as f:
            stats_prompt_text = f.read()

        stats_prompt = PromptTemplate.from_template(stats_prompt_text)
        stats_llm = get_llm(max_tokens=70)
        stats_chain = stats_prompt | stats_llm | StrOutputParser()
        stats_raw = await stats_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
                "personality": personality,
                "appearance": appearance,
                "description": backstory,
                "skills": json.dumps(skills_array),
            }
        )
        stats_text = clean_ai_text(stats_raw)

        # Parse JSON - extract if LLM added extra text
        try:
            # Try to find JSON object in the text
            json_start = stats_text.find("{")
            json_end = stats_text.rfind("}") + 1

            if json_start != -1 and json_end > json_start:
                json_str = stats_text[json_start:json_end]
                stats_json = json.loads(json_str)
            else:
                stats_json = json.loads(stats_text)

            health = max(50, min(150, stats_json.get("health", 100)))
            stress = max(0, min(50, stats_json.get("stress", 0)))
            lore_mastery = max(8, min(18, stats_json.get("lore_mastery", 10)))
            empathy = max(8, min(18, stats_json.get("empathy", 10)))
            resilience = max(8, min(18, stats_json.get("resilience", 10)))
            creativity = max(8, min(18, stats_json.get("creativity", 10)))
            influence = max(8, min(18, stats_json.get("influence", 10)))
            perception = max(8, min(18, stats_json.get("perception", 10)))

            logger.info(f"Parsed stats from JSON: health={health}, stress={stress}")
        except (json.JSONDecodeError, ValueError, TypeError) as e:
            logger.warning(f"Failed to parse stats JSON: {e}. Using defaults.")
            # Fallback defaults
            health = 100
            stress = 0
            lore_mastery = 10
            empathy = 10
            resilience = 10
            creativity = 10
            influence = 10
            perception = 10

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

    details: dict[str, Any] = {
        "personality": personality,
        "appearance": appearance,
        "flaw": flaw,
        "health": health,
        "stress": stress,
        "lore_mastery": lore_mastery,
        "empathy": empathy,
        "resilience": resilience,
        "creativity": creativity,
        "influence": influence,
        "perception": perception,
        "skills": skills_array,
    }

    return LorePiece(
        name=name,
        description=backstory,
        details=details,
        type="character",
    )
