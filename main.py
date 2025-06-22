import asyncio
from chains.orchestrator import generate_all


async def main():
    data = await generate_all()
    print(data)


if __name__ == "__main__":
    asyncio.run(main())
