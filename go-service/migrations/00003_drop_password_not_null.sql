-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
-- +goose StatementEnd