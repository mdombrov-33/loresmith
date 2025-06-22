import asyncio
from chains.faction_chain import generate_faction
from chains.npc_chain import generate_npc
from chains.setting_chain import generate_setting
from models.generated_lore import GeneratedLore


async def generate_all() -> GeneratedLore:
    # Run faction and setting concurrently first
    faction_task = asyncio.create_task(generate_faction())
    setting_task = asyncio.create_task(generate_setting())

    # Once faction is ready, generate NPC which depends on faction
    faction, setting = await asyncio.gather(faction_task, setting_task)
    npc = await generate_npc(faction)

    return GeneratedLore(faction=faction, npc=npc, setting=setting)
