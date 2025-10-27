"""
Result reranking for improving semantic search relevance.

References: https://github.com/NirDiamant/RAG_TECHNIQUES/blob/main/all_rag_techniques/reranking.ipynb

Uses Fusion Retrieval (vector + BM25) and Dartboard RAG for diversity.
"""

from scipy.special import logsumexp  # type: ignore
import numpy as np
from utils.logger import logger


class ResultReranker:
    """Handles reranking of semantic search results using fusion and diversity."""

    def rerank_with_dartboard(
        self,
        query: str,
        worlds: list[dict],
        diversity_weight: float = 1.0,
        relevance_weight: float = 1.0,
        sigma: float = 0.1,
    ) -> list[dict]:
        """
        Rerank using Dartboard algorithm for relevance-diversity balance.

        Args:
            query: Search query
            worlds: List of world dicts with embeddings and relevance scores
            diversity_weight: Weight for diversity
            relevance_weight: Weight for relevance
            sigma: Smoothing parameter

        Returns:
            Reranked worlds balancing relevance and diversity
        """
        if len(worlds) <= 1:
            return worlds

        # Extract embeddings and scores
        embeddings: list[np.ndarray] = []
        for world in worlds:
            # Assume embeddings are stored in world dict (need to add from vector search)
            emb = world.get("embedding", [])
            if emb:
                embeddings.append(np.array(emb))
            else:
                logger.warning("Missing embedding for world, skipping Dartboard")
                return worlds

        if not embeddings:
            return worlds

        embeddings_array = np.array(embeddings)
        query_embedding = worlds[0].get(
            "query_embedding", []
        )  # Assume added during search
        if not query_embedding:
            logger.warning("Missing query embedding, skipping Dartboard")
            return worlds

        query_emb = np.array(query_embedding)

        # Calculate distances
        query_distances = 1 - np.dot(embeddings_array, query_emb)  # Cosine distance
        doc_distances = 1 - np.dot(
            embeddings_array, embeddings_array.T
        )  # Pairwise distances

        # Apply Dartboard selection
        selected_indices, scores = self._greedy_dartsearch(
            query_distances,
            doc_distances,
            worlds,
            len(worlds),
            diversity_weight,
            relevance_weight,
            sigma,
        )

        selected_worlds = [worlds[i] for i in selected_indices]
        return selected_worlds

    def _greedy_dartsearch(
        self,
        query_distances,
        doc_distances,
        documents,
        num_results,
        diversity_weight=1.0,
        relevance_weight=1.0,
        sigma=0.1,
    ):
        """Greedy Dartboard search implementation."""
        sigma = max(sigma, 1e-5)

        # Convert to log probabilities
        query_probs = self._lognorm(query_distances, sigma)
        doc_probs = self._lognorm(doc_distances, sigma)

        # Initialize with most relevant
        most_relevant_idx = np.argmax(query_probs)
        selected_indices = np.array([most_relevant_idx])
        max_distances = doc_probs[most_relevant_idx]

        # Select remaining
        while len(selected_indices) < min(num_results, len(documents)):
            updated_distances = np.maximum(max_distances, doc_probs)
            combined_scores = (
                updated_distances * diversity_weight + query_probs * relevance_weight
            )
            normalized_scores = np.array(logsumexp(combined_scores, axis=1))
            normalized_scores[selected_indices] = -np.inf
            best_idx = np.argmax(normalized_scores)
            max_distances = updated_distances[best_idx]
            selected_indices = np.append(selected_indices, best_idx)

        return selected_indices, [1.0] * len(selected_indices)  # Dummy scores

    def _lognorm(self, dist, sigma):
        """Log normal probability."""
        if sigma < 1e-9:
            return -np.inf * dist
        return -np.log(sigma) - 0.5 * np.log(2 * np.pi) - dist**2 / (2 * sigma**2)


def rerank_with_fusion_dartboard(
    query: str,
    worlds: list[dict],
    alpha: float = 0.5,
    diversity_weight: float = 1.0,
    relevance_weight: float = 1.0,
    query_embedding: list | None = None,
) -> list[dict]:
    """
    Combined fusion + Dartboard reranking.

    Args:
        query: Search query
        worlds: Worlds from vector search
        alpha: Fusion weight
        diversity_weight: Dartboard diversity weight
        relevance_weight: Dartboard relevance weight
        query_embedding: Query embedding for Dartboard

    Returns:
        Reranked worlds
    """
    from search.fusion_retriever import fuse_search_results

    fused_worlds = fuse_search_results(worlds, query, alpha)

    # Check if Dartboard can run
    has_query_embedding = query_embedding is not None
    worlds_with_embeddings = sum(
        1 for w in fused_worlds if "embedding" in w and w["embedding"]
    )
    total_worlds = len(fused_worlds)

    logger.info(
        f"Dartboard check: query_embedding={has_query_embedding}, worlds_with_embeddings={worlds_with_embeddings}/{total_worlds}"
    )

    if query_embedding and all(
        "embedding" in w and w["embedding"] for w in fused_worlds
    ):
        logger.info("Running Dartboard reranking")
        reranker = ResultReranker()
        try:
            # Add query embedding to worlds for Dartboard
            for world in fused_worlds:
                world["query_embedding"] = query_embedding
            final_worlds = reranker.rerank_with_dartboard(
                query, fused_worlds, diversity_weight, relevance_weight
            )
            logger.info("Dartboard completed successfully")
            return final_worlds
        except Exception as e:
            logger.warning(f"Dartboard failed, using fused results: {e}")
            return fused_worlds
    else:
        logger.info("Dartboard skipped, using fusion results only")
        return fused_worlds
