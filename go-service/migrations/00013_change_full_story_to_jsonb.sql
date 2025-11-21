-- +goose Up
-- +goose StatementBegin
ALTER TABLE worlds ALTER COLUMN full_story TYPE JSONB USING full_story::jsonb;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE worlds ALTER COLUMN full_story TYPE TEXT USING full_story::text;
-- +goose StatementEnd
