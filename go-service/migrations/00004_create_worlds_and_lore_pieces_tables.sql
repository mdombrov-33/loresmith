-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS worlds (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- "draft", "adventure"
    theme VARCHAR(100) NOT NULL,
    full_story TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS lore_pieces (
    id BIGSERIAL PRIMARY KEY,
    world_id BIGINT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- "character", "setting" etc.
    name VARCHAR(255) NOT NULL,
    description TEXT,
    details JSONB, -- for stats, appearance, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_worlds_user_id ON worlds(user_id);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_worlds_status ON worlds(status);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_lore_pieces_world_id ON lore_pieces(world_id);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_lore_pieces_type ON lore_pieces(type);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_lore_pieces_type;
DROP INDEX IF EXISTS idx_lore_pieces_world_id;
DROP INDEX IF EXISTS idx_worlds_status;
DROP INDEX IF EXISTS idx_worlds_user_id;
DROP TABLE lore_pieces;
DROP TABLE worlds;
-- +goose StatementEnd