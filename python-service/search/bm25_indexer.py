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
            text_length = len(text)
            world_id = doc.get('id', 'unknown')
            logger.info(f"World {world_id}: text length = {text_length} chars")

            # if text_length > 1000000:  # spaCy limit
            #     logger.error(f"World {world_id} exceeds spaCy limit! Length: {text_length}")
            #     logger.error(f"Title: {doc.get('title', '')[:100]}")
            #     logger.error(f"Theme: {doc.get('theme', '')}")
            #     logger.error(f"full_story length: {len(doc.get('full_story', ''))}")
            #     # Skip this world to avoid crash
            #     texts.append([])  # Empty tokens
            #     continue

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
