import asyncio
import os
import random
import httpx
from dotenv import load_dotenv

from utils.logger import logger
from exceptions.openrouter import OpenRouterRequestError, OpenRouterHTTPError
from exceptions.base import OpenRouterException

from prometheus_client import Counter

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


async def ask_openrouter_with_retries(
    prompt: str, max_retries: int = 3, model: str = "openai/gpt-4o-mini", **kwargs
) -> str:
    delay = 1
    last_exception: Exception | None = None

    for attempt in range(max_retries):
        try:
            response = await ask_openrouter(prompt, model=model, **kwargs)
            if attempt > 0:
                logger.info(f"Success on retry {attempt + 1}")
            ai_generation_success_counter.labels(model=model).inc()
            return response
        except httpx.RequestError as e:
            ai_generation_failure_counter.labels(
                model=model, error_type="request_error"
            ).inc()
            logger.warning(f"Attempt {attempt + 1} failed: {e}")
            last_exception = e
        except httpx.HTTPStatusError as e:
            ai_generation_failure_counter.labels(
                model=model, error_type="http_error"
            ).inc()
            logger.warning(f"Attempt {attempt + 1} failed: {e}")
            last_exception = e
        except Exception as e:
            ai_generation_failure_counter.labels(
                model=model, error_type="unexpected_error"
            ).inc()
            logger.error(f"Unexpected error: {e}")
            raise

        if attempt < max_retries - 1:
            logger.info(f"Retrying in {delay:.1f}s...")
            await asyncio.sleep(delay + random.uniform(0, 0.5))
            delay *= 2

    logger.error("Max retries reached")
    if last_exception:
        raise last_exception
    raise RuntimeError("All retries failed")


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
    except httpx.HTTPStatusError:
        raise OpenRouterHTTPError()
    except httpx.RequestError:
        raise OpenRouterRequestError()
    except Exception:
        raise OpenRouterException()
