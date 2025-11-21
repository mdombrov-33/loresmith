import json
from typing import Any, cast
import uuid

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langfuse import observe

from utils.blacklist import BLACKLIST
from utils.logger import logger
from .name_tracker import add_generated_name, get_excluded_names
from .appearance_tracker import (
    get_random_constraints,
    get_excluded_features,
    add_generated_features,
)
from generate.models.lore_piece import LorePiece
from .flaw_templates import (
    FlawTemplate,
    get_flaw_by_id,
    get_random_flaw_ids,
)
from services.llm_client import (
    get_llm,
    increment_success_counter,
    increment_failure_counter,
)
from exceptions.generation import CharacterGenerationError
from utils.format_text import clean_ai_text
from .traits import (
    PersonalityTrait,
    get_trait_list_for_prompt,
    get_all_trait_names,
    validate_trait_selection,
)
from generate.models.structured_llm_output.character_schema import (
    CharacterTraits,
    CharacterSkills,
    CharacterStats,
)

blacklist_str = ", ".join(BLACKLIST["words"] + BLACKLIST["full_names"])


@observe()
async def generate_character(theme: str = "post-apocalyptic") -> LorePiece:
    """
    Generate a character by prompting for:
    name, personality traits, appearance traits, backstory, skills, and stats.
    The generation is adapted to the provided theme.
    """

    try:
        with open("generate/prompts/shared/theme_references.txt", "r") as f:
            theme_references = f.read()

        # Generate Name
        with open("generate/prompts/character/character_name.txt", "r") as f:
            name_prompt_text = f.read()

        # Get recently used names to exclude
        excluded_names_list = get_excluded_names(limit=50)
        excluded_names_str = (
            ", ".join(excluded_names_list) if excluded_names_list else "None"
        )

        name_prompt = PromptTemplate.from_template(name_prompt_text)
        name_llm = get_llm(max_tokens=50)
        name_chain = name_prompt | name_llm | StrOutputParser()
        name_raw = await name_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "blacklist": blacklist_str,
                "excluded_names": excluded_names_str,
            }
        )
        name = clean_ai_text(name_raw)
        logger.info(f"Generated character name: {name}")

        # Track this name to prevent immediate reuse
        add_generated_name(name)

        # Generate Appearance with diversity constraints
        with open("generate/prompts/character/character_appearance.txt", "r") as f:
            appearance_prompt_text = f.read()

        # Get random constraints for variety
        constraints = get_random_constraints()

        # Get recently used features to avoid
        excluded_features_list = get_excluded_features(limit=15)
        excluded_features_str = (
            ", ".join(excluded_features_list) if excluded_features_list else "None"
        )

        appearance_prompt = PromptTemplate.from_template(appearance_prompt_text)
        appearance_llm = get_llm(max_tokens=250)
        appearance_chain = appearance_prompt | appearance_llm | StrOutputParser()
        appearance_raw = await appearance_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
                "age": constraints["age"],
                "build": constraints["build"],
                "distinctive_feature": constraints["distinctive_feature"],
                "excluded_features": excluded_features_str,
            }
        )
        appearance = clean_ai_text(appearance_raw)
        logger.info(
            f"Generated appearance for {name} (age: {constraints['age']}, build: {constraints['build']})"
        )

        # Track appearance features to prevent repetition
        add_generated_features(appearance)

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
                "appearance": appearance,
            }
        )
        backstory = clean_ai_text(backstory_raw)
        logger.info(f"Generated backstory for {name}")

        # Generate Personality Traits
        with open("generate/prompts/character/character_traits.txt", "r") as f:
            traits_prompt_text = f.read()

        traits_prompt = PromptTemplate.from_template(traits_prompt_text)
        traits_llm = get_llm(max_tokens=50).with_structured_output(CharacterTraits)
        traits_chain = traits_prompt | traits_llm

        # Get the formatted trait list for the prompt
        trait_list = get_trait_list_for_prompt()

        try:
            traits_result = cast(
                CharacterTraits,
                await traits_chain.ainvoke(
                    {
                        "theme": theme,
                        "theme_references": theme_references,
                        "name": name,
                        "appearance": appearance,
                        "backstory": backstory,
                        "trait_list": trait_list,
                    }
                ),
            )
            # LLM returns validated list of trait names directly
            trait_names = traits_result.traits

            # Convert to PersonalityTrait enums
            personality_traits = []
            all_valid_traits = get_all_trait_names()

            for trait_name in trait_names:
                if trait_name in all_valid_traits:
                    personality_traits.append(PersonalityTrait(trait_name))
                else:
                    logger.warning(
                        f"Invalid trait '{trait_name}' from LLM, will use fallback"
                    )

            # Validate we have exactly 3 compatible traits
            if len(personality_traits) != 3 or not validate_trait_selection(
                personality_traits
            ):
                raise ValueError(f"Invalid trait selection: {trait_names}")

            logger.info(
                f"Generated traits for {name}: {[t.value for t in personality_traits]}"
            )

        except Exception as e:
            logger.warning(
                f"Structured trait generation failed: {e}. Using theme-based fallback."
            )
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
        skills_llm = get_llm(max_tokens=70).with_structured_output(CharacterSkills)
        skills_chain = skills_prompt | skills_llm

        try:
            skills_result = cast(
                CharacterSkills,
                await skills_chain.ainvoke(
                    {
                        "theme": theme,
                        "theme_references": theme_references,
                        "name": name,
                        "personality": ", ".join(traits_list),
                        "appearance": appearance,
                    }
                ),
            )
            # LLM returns validated list of skills directly
            skills_array = skills_result.skills
            logger.info(f"Generated {len(skills_array)} skills: {skills_array}")

        except Exception as e:
            logger.warning(f"Structured skills generation failed: {e}. Using fallback.")
            # Fallback defaults
            skills_array = [
                "Basic Training",
                "Combat",
                "Survival",
                "Awareness",
            ]

        # Generate Flaw
        with open("generate/prompts/character/character_flaw.txt", "r") as f:
            flaw_prompt_text = f.read()

        # Get 10 random flaw template IDs and format them for the prompt
        flaw_ids = get_random_flaw_ids(10)
        flaw_options_list = []
        for flaw_id in flaw_ids:
            template = get_flaw_by_id(flaw_id)
            if template:
                flaw_options_list.append(
                    f"{template['id']}: {template['name']} - {template['description']}"
                )
        flaw_options = "\n".join(flaw_options_list)

        flaw_prompt = PromptTemplate.from_template(flaw_prompt_text)
        flaw_llm = get_llm(max_tokens=30)
        flaw_chain = flaw_prompt | flaw_llm | StrOutputParser()
        flaw_raw = await flaw_chain.ainvoke(
            {
                "theme": theme,
                "theme_references": theme_references,
                "name": name,
                "personality": ", ".join(traits_list),
                "description": backstory,
                "flaw_options": flaw_options,
            }
        )
        flaw_id_raw = clean_ai_text(flaw_raw)

        flaw_template = get_flaw_by_id(flaw_id_raw)

        # Fallback: if LLM returned invalid ID, try first from the list
        if not flaw_template:
            logger.warning(
                f"Invalid flaw ID '{flaw_id_raw}' returned. Using fallback from options."
            )
            flaw_template = get_flaw_by_id(flaw_ids[0])

        # If still None, use a hardcoded default flaw (should never happen)
        if not flaw_template:
            logger.error("All flaw lookups failed, using hardcoded default")
            flaw_template = cast(
                FlawTemplate,
                {
                    "id": "default",
                    "name": "Haunted",
                    "description": "Haunted by memories of the past",
                    "trigger": "When confronted with reminders of their past",
                    "penalty": "Disadvantage on mental resilience checks",
                    "duration": "Until the scene ends",
                    "category": "mental",
                },
            )

        # Store flaw as structured object (adventure mode will use this directly)
        flaw_data = {
            "name": flaw_template["name"],
            "description": flaw_template["description"],
            "trigger": flaw_template["trigger"],
            "penalty": flaw_template["penalty"],
            "duration": flaw_template["duration"],
        }
        logger.info(f"Generated flaw for {name}: {flaw_template['name']}")

        # Generate Stats
        with open("generate/prompts/character/character_stats.txt", "r") as f:
            stats_prompt_text = f.read()

        stats_prompt = PromptTemplate.from_template(stats_prompt_text)
        stats_llm = get_llm(max_tokens=70).with_structured_output(CharacterStats)
        stats_chain = stats_prompt | stats_llm

        try:
            stats_result = cast(
                CharacterStats,
                await stats_chain.ainvoke(
                    {
                        "theme": theme,
                        "theme_references": theme_references,
                        "name": name,
                        "personality": ", ".join(traits_list),
                        "appearance": appearance,
                        "description": backstory,
                        "skills": json.dumps(skills_array),
                    }
                ),
            )
            # LLM returns validated stats directly
            health = stats_result.health
            stress = stats_result.stress
            knowledge = stats_result.knowledge
            empathy = stats_result.empathy
            resilience = stats_result.resilience
            creativity = stats_result.creativity
            influence = stats_result.influence
            perception = stats_result.perception

            logger.info(f"Generated stats: health={health}, stress={stress}")

        except Exception as e:
            logger.warning(f"Structured stats generation failed: {e}. Using defaults.")
            # Fallback defaults
            health = 100
            stress = 0
            knowledge = 10
            empathy = 10
            resilience = 10
            creativity = 10
            influence = 10
            perception = 10

        # Generate temp UUID for portrait job
        character_id = str(uuid.uuid4())

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
        "uuid": character_id,  # Temp UUID for portrait lookup
        "traits": traits_list,
        "appearance": appearance,
        "flaw": flaw_data,
        "health": health,
        "stress": stress,
        "knowledge": knowledge,
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
