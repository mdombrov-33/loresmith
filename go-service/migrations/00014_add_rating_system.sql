-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS world_ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    world_id BIGINT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, world_id)
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_world_ratings_world_id ON world_ratings(world_id);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_world_ratings_user_id ON world_ratings(user_id);
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE worlds ADD COLUMN rating DECIMAL(3,2) DEFAULT NULL;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_worlds_rating ON worlds(rating);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_worlds_rating;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE worlds DROP COLUMN IF EXISTS rating;
-- +goose StatementEnd

-- +goose StatementBegin
DROP INDEX IF EXISTS idx_world_ratings_user_id;
-- +goose StatementEnd

-- +goose StatementBegin
DROP INDEX IF EXISTS idx_world_ratings_world_id;
-- +goose StatementEnd

-- +goose StatementBegin
DROP TABLE IF EXISTS world_ratings;
-- +goose StatementEnd
