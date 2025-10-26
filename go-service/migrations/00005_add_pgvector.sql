-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS vector;

-- Supports both 1536-dim (OpenRouter) and 768-dim (local) embeddings out of the box
ALTER TABLE worlds ADD COLUMN embedding vector;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS worlds_embedding_idx;
ALTER TABLE worlds DROP COLUMN embedding;
DROP EXTENSION IF EXISTS vector;
-- +goose StatementEnd