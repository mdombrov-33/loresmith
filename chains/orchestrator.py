from chains.faction_chain import generate_faction
from chains.npc_chain import generate_npc


async def generate_faction_and_npc():
    faction = await generate_faction()
    npc = await generate_npc()

    return {"faction": faction, "npc": npc}
