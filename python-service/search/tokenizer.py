"""
Text tokenization utilities for search.
"""

import spacy  # type: ignore
from spacy import Language  # type: ignore
from utils.logger import logger

nlp: Language | None = None

try:
    nlp = spacy.load("en_core_web_sm")
except ImportError:
    logger.warning("spaCy not installed, falling back to basic tokenization")
    nlp = None


def tokenize(text: str) -> list[str]:
    """
    Tokenize text using spaCy or fallback to split.

    Args:
        text: Input text

    Returns:
        List of tokens (lemmatized, no stop words, alphabetic only)
    """
    if nlp:
        doc = nlp(text.lower())
        return [token.lemma_ for token in doc if not token.is_stop and token.is_alpha]
    else:
        return text.lower().split()
