-- +goose Up
-- +goose StatementBegin
ALTER TABLE party_members RENAME COLUMN lore_mastery TO knowledge;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE party_members RENAME COLUMN knowledge TO lore_mastery;
-- +goose StatementEnd
