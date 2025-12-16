-- +goose Up
-- +goose StatementBegin
ALTER TABLE worlds ADD COLUMN active_image_type VARCHAR(20) DEFAULT 'portrait';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE worlds DROP COLUMN active_image_type;
-- +goose StatementEnd
