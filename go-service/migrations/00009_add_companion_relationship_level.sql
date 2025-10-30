-- +goose Up
ALTER TABLE party_members
ADD COLUMN relationship_level INT DEFAULT 0;

COMMENT ON COLUMN party_members.relationship_level IS 'Companion affection/trust level: -100 (hostile) to +100 (devoted). NULL for protagonist (no self-relationship). Changes based on story choices and shared experiences.';

-- +goose Down
ALTER TABLE party_members
DROP COLUMN relationship_level;
