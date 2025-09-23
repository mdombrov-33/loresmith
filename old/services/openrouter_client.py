import asyncio  # async sleep
import os  # read environment variables
import random  # for jitter in retries

import httpx  # async http client, async native
from dotenv import load_dotenv  # load environment variables from .env file
from utils.logger import logger
from utils.exceptions.openrouter import OpenRouterRequestError, OpenRouterHTTPError
from utils.exceptions.base import OpenRouterException

from prometheus_client import Counter

# Success and failure counters for OpenRouter API calls
ai_generation_success_counter = Counter(
    "loresmith_ai_generation_success_total",
    "Total number of successful AI generation requests to OpenRouter",
    ["model"],
)

ai_generation_failure_counter = Counter(
    "loresmith_ai_generation_failure_total",
    "Total number of failed AI generation requests to OpenRouter",
    ["model", "error_type"],
)

load_dotenv()


API_KEY = os.getenv("OPENROUTER_API_KEY")
API_URL = "https://openrouter.ai/api/v1/chat/completions"


# Wrapper function to handle retries for the OpenRouter API call
async def ask_openrouter_with_retries(
    prompt: str, max_retries: int = 3, model: str = "openai/gpt-4o-mini", **kwargs
) -> str:
    delay = 1  # initial delay in seconds

    for attempt in range(max_retries):
        try:
            response = await ask_openrouter(prompt, model=model, **kwargs)

            if attempt > 0:
                logger.info(f"Success on retry attempt {attempt + 1}")

            # Track successful completion
            ai_generation_success_counter.labels(model=model).inc()

            return response

        # Network error or timeout
        except httpx.RequestError as e:
            # Track request-level failure (e.g., DNS, timeout)
            ai_generation_failure_counter.labels(
                model=model, error_type="request_error"
            ).inc()

            logger.warning(
                f"Attempt {attempt + 1} failed with error: {e}", exc_info=True
            )

        # API returned non-2xx status (e.g., 401, 429, 500)
        except httpx.HTTPStatusError as e:
            # Track HTTP response errors
            ai_generation_failure_counter.labels(
                model=model, error_type="http_error"
            ).inc()

            logger.warning(
                f"Attempt {attempt + 1} failed with HTTP error: {e}", exc_info=True
            )

        # Other unexpected errors
        except Exception as e:
            # Track unknown/unhandled error type
            ai_generation_failure_counter.labels(
                model=model, error_type="unexpected_error"
            ).inc()

            logger.error(f"Unexpected error occurred during retry: {e}", exc_info=True)
            raise

        # If not last retry, wait with backoff
        if attempt == max_retries - 1:
            logger.error("Max retries reached. Raising the exception.", exc_info=True)
            raise

        logger.info(f"Waiting {delay:.1f}s before retrying...")

        await asyncio.sleep(delay + random.uniform(0, 0.5))  # add jitter
        delay *= 2  # exponential backoff


async def ask_openrouter(
    prompt: str, model: str = "openai/gpt-4o-mini", max_tokens: int = 500
) -> str:
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

    json_data = {
        "model": model,
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
        raise OpenRouterHTTPError(status_code=e.response.status_code, message=str(e))

    # Network error or timeout
    except httpx.RequestError as e:
        logger.error(
            f"Request error occurred while sending prompt: {prompt}\nError: {e}",
            exc_info=True,
        )
        raise OpenRouterRequestError(str(e))

        # Other unexpected errors
    except Exception as e:
        logger.error(
            f"Unexpected error occurred during OpenRouter call: {e}", exc_info=True
        )
        raise OpenRouterException(str(e))
