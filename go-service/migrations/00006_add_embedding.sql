-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE worlds ADD COLUMN embedding_local vector(768);  -- For Ollama (nomic-embed-text)
ALTER TABLE worlds ADD COLUMN embedding_prod vector(1536);   -- For OpenRouter (text-embedding-3-small)

CREATE INDEX worlds_embedding_local_idx ON worlds USING hnsw (embedding_local vector_cosine_ops);
CREATE INDEX worlds_embedding_prod_idx ON worlds USING hnsw (embedding_prod vector_cosine_ops);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS worlds_embedding_prod_idx;
DROP INDEX IF EXISTS worlds_embedding_local_idx;
ALTER TABLE worlds DROP COLUMN IF EXISTS embedding_prod;
ALTER TABLE worlds DROP COLUMN IF EXISTS embedding_local;
DROP EXTENSION IF EXISTS vector;
-- +goose StatementEnd