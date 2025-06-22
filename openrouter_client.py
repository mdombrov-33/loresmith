import asyncio  # async sleep
import logging  # better error messages
import os  # read environment variables

import httpx  # async http client, async native
from dotenv import load_dotenv  # load environment variables from .env file

load_dotenv()

logger = logging.getLogger(__name__)

API_KEY = os.getenv("OPENROUTER_API_KEY")
API_URL = "https://openrouter.ai/api/v1/chat/completions"


# Wrapper function to handle retries for the OpenRouter API call
async def ask_openrouter_with_retries(prompt: str, max_retries: int = 3) -> str:
    delay = 1  # initial delay

    for attempt in range(max_retries):
        try:
            response = await ask_openrouter(prompt)
            return response
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            logger.warning(f"Attempt {attempt + 1} failed with error: {e}")
            if attempt == max_retries - 1:
                logger.error("Max retries reached. Raising the exception.")
                raise
            logger.info(f"Waiting {delay} seconds before retrying...")
            await asyncio.sleep(delay)
            delay *= 2

        except Exception as e:
            logger.error(f"Unexpected error occurred: {e}")
            raise


async def ask_openrouter(prompt: str) -> str:
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

    json_data = {
        "model": "openai/gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(API_URL, headers=headers, json=json_data)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        # Api returned an error status code
    except httpx.HTTPStatusError as e:
        logger.error(
            f"HTTP error occurred: {e.response.status_code} - {e.response.text}"
        )
        raise
        # Network error or timeout
    except httpx.RequestError as e:
        logger.error(f"Request error occurred: {e}")
        raise
        # Other unexpected errors
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        raise
