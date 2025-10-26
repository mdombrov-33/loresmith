"""
Result reranking for improving semantic search relevance.

Reference: https://github.com/NirDiamant/RAG_TECHNIQUES/blob/main/all_rag_techniques/reranking.ipynb

We use LLM-based reranking to better differentiate search results after initial vector similarity search.
"""

import json
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate

from services.llm_client import get_llm
from utils.logger import logger


class ResultReranker:
    """Handles reranking of semantic search results using LLM."""

    def __init__(self, llm: BaseChatModel | None = None):
        """Initialize with optional LLM instance."""
        self.llm = llm or get_llm(max_tokens=300, temperature=0.1)

    def rerank_results(self, query: str, worlds: list[dict]) -> list[dict]:
        """
        Rerank search results using LLM to score relevance.

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

        logger.info(f"Starting reranking for query '{query}' with {len(worlds)} worlds")

        try:
            world_summaries = self._create_world_summaries(worlds)

            ranking_indices = self._get_llm_ranking(query, world_summaries, len(worlds))

            reranked_worlds = [worlds[i] for i in ranking_indices]

            logger.info(
                f"Reranking complete: original order {list(range(len(worlds)))} -> {ranking_indices}"
            )
            return reranked_worlds

        except Exception as e:
            logger.warning(f"Reranking failed: {e}, returning original order")
            return worlds

    def _create_world_summaries(self, worlds: list[dict]) -> str:
        """Create truncated summaries of worlds for LLM input."""
        summaries = []
        for i, world in enumerate(worlds):
            theme = world.get("theme", "Unknown")
            full_story = world.get("full_story", "")

            summary = f"World {i + 1} ({theme}): {full_story[:200]}..."
            summaries.append(summary)

        return "\n\n".join(summaries)

    def _get_llm_ranking(
        self, query: str, world_summaries: str, num_worlds: int
    ) -> list[int]:
        """Get ranking from LLM."""
        prompt = ChatPromptTemplate.from_template("""
        Given the search query: "{query}"

        Rank these world descriptions by how well they match the query.
        Consider themes, characters, settings, events, relics, and overall relevance.

        {world_summaries}

        Return ONLY a JSON array of indices in ranked order (best match first).
        Example: [0, 2, 1, 3] means World 0 is best, World 2 is second, etc.

        JSON array:
        """)

        chain = prompt | self.llm
        response = chain.invoke({"query": query, "world_summaries": world_summaries})

        content = response.content
        if isinstance(content, list):
            # If it's a list, join the elements
            content = " ".join(str(item) for item in content)
        elif isinstance(content, dict):
            # If it's a dict, try to extract text content
            content = str(content.get("text", content))

        content = content.strip()

        # Try to extract JSON array from response
        try:
            # Look for JSON array in the response
            start_idx = content.find("[")
            end_idx = content.rfind("]") + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = content[start_idx:end_idx]
                ranking = json.loads(json_str)

                # Validate ranking
                if (
                    isinstance(ranking, list)
                    and len(ranking) == num_worlds
                    and set(ranking) == set(range(num_worlds))
                ):
                    return ranking
                else:
                    raise ValueError("Invalid ranking format")

            else:
                # Try parsing the whole response as JSON
                ranking = json.loads(content)
                if (
                    isinstance(ranking, list)
                    and len(ranking) == num_worlds
                    and set(ranking) == set(range(num_worlds))
                ):
                    return ranking
                else:
                    raise ValueError("Invalid ranking format")

        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(
                f"Failed to parse LLM ranking response: {e}, content: {content}"
            )
            # Fallback: return original order
            return list(range(num_worlds))


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
