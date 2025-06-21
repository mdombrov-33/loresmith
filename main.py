import asyncio
from openrouter_client import ask_openrouter


async def main():
    user_prompt = "Invent a new faction for a post-apocalyptic world."
    response = await ask_openrouter(user_prompt)
    print("\n=== Response from OpenRouter ===")
    print(response)


if __name__ == "__main__":
    asyncio.run(main())
