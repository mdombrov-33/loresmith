-- +goose Up
-- +goose StatementBegin
ALTER TABLE worlds ADD COLUMN image_url VARCHAR(500);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE worlds DROP COLUMN image_url;
-- +goose StatementEnd
