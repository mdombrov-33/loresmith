import asyncio  # async sleep
import logging  # better error messages
import os  # read environment variables
import random  # for jitter in retries

import httpx  # async http client, async native
from dotenv import load_dotenv  # load environment variables from .env file

load_dotenv()

logger = logging.getLogger(__name__)

API_KEY = os.getenv("OPENROUTER_API_KEY")
API_URL = "https://openrouter.ai/api/v1/chat/completions"


# Wrapper function to handle retries for the OpenRouter API call
async def ask_openrouter_with_retries(
    prompt: str, max_retries: int = 3, **kwargs
) -> str:

    delay = 1  # initial delay in seconds

    for attempt in range(max_retries):
        try:
            response = await ask_openrouter(prompt, **kwargs)
            if attempt > 0:
                logger.info(f"Success on retry attempt {attempt + 1}")
            return response
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            logger.warning(
                f"Attempt {attempt + 1} failed with error: {e}", exc_info=True
            )
            if attempt == max_retries - 1:
                logger.error(
                    "Max retries reached. Raising the exception.", exc_info=True
                )
                raise
            logger.info(f"Waiting {delay:.1f}s before retrying...")
            await asyncio.sleep(delay + random.uniform(0, 0.5))  # add jitter
            delay *= 2  # exponential backoff
        except Exception as e:
            logger.error(f"Unexpected error occurred during retry: {e}", exc_info=True)
            raise


async def ask_openrouter(prompt: str, max_tokens: int = 500) -> str:
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

    json_data = {
        "model": "openai/gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(API_URL, headers=headers, json=json_data)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        # Api returned an error status code
    except httpx.HTTPStatusError as e:
        logger.error(
            f"HTTP error {e.response.status_code} for prompt: {prompt}\nResponse: {e.response.text}",
            exc_info=True,
        )
        raise
    # Network error or timeout
    except httpx.RequestError as e:
        logger.error(
            f"Request error occurred while sending prompt: {prompt}\nError: {e}",
            exc_info=True,
        )
        raise

        # Other unexpected errors
    except Exception as e:
        logger.error(
            f"Unexpected error occurred during OpenRouter call: {e}", exc_info=True
        )
        raise
