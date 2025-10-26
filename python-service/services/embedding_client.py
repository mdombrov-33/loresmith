from langchain_ollama import OllamaEmbeddings
from langchain_openai import OpenAIEmbeddings
from pydantic import SecretStr

from config.settings import get_settings
from search.query_preprocessor import preprocess_search_query
from utils.logger import logger

settings = get_settings()


def get_embedding_model():
    """
    Get embedding model based on AI provider.
    - local: Uses Ollama with configurable embedding model (default: nomic-embed-text, 768 dims, free)
    - openrouter: Uses OpenAI embeddings via OpenRouter (default: text-embedding-3-small, 1536 dims, paid)
    """
    if settings.AI_PROVIDER == "local":
        logger.info(
            f"Initializing Ollama embeddings with {settings.LOCAL_EMBEDDING_MODEL} at {settings.OLLAMA_URL}"
        )
        return OllamaEmbeddings(
            model=settings.LOCAL_EMBEDDING_MODEL, base_url=settings.OLLAMA_URL
        )
    else:
        logger.info(
            f"Initializing OpenAI embeddings (via OpenRouter) with {settings.OPENROUTER_EMBEDDING_MODEL}"
        )
        return OpenAIEmbeddings(
            model=settings.OPENROUTER_EMBEDDING_MODEL,
            api_key=SecretStr(settings.OPENROUTER_API_KEY),
            base_url=settings.OPENROUTER_EMBEDDING_BASE_URL,
        )


async def generate_embedding(text: str) -> list[float]:
    """Generate embedding vector for given text."""
    try:
        preprocessed_text = preprocess_search_query(text)
        logger.debug(f"Original text: '{text}' -> Preprocessed: '{preprocessed_text}'")

        model = get_embedding_model()
        embedding = await model.aembed_query(preprocessed_text)
        logger.info(f"Generated embedding with {len(embedding)} dimensions")
        return embedding
    except Exception as e:
        logger.error(f"Failed to generate embedding: {e}", exc_info=True)
        raise
