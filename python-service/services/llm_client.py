from typing import cast
from dotenv import load_dotenv
from pydantic import SecretStr

from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.callbacks import Callbacks

from prometheus_client import Counter

from langfuse import Langfuse
from langfuse.langchain import CallbackHandler

from config.settings import get_settings
from utils.logger import logger

load_dotenv()
settings = get_settings()


langfuse_client: Langfuse | None = None
langfuse_handler: CallbackHandler | None = None

logger.info(f"AI Provider initialized: {settings.AI_PROVIDER}")
if settings.AI_PROVIDER == "local":
    logger.info(
        f"Using local Ollama model: {settings.LOCAL_MODEL} at {settings.OLLAMA_URL}"
    )
else:
    logger.info(f"Using OpenRouter API with model: {settings.OPENROUTER_MODEL}")


if settings.LANGFUSE_ENABLED:
    try:
        langfuse_client = Langfuse(
            public_key=settings.LANGFUSE_PUBLIC_KEY,
            secret_key=settings.LANGFUSE_SECRET_KEY,
            host=settings.LANGFUSE_HOST,
        )

        langfuse_handler = CallbackHandler()

        logger.info("Langfuse client initialized")
    except Exception as e:
        logger.warning(f"Failed to initialize Langfuse: {e}")
        langfuse_handler = None


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


def get_llm(
    max_tokens: int = 500,
    temperature: float = 0.8,
    model: str | None = None,
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
    provider = settings.AI_PROVIDER.lower()

    callbacks: Callbacks = cast(
        Callbacks, [langfuse_handler] if langfuse_handler else []
    )

    if provider == "local":
        model_name = model or settings.LOCAL_MODEL

        logger.debug(
            f"Creating Ollama LLM: model={model_name}, "
            f"base_url={settings.OLLAMA_URL}, max_tokens={max_tokens}"
        )

        return ChatOllama(
            model=model_name,
            base_url=settings.OLLAMA_URL,
            num_predict=max_tokens,
            temperature=temperature,
            callbacks=callbacks,
        )

    elif provider == "openrouter":
        if not settings.OPENROUTER_API_KEY:
            raise ValueError(
                "OPENROUTER_API_KEY environment variable is required when "
                "AI_PROVIDER is set to 'openrouter'"
            )

        model_name = model or settings.OPENROUTER_MODEL

        logger.debug(
            f"Creating OpenRouter LLM: model={model_name}, "
            f"max_tokens={max_tokens}, temperature={temperature}"
        )

        return ChatOpenAI(
            model=model_name,
            max_completion_tokens=max_tokens,
            api_key=SecretStr(settings.OPENROUTER_API_KEY),
            base_url="https://openrouter.ai/api/v1",
            temperature=temperature,
            max_retries=3,
            timeout=60,
            callbacks=callbacks,
        )

    else:
        raise ValueError(
            f"Invalid AI_PROVIDER: '{provider}'. Must be 'local' or 'openrouter'"
        )


def get_model_name() -> str:
    """
    Get the current model name for metrics/logging.

    Returns:
        Model identifier string (e.g., "llama3.1:8b" or "openai/gpt-4o-mini")
    """
    if settings.AI_PROVIDER.lower() == "ollama":
        return settings.LOCAL_MODEL
    else:
        return settings.OPENROUTER_MODEL


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
