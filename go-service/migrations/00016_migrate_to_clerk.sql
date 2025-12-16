-- +goose Up
-- +goose StatementBegin

-- Add Clerk user ID column
ALTER TABLE users ADD COLUMN clerk_user_id VARCHAR(255) UNIQUE;

-- Drop old auth columns (password, OAuth provider info)
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE users DROP COLUMN IF EXISTS provider;
ALTER TABLE users DROP COLUMN IF EXISTS provider_id;

-- Drop password reset tokens table (Clerk handles this)
DROP TABLE IF EXISTS password_reset_tokens;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Recreate password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Add back old auth columns
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'local';
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255);

-- Drop Clerk column
ALTER TABLE users DROP COLUMN clerk_user_id;

-- +goose StatementEnd
