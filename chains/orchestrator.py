from chains.faction_chain import generate_faction
from chains.npc_chain import generate_npc
from models.faction_npc import FactionAndNPC


async def generate_faction_and_npc() -> FactionAndNPC:
    faction = await generate_faction()
    npc = await generate_npc(faction)

    return FactionAndNPC(
        faction=faction,
        npc=npc,
    )
