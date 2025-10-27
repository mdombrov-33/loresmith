from rank_bm25 import BM25Okapi  # type: ignore
from typing import Any
from utils.logger import logger
from search.tokenizer import tokenize


class BM25Indexer:
    """Handles BM25 indexing and scoring."""

    def __init__(self):
        self.index = None
        self.documents: list[dict[str, Any]] = []

    def build_index(self, documents: list[dict[str, Any]]):
        """
        Build BM25 index from documents.

        Args:
            documents: List of dicts with text fields
        """
        self.documents = documents
        texts = []
        for doc in documents:
            text = f"{doc.get('title', '')} {doc.get('theme', '')} {doc.get('full_story', '')}"
            texts.append(tokenize(text))

        self.index = BM25Okapi(texts)
        logger.info(f"Built BM25 index for {len(documents)} documents")

    def get_scores(self, query: str) -> list[float]:
        """
        Get BM25 scores for a query.

        Args:
            query: Search query

        Returns:
            List of scores for each document
        """
        if not self.index:
            logger.warning("BM25 index not built")
            return []
        query_tokens = tokenize(query)
        scores = self.index.get_scores(query_tokens)
        return scores.tolist()
