import json
from typing import Any
import re

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
from generate.traits import (
    PersonalityTrait,
    get_trait_list_for_prompt,
    get_all_trait_names,
    validate_trait_selection,
)
from services.image_gen.generator import generate_character_images

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

        # Generate Backstory (moved before traits so traits can reference backstory)
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
                "appearance": appearance,
            }
        )
        backstory = clean_ai_text(backstory_raw)
        logger.info(f"Generated backstory for {name}")

        # Generate Personality Traits (using new trait system)
        with open("generate/prompts/character/character_traits.txt", "r") as f:
            traits_prompt_text = f.read()

        traits_prompt = PromptTemplate.from_template(traits_prompt_text)
        traits_llm = get_llm(max_tokens=50)
        traits_chain = traits_prompt | traits_llm | StrOutputParser()

        # Get the formatted trait list for the prompt
        trait_list = get_trait_list_for_prompt()

        traits_raw = await traits_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
                "appearance": appearance,
                "backstory": backstory,
                "trait_list": trait_list,
            }
        )
        traits_text = clean_ai_text(traits_raw)

        # Parse and validate traits
        personality_traits = []
        try:
            # Clean up common LLM mistakes - be VERY aggressive
            logger.debug(f"Raw traits text: {traits_text}")

            # Remove surrounding quotes
            traits_text = traits_text.strip('"').strip("'")

            # Remove everything after first period or dash (explanations)
            if "." in traits_text:
                traits_text = traits_text.split(".")[0].strip()
            if " - " in traits_text:
                traits_text = traits_text.split(" - ")[0].strip()

            # If there's a colon, take everything AFTER the last colon
            # Handles: "I have selected: Trait1, Trait2, Trait3"
            if ":" in traits_text:
                traits_text = traits_text.split(":")[-1].strip()

            # Remove common prefixes (after colon removal)
            prefixes_to_remove = [
                "I choose ",
                "I select ",
                "I have selected ",
                "Here are ",
                "Here's ",
                "The traits are ",
                "These traits are ",
                "Output: ",
                "Based on ",
                "For ",
                "Given ",
                "The ",
                "A possible ",
                "Possible ",
            ]
            for prefix in prefixes_to_remove:
                if traits_text.lower().startswith(prefix.lower()):
                    traits_text = traits_text[len(prefix) :].strip()

            # Remove surrounding quotes again (in case they were after prefix)
            traits_text = traits_text.strip('"').strip("'")

            logger.debug(f"Cleaned traits text: {traits_text}")

            # Parse comma-separated trait names
            trait_names = [t.strip() for t in traits_text.split(",")]
            all_valid_traits = get_all_trait_names()

            # Convert to PersonalityTrait enum values
            for trait_name in trait_names:
                # Only take the first word if there's extra text after the trait name
                first_word = trait_name.split()[0] if trait_name else ""

                if trait_name in all_valid_traits:
                    personality_traits.append(PersonalityTrait(trait_name))
                elif first_word in all_valid_traits:
                    # Try first word if full string didn't match
                    personality_traits.append(PersonalityTrait(first_word))
                    logger.warning(
                        f"Extracted trait '{first_word}' from malformed '{trait_name}'"
                    )
                else:
                    logger.warning(
                        f"Invalid trait '{trait_name}' generated, will use fallback"
                    )

            # Validate we have exactly 3 compatible traits
            if len(personality_traits) != 3:
                raise ValueError(f"Expected 3 traits, got {len(personality_traits)}")

            if not validate_trait_selection(personality_traits):
                raise ValueError("Traits contain contradictions")

            logger.info(
                f"Generated traits for {name}: {[t.value for t in personality_traits]}"
            )

        except (ValueError, KeyError) as e:
            logger.warning(f"Failed to parse traits: {e}. Using theme-based fallback.")
            # Theme-based fallback traits
            theme_fallbacks = {
                "post-apocalyptic": [
                    PersonalityTrait.CAUTIOUS,
                    PersonalityTrait.PRAGMATIC,
                    PersonalityTrait.STOIC,
                ],
                "fantasy": [
                    PersonalityTrait.BRAVE,
                    PersonalityTrait.HONORABLE,
                    PersonalityTrait.CURIOUS,
                ],
                "cyberpunk": [
                    PersonalityTrait.CYNICAL,
                    PersonalityTrait.ANALYTICAL,
                    PersonalityTrait.REBELLIOUS,
                ],
                "norse-mythology": [
                    PersonalityTrait.FEARLESS,
                    PersonalityTrait.HONORABLE,
                    PersonalityTrait.COMPETITIVE,
                ],
                "steampunk": [
                    PersonalityTrait.CREATIVE,
                    PersonalityTrait.METHODICAL,
                    PersonalityTrait.AMBITIOUS,
                ],
            }
            personality_traits = theme_fallbacks.get(
                theme.lower(),
                [
                    PersonalityTrait.ADAPTABLE,
                    PersonalityTrait.PERCEPTIVE,
                    PersonalityTrait.HONEST,
                ],
            )

        # Convert traits to list of strings for storage
        traits_list = [trait.value for trait in personality_traits]

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
                "personality": ", ".join(
                    traits_list
                ),  # Pass traits as comma-separated string
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
                "personality": ", ".join(
                    traits_list
                ),  # Pass traits as comma-separated string
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
                "personality": ", ".join(
                    traits_list
                ),  # Pass traits as comma-separated string
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

        # Generate Character Images
        # Use sanitized name as ID since database ID doesn't exist yet
        character_id = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")

        image_data = await generate_character_images(
            name=name,
            appearance=appearance,
            theme=theme,
            world_id=0,  # Temp value, images will be in /generated/0/ directory
            character_id=character_id,
            traits=traits_list,  # Pass personality traits
            skills=skills_array,  # Pass skills for visual elements
        )

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
        "traits": traits_list,
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

    # Only add image field if it has a valid value (not None)
    if image_data.get("image_portrait"):
        details["image_portrait"] = image_data["image_portrait"]

    return LorePiece(
        name=name,
        description=backstory,
        details=details,
        type="character",
    )
