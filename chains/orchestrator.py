import asyncio

from chains.character_chain import generate_character
from chains.event_chain import generate_event
from chains.faction_chain import generate_faction
from chains.relic_chain import generate_relic
from chains.setting_chain import generate_setting
from models.generated_lore_bundle import GeneratedLoreBundle  # you create this


async def generate_all() -> GeneratedLoreBundle:
    # Run all 5 generators concurrently
    character_task = asyncio.create_task(generate_character())
    faction_task = asyncio.create_task(generate_faction())
    setting_task = asyncio.create_task(generate_setting())
    event_task = asyncio.create_task(generate_event())
    relic_task = asyncio.create_task(generate_relic())

    character, faction, setting, event, relic = await asyncio.gather(
        character_task, faction_task, setting_task, event_task, relic_task
    )

    return GeneratedLoreBundle(
        character=character,
        faction=faction,
        setting=setting,
        event=event,
        relic=relic,
    )
