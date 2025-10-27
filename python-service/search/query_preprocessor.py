"""
Query preprocessing for enhancing semantic search relevance.

Reference: https://github.com/NirDiamant/RAG_TECHNIQUES/blob/main/all_rag_techniques/query_transformations.ipynb

We use Query Rewriting technique to transform user queries into more effective search terms.
"""

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate

from services.llm_client import get_llm
from utils.logger import logger


class QueryPreprocessor:
    """Handles query preprocessing for semantic search enhancement."""

    def __init__(self, llm: BaseChatModel | None = None):
        """Initialize with optional LLM instance."""
        self.llm = llm or get_llm(max_tokens=200, temperature=0.3)

    def preprocess_query(self, query: str) -> str:
        """
        Apply query preprocessing to enhance semantic search relevance.

        Uses query rewriting to transform abstract queries into more effective search terms.

        Args:
            query: Original user query

        Returns:
            Preprocessed query optimized for semantic search
        """
        # Skip preprocessing for short queries to avoid hallucination
        if len(query.split()) <= 2:
            return query

        logger.info(f"Starting query preprocessing for: '{query}'")

        try:
            rewritten_query = self._rewrite_query(query)

            logger.info(
                f"Query preprocessing complete: '{query}' -> '{rewritten_query}'"
            )
            return rewritten_query

        except Exception as e:
            logger.warning(f"Query preprocessing failed, using original: {e}")
            return query

    def _rewrite_query(self, query: str) -> str:
        """
        Directly rewrite the query for better semantic matching.

        Args:
            query: Original query

        Returns:
            Rewritten query optimized for semantic search
        """
        prompt = ChatPromptTemplate.from_template("""
        You are a helpful AI assistant. Given the following query, rewrite it as a descriptive phrase for semantic search,
        making it more specific and including relevant keywords that would appear in detailed world descriptions.
        Do not make it a question.

        Original query: {query}

        Return ONLY the rewritten phrase as a single sentence, no explanations or additional text:
        """)

        chain = prompt | self.llm
        response = chain.invoke({"query": query})

        # Handle different response content types
        content = response.content
        if isinstance(content, list):
            # If it's a list, join the elements
            content = " ".join(str(item) for item in content)
        elif isinstance(content, dict):
            # If it's a dict, try to extract text content
            content = str(content.get("text", content))

        return content.strip()


def preprocess_search_query(query: str) -> str:
    """
    Convenience function to preprocess a search query.

    Args:
        query: Original search query

    Returns:
        Preprocessed query optimized for semantic search
    """
    preprocessor = QueryPreprocessor()
    return preprocessor.preprocess_query(query)
