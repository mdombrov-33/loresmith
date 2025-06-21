import asyncio
from chains.orchestrator import generate_faction_and_npc


async def main():
    data = await generate_faction_and_npc()
    print("Faction:", data["faction"].appearance)
    print("NPC:", data["npc"])


if __name__ == "__main__":
    asyncio.run(main())
