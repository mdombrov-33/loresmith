"""
Fusion Retrieval combining vector-based and BM25 keyword-based search.

Reference: https://github.com/NirDiamant/RAG_TECHNIQUES/blob/main/all_rag_techniques/fusion_retrieval.ipynb

Combines semantic vector search with keyword-based BM25 retrieval for improved relevance.
"""

import numpy as np
from typing import Any
from utils.logger import logger
from search.tokenizer import tokenize
from search.bm25_indexer import BM25Indexer


class FusionRetriever:
    """Handles fusion retrieval combining vector and BM25 search."""

    def __init__(self, alpha: float = 0.7):
        """
        Initialize with fusion weight.

        Args:
            alpha: Weight for vector scores (1-alpha for BM25). 0.7 = favor vector more.
        """
        self.alpha = alpha
        self.bm25_indexer = BM25Indexer()
        self.documents: list[dict] = []

    def fuse_scores(
        self, vector_results: list[dict[str, Any]], query: str
    ) -> list[dict[str, Any]]:
        if not self.bm25_indexer.index:
            self.bm25_indexer.build_index(vector_results)
            self.documents = vector_results

        if not vector_results:
            return []

        query_tokens = tokenize(query)
        bm25_scores = self.bm25_indexer.get_scores(query)

        logger.info(f"Query tokens: {query_tokens}")
        logger.info(
            f"BM25 scores range: min={np.min(bm25_scores):.4f}, max={np.max(bm25_scores):.4f}"
        )

        fused_results = []
        logger.info("Fusion details for each result:")
        for i, result in enumerate(vector_results):
            vector_score = result.get("relevance", 0.0)
            bm25_score_raw = bm25_scores[i] if i < len(bm25_scores) else 0.0

            bm25_score_normalized = bm25_score_raw
            if len(bm25_scores) > 1:
                bm25_min, bm25_max = np.min(bm25_scores), np.max(bm25_scores)
                if bm25_max > bm25_min:
                    bm25_score_normalized = (bm25_score_raw - bm25_min) / (
                        bm25_max - bm25_min
                    )
                else:
                    bm25_score_normalized = 0.0

            fused_score = (
                self.alpha * vector_score + (1 - self.alpha) * bm25_score_normalized
            )
            result["relevance"] = fused_score

            title = result.get("title", "")
            logger.info(
                f"  Index {i}, Title: '{title}' | Vector: {vector_score:.4f} | BM25_raw: {bm25_score_raw:.4f} | BM25_norm: {bm25_score_normalized:.4f} | Fused: {fused_score:.4f}"
            )

            fused_results.append(result)

        fused_results.sort(key=lambda x: x["relevance"], reverse=True)
        logger.info(f"Fused {len(fused_results)} results with alpha={self.alpha}")
        return fused_results


def fuse_search_results(
    vector_results: list[dict[str, Any]], query: str, alpha: float = 0.5
) -> list[dict[str, Any]]:
    """
    Convenience function to fuse vector and BM25 search results.

    Args:
        vector_results: List of worlds from vector search with 'relevance' scores
        query: Search query
        alpha: Weight for BM25 scores (0.0 = pure vector, 1.0 = pure BM25)

    Returns:
        Fused results sorted by relevance
    """
    retriever = FusionRetriever(alpha=alpha)
    return retriever.fuse_scores(vector_results, query)
