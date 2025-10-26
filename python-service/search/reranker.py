"""
Result reranking for improving semantic search relevance.

Reference: https://github.com/NirDiamant/RAG_TECHNIQUES/blob/main/all_rag_techniques/reranking.ipynb

We use LLM-based reranking to better differentiate search results after initial vector similarity search.
"""

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field

from services.llm_client import get_llm
from utils.logger import logger
from search.query_preprocessor import preprocess_search_query


class RelevanceScore(BaseModel):
    relevance_score: float = Field(
        ...,
        description="The relevance score of a world to the query, on a scale of 1-10.",
    )


class ResultReranker:
    """Handles reranking of semantic search results using LLM."""

    def __init__(self, llm: BaseChatModel | None = None):
        """Initialize with optional LLM instance."""
        self.llm = llm or get_llm(max_tokens=1000, temperature=0.1)

    def rerank_results(self, query: str, worlds: list[dict]) -> list[dict]:
        """
        Rerank search results using LLM to score relevance individually.

        Args:
            query: Original search query
            worlds: List of world dicts with 'full_story', 'relevance', etc.

        Returns:
            Reranked worlds by LLM relevance scores
        """
        if len(worlds) <= 1:
            logger.debug("Only one world to rank, skipping reranking")
            return worlds

        if len(worlds) > 10:
            logger.warning(
                f"Too many worlds for reranking ({len(worlds)}), limiting to top 10"
            )
            worlds = worlds[:10]

        preprocessed_query = preprocess_search_query(query)
        logger.info(
            f"Using preprocessed query for reranking: '{query}' -> '{preprocessed_query}'"
        )

        try:
            scored_worlds = []
            for world in worlds:
                initial_relevance = world.get("relevance", 0)
                full_story = world.get("full_story", "")
                theme = world.get("theme", "Unknown")

                prompt = PromptTemplate.from_template("""
                On a scale of 1-10, rate the relevance of the following world description to the query. 
                Be strict: Give high scores (8-10) only for strong, direct matches to the query's core elements.
                Give medium scores (5-7) for worlds with some related themes but not the full story.
                Give low scores (1-4) for weak or tangential matches.
                Consider the initial similarity {initial_relevance:.1%} but prioritize exact semantic and thematic fit.
                Query: {query}
                World ({theme}): {full_story}
                Relevance Score (1-10):
                """)

                chain = prompt | self.llm.with_structured_output(RelevanceScore)
                score_response = chain.invoke(
                    {
                        "query": preprocessed_query,  # Use preprocessed for reranking
                        "initial_relevance": initial_relevance,
                        "theme": theme,
                        "full_story": full_story[:500],  # Truncate for token limits
                    }
                )
                if isinstance(score_response, RelevanceScore):
                    new_score = score_response.relevance_score
                else:
                    logger.warning(
                        f"Unexpected response type: {type(score_response)}, using default score"
                    )
                    new_score = 5.0  # Default medium score

                # Update the world dict with new score (as decimal for display, e.g., 0.8 for 80%)
                world["relevance"] = new_score / 10.0
                logger.info(
                    f"World '{theme}': initial {initial_relevance:.1%} -> new {new_score}/10 = {world['relevance']:.1%}"
                )
                scored_worlds.append((world, new_score))

            reranked_worlds = [
                w for w, _ in sorted(scored_worlds, key=lambda x: x[1], reverse=True)
            ]

            logger.info("Reranking complete with new scores")
            return reranked_worlds

        except Exception as e:
            logger.warning(f"Reranking failed: {e}, returning original order")
            return worlds


def rerank_search_results(query: str, worlds: list[dict]) -> list[dict]:
    """
    Convenience function to rerank search results.

    Args:
        query: Original search query
        worlds: List of world dicts from vector search

    Returns:
        Reranked worlds by LLM relevance
    """
    reranker = ResultReranker()
    return reranker.rerank_results(query, worlds)
