-- +goose Up
-- +goose StatementBegin
-- Update party_members table structure to match current character generation format

-- 1. Change skills to JSONB array
ALTER TABLE party_members
ALTER COLUMN skills TYPE JSONB USING '[]'::JSONB;

COMMENT ON COLUMN party_members.skills IS 'Character skills as JSONB array: ["Battle Cry Fury", "Runic Tattoo Reading", ...]';

-- 2. Rename personality to personality_traits and change to JSONB array
ALTER TABLE party_members
RENAME COLUMN personality TO personality_traits;

ALTER TABLE party_members
ALTER COLUMN personality_traits TYPE JSONB USING '[]'::JSONB;

COMMENT ON COLUMN party_members.personality_traits IS 'Set of 3 personality traits: ["Fearless", "Honorable", "Competitive"]';

-- 3. Change flaw from TEXT to JSONB
ALTER TABLE party_members
ALTER COLUMN flaw TYPE JSONB USING NULL;

COMMENT ON COLUMN party_members.flaw IS 'Character flaw as JSONB: {name, description, trigger (comma-separated), penalty (comma-separated), duration}';

-- 4. Add portrait_url column for character portraits (R2/S3-compatible URL)
ALTER TABLE party_members
ADD COLUMN image_portrait VARCHAR(500);

COMMENT ON COLUMN party_members.image_portrait IS 'Portrait image URL from R2 (S3-compatible): https://bucket-name.account-id.r2.cloudflarestorage.com/portraits/{world_id}/{uuid}_portrait.png';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Remove portrait_url
ALTER TABLE party_members
DROP COLUMN IF EXISTS portrait_url;

-- Revert flaw to TEXT
ALTER TABLE party_members
ALTER COLUMN flaw TYPE TEXT USING
    CASE
        WHEN flaw IS NULL THEN NULL
        WHEN jsonb_typeof(flaw) = 'object' THEN flaw->>'name'
        ELSE flaw::TEXT
    END;

-- Revert personality_traits to personality TEXT
ALTER TABLE party_members
ALTER COLUMN personality_traits TYPE TEXT USING NULL;

ALTER TABLE party_members
RENAME COLUMN personality_traits TO personality;

-- Revert skills to TEXT
ALTER TABLE party_members
ALTER COLUMN skills TYPE TEXT USING NULL;

-- +goose StatementEnd
