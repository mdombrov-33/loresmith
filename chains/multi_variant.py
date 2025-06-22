import asyncio
from chains.character_chain import generate_character
from chains.faction_chain import generate_faction
from chains.setting_chain import generate_setting
from chains.event_chain import generate_event
from chains.relic_chain import generate_relic
from models.lore_piece import LorePiece
from constants.themes import Theme


async def generate_multiple_characters(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    tasks = [generate_character(theme) for _ in range(count)]
    return await asyncio.gather(*tasks)


async def generate_multiple_factions(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    tasks = [generate_faction(theme) for _ in range(count)]
    return await asyncio.gather(*tasks)


async def generate_multiple_settings(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    tasks = [generate_setting(theme) for _ in range(count)]
    return await asyncio.gather(*tasks)


async def generate_multiple_events(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    tasks = [generate_event(theme) for _ in range(count)]
    return await asyncio.gather(*tasks)


async def generate_multiple_relics(
    count: int = 3, theme: Theme = Theme.post_apocalyptic
) -> list[LorePiece]:
    tasks = [generate_relic(theme) for _ in range(count)]
    return await asyncio.gather(*tasks)
