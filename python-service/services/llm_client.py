import os
from typing import Optional
from dotenv import load_dotenv
from pydantic import SecretStr

from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from langchain_core.language_models.chat_models import BaseChatModel

from prometheus_client import Counter

from utils.logger import logger

load_dotenv()

# Prometheus metrics
ai_generation_success_counter = Counter(
    "loresmith_ai_generation_success_total",
    "Total number of successful AI generation requests",
    ["model"],
)

ai_generation_failure_counter = Counter(
    "loresmith_ai_generation_failure_total",
    "Total number of failed AI generation requests",
    ["model", "error_type"],
)


AI_PROVIDER = os.getenv("AI_PROVIDER", "local")  # "ollama" or "openrouter"
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
LOCAL_MODEL = os.getenv("LOCAL_MODEL", "llama3.1:8b")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

API_KEY: Optional[SecretStr] = (
    SecretStr(OPENROUTER_API_KEY) if OPENROUTER_API_KEY else None
)

logger.info(f"AI Provider initialized: {AI_PROVIDER}")
if AI_PROVIDER == "local":
    logger.info(f"Using local Ollama model: {LOCAL_MODEL} at {OLLAMA_URL}")
else:
    logger.info(f"Using OpenRouter API with model: {OPENROUTER_MODEL}")


def get_llm(
    max_tokens: int = 500,
    temperature: float = 0.8,
    model: Optional[str] = None,
) -> BaseChatModel:
    """
    Create a LangChain LLM instance based on AI_PROVIDER environment variable.

    Args:
        max_tokens: Maximum tokens to generate (default: 500)
        temperature: Sampling temperature 0.0-1.0 (default: 0.8)
        model: Optional model override (defaults to env var)

    Returns:
        A LangChain BaseChatModel (ChatOpenAI or ChatOllama)

    Raises:
        ValueError: If configuration is invalid or required env vars are missing
    """
    provider = AI_PROVIDER.lower()

    if provider == "local":
        model_name = model or LOCAL_MODEL

        logger.debug(
            f"Creating Ollama LLM: model={model_name}, "
            f"base_url={OLLAMA_URL}, max_tokens={max_tokens}"
        )

        return ChatOllama(
            model=model_name,
            base_url=OLLAMA_URL,
            num_predict=max_tokens,
            temperature=temperature,
        )

    elif provider == "openrouter":
        if not OPENROUTER_API_KEY:
            raise ValueError(
                "OPENROUTER_API_KEY environment variable is required when "
                "AI_PROVIDER is set to 'openrouter'"
            )

        model_name = model or OPENROUTER_MODEL

        logger.debug(
            f"Creating OpenRouter LLM: model={model_name}, "
            f"max_tokens={max_tokens}, temperature={temperature}"
        )

        return ChatOpenAI(
            model=model_name,
            max_completion_tokens=max_tokens,
            api_key=API_KEY,
            base_url="https://openrouter.ai/api/v1",
            temperature=temperature,
            max_retries=3,
            timeout=60,
        )

    else:
        raise ValueError(
            f"Invalid AI_PROVIDER: '{provider}'. Must be 'ollama' or 'openrouter'"
        )


def get_model_name() -> str:
    """
    Get the current model name for metrics/logging.

    Returns:
        Model identifier string (e.g., "llama3.1:8b" or "openai/gpt-4o-mini")
    """
    if AI_PROVIDER.lower() == "ollama":
        return LOCAL_MODEL
    else:
        return OPENROUTER_MODEL


def increment_success_counter():
    """
    Increment Prometheus success counter for the current model.
    Call this after successful LLM generation.
    """
    model_name = get_model_name()
    ai_generation_success_counter.labels(model=model_name).inc()
    logger.debug(f"Success counter incremented for model: {model_name}")


def increment_failure_counter(error_type: str):
    """
    Increment Prometheus failure counter for the current model.

    Args:
        error_type: Type of error (e.g., "request_error", "http_error", "timeout")
    """
    model_name = get_model_name()
    ai_generation_failure_counter.labels(model=model_name, error_type=error_type).inc()
    logger.debug(
        f"Failure counter incremented for model: {model_name}, error_type: {error_type}"
    )
