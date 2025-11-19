# Search System Documentation

## Overview

The search system implements a hybrid retrieval approach combining semantic vector search with keyword-based retrieval, enhanced by diversity-aware reranking. It processes user queries through three main stages: preprocessing, fusion retrieval, and Dartboard diversity reranking.

## Components

### 1. Query Preprocessing

**Purpose**: Transforms user queries into more effective search terms for semantic matching.

**How it works**:

- Uses LLM (LangChain) to rewrite abstract or vague queries into detailed, context-rich descriptions.
- Skips preprocessing for short queries (≤2 words) to avoid hallucination and preserve exact matches.
- Example: "lost sibling" → "A poignant narrative set in a tragic realm where a protagonist suffers the devastating loss of a sibling, grappling with grief and emotional turmoil amidst a backdrop of familial bonds and irrevocable separation."

**Why**: Improves semantic search by expanding queries with relevant context, but preserves precision for specific searches.

### 2. Fusion Retrieval

**Purpose**: Combines vector-based semantic similarity with BM25 keyword matching for robust relevance scoring.

**How it works**:

- **Vector Search**: Uses pre-computed embeddings (768-dim for Ollama, 1536-dim for OpenAI) to find semantically similar worlds via cosine similarity.
- **BM25 Keyword Search**: Tokenizes world content using spaCy (lemmatization, stop word removal) and scores keyword matches using the BM25 algorithm.
- **Fusion**: Weighted combination of scores: `fused_score = alpha * vector_score + (1 - alpha) * normalized_bm25_score`
  - Default alpha = 0.7 (70% vector, 30% BM25)
  - BM25 scores normalized via min-max scaling across results.
- **spaCy Tokenization**: Handles proper names, stemming, and stop words better than basic splitting.

**Why**: Balances semantic understanding (vector) with exact keyword matching (BM25), improving recall for both thematic and specific queries.

### 3. Dartboard RAG

**Purpose**: Applies diversity-aware reranking to prevent redundant results and promote variety in search outcomes.

**How it works**:

- **Greedy Selection**: Iteratively selects results that maximize relevance while penalizing similarity to already selected results.
- **Diversity Calculation**: Uses pairwise embedding distances (cosine similarity) to measure result diversity.
- **Scoring**: Combines relevance and diversity: `score = relevance_weight * relevance - diversity_weight * max_similarity_to_selected`
- **Parameters**:
  - `diversity_weight`: Controls diversity emphasis (default 1.0)
  - `relevance_weight`: Controls relevance emphasis (default 1.0)
  - `sigma`: Smoothing parameter for diversity calculation (default 0.1)

**Why**: Ensures search results are not dominated by similar items, providing better coverage of different themes/genres.

## Full Flow

1. **Query Input**: User enters search query (e.g., "cartographer").

2. **Preprocessing**:

   - If query ≤2 words: Skip (preserve exact intent).
   - Else: LLM rewrites to detailed description.

3. **Embedding Generation**:

   - Generate query embedding using configured provider (Ollama/OpenAI).

4. **Vector Search**:

   - Query database for worlds by embedding similarity (top 100).
   - Calculate relevance scores via cosine similarity.

5. **Fusion Retrieval**:

   - Build BM25 index from retrieved worlds.
   - Compute BM25 scores for query tokens.
   - Fuse vector + BM25 scores with weighted combination.
   - Sort by fused relevance.

6. **Dartboard Reranking**:

   - If all worlds have embeddings: Apply diversity reranking.
   - Else: Skip (fallback to fusion results).

7. **Result Ordering**:
   - Frontend sorts by relevance (descending) before pagination.

## Technical Implementation

- **Languages**: Python (gRPC service), Go (REST API), TypeScript (frontend).
- **Dependencies**:
  - `rank-bm25`: BM25 algorithm
  - `scipy`: Log-sum-exp for diversity
  - `spacy` + `en_core_web_sm`: Advanced tokenization
  - `pgvector`: PostgreSQL vector storage/indexing
- **Configuration**:
  - Alpha: Adjustable fusion weight (0.5-0.8 recommended)
  - Provider-specific embedding columns (`embedding_local`/`embedding_prod`)
- **Performance**: Handles 100+ worlds efficiently; diversity scales with result count.

## Benefits

- **Improved Relevance**: Fusion captures both semantic and keyword matches.
- **Better Diversity**: Dartboard prevents result clustering.
- **Robust Search**: Works for exact names, themes, and abstract concepts.
- **Scalable**: Modular design allows tuning per use case.

## Debugging

- **Logs**: Check for preprocessing output, BM25 ranges, fusion details, and Dartboard status.
- **Common Issues**: Missing embeddings (populate via migration), empty queries, tokenization mismatches.
- **Tuning**: Adjust alpha for vector vs. keyword emphasis; modify Dartboard weights for diversity balance.
