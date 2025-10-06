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

AI_PROVIDER = os.getenv("AI_PROVIDER", "openrouter")  # "local" or "openrouter"
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
LOCAL_MODEL = os.getenv("LOCAL_MODEL", "llama3.1:8b")

logger.info(f"AI Provider initialized: {AI_PROVIDER}")
if AI_PROVIDER == "local":
    logger.info(f"Using local Ollama model: {LOCAL_MODEL} at {OLLAMA_URL}")
else:
    logger.info("Using OpenRouter API")


async def ask_ollama(
    prompt: str, model: str | None = None, max_tokens: int = 500
) -> str:
    """
    Call local Ollama API for text generation.

    Args:
        prompt: The text prompt to send to the model
        model: Model name (defaults to LOCAL_MODEL from env)
        max_tokens: Maximum tokens to generate

    Returns:
        Generated text from the model
    """
    if model is None:
        model = LOCAL_MODEL

    json_data = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": max_tokens,  # Ollama's equivalent of max_tokens
            "temperature": 0.7,
            "top_p": 0.9,  # Nucleus sampling
            "stop": ["\n\n", "Example", "Note:"],  # Stop generation at these tokens
        },
    }

    try:
        async with httpx.AsyncClient(
            timeout=120
        ) as client:  # Longer timeout for local generation
            response = await client.post(f"{OLLAMA_URL}/api/generate", json=json_data)
            response.raise_for_status()
            data = response.json()
            return data["response"]
    except httpx.HTTPStatusError as e:
        logger.error(f"Ollama HTTP error: {e}")
        raise OpenRouterHTTPError()
    except httpx.RequestError as e:
        logger.error(f"Ollama request error: {e}")
        raise OpenRouterRequestError()
    except Exception as e:
        logger.error(f"Ollama unexpected error: {e}")
        raise OpenRouterException()


async def ask_openrouter_with_retries(
    prompt: str,
    max_retries: int = 3,
    model: str = "openai/gpt-4",
    **kwargs,
) -> str:
    """
    Main AI generation function with retry logic.
    Automatically routes to Ollama (local) or OpenRouter (cloud) based on AI_PROVIDER env var.

    Args:
        prompt: Text prompt to send to the model
        max_retries: Number of retry attempts
        model: Model name (used for OpenRouter, ignored for Ollama)
        **kwargs: Additional arguments (like max_tokens)

    Returns:
        Generated text
    """
    delay = 1
    last_exception: Exception | None = None

    for attempt in range(max_retries):
        try:
            if AI_PROVIDER == "local":
                response = await ask_ollama(prompt, **kwargs)
                provider_name = LOCAL_MODEL
            else:
                response = await ask_openrouter(prompt, model=model, **kwargs)
                provider_name = model

            if attempt > 0:
                logger.info(f"Success on retry {attempt + 1}")
            ai_generation_success_counter.labels(model=provider_name).inc()
            return response
        except httpx.RequestError as e:
            provider_name = LOCAL_MODEL if AI_PROVIDER == "local" else model
            ai_generation_failure_counter.labels(
                model=provider_name, error_type="request_error"
            ).inc()
            logger.warning(f"Attempt {attempt + 1} failed: {e}")
            last_exception = e
        except httpx.HTTPStatusError as e:
            provider_name = LOCAL_MODEL if AI_PROVIDER == "local" else model
            ai_generation_failure_counter.labels(
                model=provider_name, error_type="http_error"
            ).inc()
            logger.warning(f"Attempt {attempt + 1} failed: {e}")
            last_exception = e
        except Exception as e:
            provider_name = LOCAL_MODEL if AI_PROVIDER == "local" else model
            ai_generation_failure_counter.labels(
                model=provider_name, error_type="unexpected_error"
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
    prompt: str, model: str = "openai/gpt-4", max_tokens: int = 500
) -> str:
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    json_data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
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
