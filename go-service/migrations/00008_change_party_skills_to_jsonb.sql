-- +goose Up
ALTER TABLE party_members
ALTER COLUMN skills TYPE JSONB USING
    CASE
        WHEN skills IS NULL OR skills = '' THEN '[]'::JSONB
        WHEN skills::TEXT LIKE '[%' THEN skills::JSONB
        ELSE json_build_array(json_build_object('name', skills, 'level', 50))::JSONB  -- Convert plain text
    END;

COMMENT ON COLUMN party_members.skills IS 'Character skills as JSONB array: [{"name": "Combat", "level": 85}]';
-- +goose Down
-- Revert to TEXT (lossy conversion - just concatenate skill names)
ALTER TABLE party_members
ALTER COLUMN skills TYPE TEXT USING
    CASE
        WHEN skills IS NULL THEN NULL
        ELSE (
            SELECT string_agg(skill->>'name', ', ')
            FROM jsonb_array_elements(skills) AS skill
        )
    END;
