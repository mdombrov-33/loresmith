"""
Fusion Retrieval combining vector-based and BM25 keyword-based search.

Reference: https://github.com/NirDiamant/RAG_TECHNIQUES/blob/main/all_rag_techniques/fusion_retrieval.ipynb

Combines semantic vector search with keyword-based BM25 retrieval for improved relevance.
"""

import numpy as np
from rank_bm25 import BM25Okapi  # type: ignore
from typing import Any
from utils.logger import logger
import spacy  # type: ignore
from spacy import Language  # type: ignore

nlp: Language | None = None

try:
    nlp = spacy.load("en_core_web_sm")
except ImportError:
    logger.warning("spaCy not installed, falling back to basic tokenization")
    nlp = None


class FusionRetriever:
    """Handles fusion retrieval combining vector and BM25 search."""

    def __init__(self, alpha: float = 0.7):
        """
        Initialize with fusion weight.

        Args:
            alpha: Weight for vector scores (1-alpha for BM25). 0.7 = favor vector more.
        """
        self.alpha = alpha
        self.bm25_index = None
        self.documents: list[dict] = []

    def _tokenize(self, text: str) -> list[str]:
        """Tokenize text using spaCy or fallback to split."""
        if nlp:
            doc = nlp(text.lower())
            return [
                token.lemma_ for token in doc if not token.is_stop and token.is_alpha
            ]
        else:
            return text.lower().split()

    def build_bm25_index(self, documents: list[dict[str, Any]]):
        """
        Build BM25 index from document texts.

        Args:
            documents: List of world dicts with 'full_story', 'title', 'theme'
        """
        self.documents = documents
        texts = []
        for doc in documents:
            text = f"{doc.get('title', '')} {doc.get('theme', '')} {doc.get('full_story', '')}"
            texts.append(self._tokenize(text))

        self.bm25_index = BM25Okapi(texts)
        logger.info(f"Built BM25 index for {len(documents)} documents")

    def fuse_scores(
        self, vector_results: list[dict[str, Any]], query: str
    ) -> list[dict[str, Any]]:
        """
        Fuse vector and BM25 scores.

        Args:
            vector_results: List of worlds from vector search with 'relevance' scores
            query: Search query

        Returns:
            Fused results with updated relevance scores
        """
        if not self.bm25_index or not self.documents:
            logger.warning("BM25 index not built, returning vector results")
            return vector_results

        if not vector_results:
            return []

        query_tokens = self._tokenize(query)
        bm25_scores = self.bm25_index.get_scores(query_tokens)

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
    vector_results: list[dict[str, Any]], query: str, alpha: float = 0.7
) -> list[dict[str, Any]]:
    """
    Convenience function for fusion retrieval.

    Args:
        vector_results: Worlds from vector search
        query: Search query
        alpha: Fusion weight

    Returns:
        Fused and sorted results
    """
    retriever = FusionRetriever(alpha=alpha)
    retriever.build_bm25_index(vector_results)
    return retriever.fuse_scores(vector_results, query)
