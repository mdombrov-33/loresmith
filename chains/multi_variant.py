import asyncio
import json

from models.lore_piece import LorePiece
from constants.themes import Theme

from chains.character_chain import generate_character
from chains.faction_chain import generate_faction
from chains.setting_chain import generate_setting
from chains.event_chain import generate_event
from chains.relic_chain import generate_relic

from services.redis_utils import redis_get_with_retries, redis_set_with_retries
from utils.exceptions import RedisGetError, RedisSetError
from utils.logger import logger


async def generate_multiple_generic(
    prefix: str,
    generate_func,
    count: int,
    theme: Theme,
    regenerate: bool = False,
    cache_expire: int = 3600,
) -> list[LorePiece]:
    """
    Generic helper to generate multiple lore pieces with caching and error handling.

    Args:
        prefix: Redis key prefix (e.g. "characters", "factions").
        generate_func: Async function to generate a single lore piece.
        count: Number of lore pieces to generate.
        theme: Theme for generation.
        regenerate: If True, bypass cache and generate fresh data.
        cache_expire: Cache TTL in seconds.

    Returns:
        List of LorePiece instances.
    """
    cache_key = f"{prefix}:{theme}:{count}"

    if not regenerate:
        try:
            cached = await redis_get_with_retries(cache_key)
            if cached:
                data = json.loads(cached)
                return [LorePiece.model_validate(item) for item in data]
        except RedisGetError as e:
            logger.error(f"Redis GET error for key {cache_key}: {e}")

    items = await asyncio.gather(*(generate_func(theme) for _ in range(count)))

    json_data = json.dumps([item.model_dump() for item in items])

    try:
        await redis_set_with_retries(cache_key, json_data, ex=cache_expire)
    except RedisSetError as e:
        logger.error(f"Redis SET error for key {cache_key}: {e}")

    return items


async def generate_multiple_characters(
    count: int = 3, theme: Theme = Theme.post_apocalyptic, regenerate: bool = False
) -> list[LorePiece]:
    return await generate_multiple_generic(
        "characters", generate_character, count, theme, regenerate
    )


async def generate_multiple_factions(
    count: int = 3, theme: Theme = Theme.post_apocalyptic, regenerate: bool = False
) -> list[LorePiece]:
    return await generate_multiple_generic(
        "factions", generate_faction, count, theme, regenerate
    )


async def generate_multiple_settings(
    count: int = 3, theme: Theme = Theme.post_apocalyptic, regenerate: bool = False
) -> list[LorePiece]:
    return await generate_multiple_generic(
        "settings", generate_setting, count, theme, regenerate
    )


async def generate_multiple_events(
    count: int = 3, theme: Theme = Theme.post_apocalyptic, regenerate: bool = False
) -> list[LorePiece]:
    return await generate_multiple_generic(
        "events", generate_event, count, theme, regenerate
    )


async def generate_multiple_relics(
    count: int = 3, theme: Theme = Theme.post_apocalyptic, regenerate: bool = False
) -> list[LorePiece]:
    return await generate_multiple_generic(
        "relics", generate_relic, count, theme, regenerate
    )
