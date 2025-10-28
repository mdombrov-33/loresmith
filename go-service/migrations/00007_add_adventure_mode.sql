-- +goose Up
-- +goose StatementBegin
ALTER TABLE worlds
ADD COLUMN visibility VARCHAR(20) DEFAULT 'private';
COMMENT ON COLUMN worlds.visibility IS 'Who can see this world: private (only creator), published (anyone can search)';

COMMENT ON COLUMN worlds.status IS 'Play state: draft (never played), active (has active sessions), completed (all sessions done)';
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS adventure_sessions (
    id BIGSERIAL PRIMARY KEY,
    world_id BIGINT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'initializing',
    -- Status values: 'initializing', 'active', 'completed', 'failed'

    current_scene_index INT DEFAULT 0,
    current_act INT DEFAULT 1,

    session_state JSONB,
    -- {
    --   "scene_outcomes": [...],
    --   "story_flags": {"found_secret": true, ...},
    --   "quest_progress": 0.65
    -- }

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_adventure_sessions_world_id ON adventure_sessions(world_id);
CREATE INDEX idx_adventure_sessions_user_id ON adventure_sessions(user_id);
CREATE INDEX idx_adventure_sessions_status ON adventure_sessions(status);

COMMENT ON TABLE adventure_sessions IS 'Individual adventure playthroughs of worlds';
COMMENT ON COLUMN adventure_sessions.status IS 'Session state: initializing, active, completed, failed';
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS party_members (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES adventure_sessions(id) ON DELETE CASCADE,

    -- For protagonist: references lore_pieces.id (the world character)
    -- For companions: NULL (companion is generated, not from lore_pieces)
    lore_character_id BIGINT REFERENCES lore_pieces(id) ON DELETE SET NULL,

    is_protagonist BOOLEAN DEFAULT false,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    relationship_to_protagonist TEXT,
    -- e.g., "Old friend from the Under-Market", "Reluctant ally", NULL for protagonist

    max_hp INT NOT NULL,
    current_hp INT NOT NULL,
    stress INT DEFAULT 0,

    lore_mastery INT DEFAULT 10,
    empathy INT DEFAULT 10,
    resilience INT DEFAULT 10,
    creativity INT DEFAULT 10,
    influence INT DEFAULT 10,
    perception INT DEFAULT 10,

    skills TEXT,
    flaw TEXT,
    personality TEXT,
    appearance TEXT,

    -- Display order in party UI (0 = protagonist, 1-3 = companions)
    position INT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_party_members_session_id ON party_members(session_id);
CREATE INDEX idx_party_members_lore_character_id ON party_members(lore_character_id);

COMMENT ON TABLE party_members IS 'Characters in a player''s adventure party (protagonist + companions)';
COMMENT ON COLUMN party_members.lore_character_id IS 'FK to lore_pieces if protagonist; NULL if generated companion';
COMMENT ON COLUMN party_members.is_protagonist IS 'True for the main character; death causes game over';
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES adventure_sessions(id) ON DELETE CASCADE,

    -- NULL = shared party inventory
    -- If set = character-specific inventory
    party_member_id BIGINT REFERENCES party_members(id) ON DELETE CASCADE,

    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    item_type VARCHAR(50),
    -- Types: 'consumable', 'equipment', 'quest_item', 'crafting'

    item_effect JSONB,
    -- Examples:
    -- {"type": "heal", "value": 20}
    -- {"type": "stress_relief", "value": 10}
    -- {"type": "stat_buff", "stat": "influence", "value": 2, "duration": "permanent"}

    quantity INT DEFAULT 1,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_items_session_id ON inventory_items(session_id);
CREATE INDEX idx_inventory_items_party_member_id ON inventory_items(party_member_id);

COMMENT ON TABLE inventory_items IS 'Items in party or character inventory during adventure';
COMMENT ON COLUMN inventory_items.party_member_id IS 'NULL for shared party inventory; set for character-specific items';
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS scene_log (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES adventure_sessions(id) ON DELETE CASCADE,

    scene_index INT NOT NULL,
    beat_index INT NOT NULL,

    narrative TEXT NOT NULL,
    choice_made VARCHAR(255),

    party_member_id BIGINT REFERENCES party_members(id) ON DELETE SET NULL,
    -- Which character attempted the action

    attribute_used VARCHAR(50),
    -- 'lore_mastery', 'empathy', 'resilience', 'creativity', 'influence', 'perception'

    roll_result INT,
    -- The d20 roll (1-20)

    modifier INT,
    -- Attribute modifier

    dc INT,
    -- Difficulty Class

    outcome VARCHAR(20),
    -- 'success', 'partial', 'failure', 'critical_success', 'critical_failure'

    consequences JSONB,
    -- {"hp_change": -15, "stress_change": 10, "items_gained": [...], "items_lost": [...]}

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scene_log_session_id ON scene_log(session_id);
CREATE INDEX idx_scene_log_scene_index ON scene_log(scene_index);

COMMENT ON TABLE scene_log IS 'Log of all choices and outcomes during adventure';
COMMENT ON COLUMN scene_log.outcome IS 'Roll outcome: success, partial, failure, critical_success, critical_failure';
-- +goose StatementEnd

-- +goose StatementBegin
-- Scene Batches (cache for generated scene skeletons)
CREATE TABLE IF NOT EXISTS scene_batches (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES adventure_sessions(id) ON DELETE CASCADE,

    act_number INT NOT NULL,
    -- Act 1, Act 2, etc. (each act = 3 scenes)

    scenes JSONB NOT NULL,
    -- Array of scene skeleton objects
    -- [
    --   {
    --     "scene_number": 1,
    --     "core_challenge": "...",
    --     "challenge_type": "stealth",
    --     "key_npcs": [...],
    --     "location": "...",
    --     "stakes": "...",
    --     "continuity_hooks": {...},
    --     "beats": [...]
    --   },
    --   ... (3 scenes per batch)
    -- ]

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scene_batches_session_id ON scene_batches(session_id);
CREATE INDEX idx_scene_batches_act_number ON scene_batches(act_number);
CREATE UNIQUE INDEX idx_scene_batches_session_act ON scene_batches(session_id, act_number);

COMMENT ON TABLE scene_batches IS 'Pre-generated scene skeletons for each act (batch of 3 scenes)';
COMMENT ON COLUMN scene_batches.scenes IS 'JSONB array of 3 scene skeleton objects';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Drop tables in reverse order (respect foreign keys)
DROP INDEX IF EXISTS idx_scene_batches_session_act;
DROP INDEX IF EXISTS idx_scene_batches_act_number;
DROP INDEX IF EXISTS idx_scene_batches_session_id;
DROP TABLE IF EXISTS scene_batches;

DROP INDEX IF EXISTS idx_scene_log_scene_index;
DROP INDEX IF EXISTS idx_scene_log_session_id;
DROP TABLE IF EXISTS scene_log;

DROP INDEX IF EXISTS idx_inventory_items_party_member_id;
DROP INDEX IF EXISTS idx_inventory_items_session_id;
DROP TABLE IF EXISTS inventory_items;

DROP INDEX IF EXISTS idx_party_members_lore_character_id;
DROP INDEX IF EXISTS idx_party_members_session_id;
DROP TABLE IF EXISTS party_members;

DROP INDEX IF EXISTS idx_adventure_sessions_status;
DROP INDEX IF EXISTS idx_adventure_sessions_user_id;
DROP INDEX IF EXISTS idx_adventure_sessions_world_id;
DROP TABLE IF EXISTS adventure_sessions;


ALTER TABLE worlds
DROP COLUMN IF EXISTS visibility;
-- +goose StatementEnd
