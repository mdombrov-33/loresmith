import asyncio
from dataclasses import asdict
from chains.faction_chain import generate_faction


async def main():
    faction = await generate_faction()
    print("Faction Name:", faction.name)
    faction_data = asdict(faction)
    for key, value in faction_data.items():
        if key != "name":
            print(f"{key.capitalize()}: {value}")


if __name__ == "__main__":
    asyncio.run(main())
