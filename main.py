import asyncio
from chains.faction_chain import generate_faction


async def main():
    faction = await generate_faction()
    print("Faction Name:", faction["name"])
    for key, value in faction.items():
        if key != "name":
            print(f"{key.capitalize()}: {value}")


if __name__ == "__main__":
    asyncio.run(main())
