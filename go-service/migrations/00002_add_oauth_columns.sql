-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local';
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP COLUMN IF EXISTS provider;
ALTER TABLE users DROP COLUMN IF EXISTS provider_id;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
-- +goose StatementEnd