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


async def generate_search_embedding(query: str) -> list[float]:
    """
    Generate embedding for a search query (with preprocessing/expansion).
    Used when user searches for worlds.
    """
    try:
        preprocessed_query = preprocess_search_query(query)
        logger.debug(f"Search query: '{query[:100]}...' -> Preprocessed: '{preprocessed_query[:100]}...'")

        model = get_embedding_model()
        embedding = await model.aembed_query(preprocessed_query)
        logger.info(f"Generated search embedding with {len(embedding)} dimensions")
        return embedding
    except Exception as e:
        logger.error(f"Failed to generate search embedding: {e}", exc_info=True)
        raise


async def generate_content_embedding(text: str) -> list[float]:
    """
    Generate embedding for content to be indexed (no preprocessing).
    Used when storing world stories in the database for search.
    """
    try:
        logger.debug(f"Generating content embedding for text: '{text[:100]}...'")

        model = get_embedding_model()
        embedding = await model.aembed_query(text)
        logger.info(f"Generated content embedding with {len(embedding)} dimensions")
        return embedding
    except Exception as e:
        logger.error(f"Failed to generate content embedding: {e}", exc_info=True)
        raise


# Legacy function for backward compatibility - delegates to search embedding
async def generate_embedding(text: str) -> list[float]:
    """
    Legacy function. Use generate_search_embedding or generate_content_embedding instead.
    Defaults to search embedding for backward compatibility.
    """
    logger.warning("generate_embedding() is deprecated. Use generate_search_embedding() or generate_content_embedding()")
    return await generate_search_embedding(text)
