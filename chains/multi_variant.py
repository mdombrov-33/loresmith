import asyncio
from chains.character_chain import generate_character
from chains.faction_chain import generate_faction
from chains.setting_chain import generate_setting
from chains.event_chain import generate_event
from chains.relic_chain import generate_relic
from models.lore_piece import LorePiece
from constants.themes import Theme
from services.redis_client import redis_client
import json


async def generate_multiple_characters(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    # Build a unique cache key based on theme and count
    # Example: "characters:post_apocalyptic:3"
    cache_key = f"characters:{theme}:{count}"

    # Attempt to fetch cached data from Redis
    cached = await redis_client.get(cache_key)
    if cached:
        # If cache exists, decode the JSON string back into Python list of dicts
        data = json.loads(cached)
        # Convert each dict back into a LorePiece Pydantic model
        return [LorePiece.model_validate(item) for item in data]

    # If no cached data, generate new character lore pieces in parallel
    characters = await asyncio.gather(
        *(generate_character(theme) for _ in range(count))
    )

    # Convert list of Pydantic models into plain dicts and encode to JSON string
    json_data = json.dumps([char.model_dump() for char in characters])

    # Store the result in Redis cache with a 1-hour expiration (TTL)
    await redis_client.set(cache_key, json_data, ex=3600)

    # Return the freshly generated data
    return characters


async def generate_multiple_factions(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    cache_key = f"factions:{theme}:{count}"
    cached = await redis_client.get(cache_key)
    if cached:
        data = json.loads(cached)
        return [LorePiece.model_validate(item) for item in data]

    factions = await asyncio.gather(*(generate_faction(theme) for _ in range(count)))
    json_data = json.dumps([f.model_dump() for f in factions])
    await redis_client.set(cache_key, json_data, ex=3600)
    return factions


async def generate_multiple_settings(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    cache_key = f"settings:{theme}:{count}"
    cached = await redis_client.get(cache_key)
    if cached:
        data = json.loads(cached)
        return [LorePiece.model_validate(item) for item in data]

    settings = await asyncio.gather(*(generate_setting(theme) for _ in range(count)))
    json_data = json.dumps([s.model_dump() for s in settings])
    await redis_client.set(cache_key, json_data, ex=3600)
    return settings


async def generate_multiple_events(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    cache_key = f"events:{theme}:{count}"
    cached = await redis_client.get(cache_key)
    if cached:
        data = json.loads(cached)
        return [LorePiece.model_validate(item) for item in data]

    events = await asyncio.gather(*(generate_event(theme) for _ in range(count)))
    json_data = json.dumps([e.model_dump() for e in events])
    await redis_client.set(cache_key, json_data, ex=3600)
    return events


async def generate_multiple_relics(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    cache_key = f"relics:{theme}:{count}"
    cached = await redis_client.get(cache_key)
    if cached:
        data = json.loads(cached)
        return [LorePiece.model_validate(item) for item in data]

    relics = await asyncio.gather(*(generate_relic(theme) for _ in range(count)))
    json_data = json.dumps([r.model_dump() for r in relics])
    await redis_client.set(cache_key, json_data, ex=3600)
    return relics
