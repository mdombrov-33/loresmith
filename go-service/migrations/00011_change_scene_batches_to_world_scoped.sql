-- +goose Up
-- +goose StatementBegin
-- Change scene_batches from session-scoped to world-scoped
-- This allows all players of the same world to share the same encounters

-- Drop old indexes and constraints
DROP INDEX IF EXISTS idx_scene_batches_session_act;
DROP INDEX IF EXISTS idx_scene_batches_session_id;

-- Drop the foreign key constraint on session_id
ALTER TABLE scene_batches
DROP CONSTRAINT IF EXISTS scene_batches_session_id_fkey;

-- Drop the session_id column
ALTER TABLE scene_batches
DROP COLUMN IF EXISTS session_id;

-- Add world_id column
ALTER TABLE scene_batches
ADD COLUMN world_id BIGINT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE;

-- Recreate indexes with world_id
CREATE INDEX idx_scene_batches_world_id ON scene_batches(world_id);
CREATE UNIQUE INDEX idx_scene_batches_world_act ON scene_batches(world_id, act_number);

-- Update comments to reflect world-scoped approach
COMMENT ON TABLE scene_batches IS 'Pre-generated scene skeletons per world (shared across all sessions of same world)';
COMMENT ON COLUMN scene_batches.world_id IS 'Batches are scoped to world, not session. All players face same encounters for consistency in reviews/ratings.';
COMMENT ON COLUMN scene_batches.scenes IS 'JSONB array of 3 scene skeleton objects with all outcome branches pre-generated';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Revert back to session-scoped

-- Drop world-scoped indexes
DROP INDEX IF EXISTS idx_scene_batches_world_act;
DROP INDEX IF EXISTS idx_scene_batches_world_id;

-- Drop world_id foreign key constraint
ALTER TABLE scene_batches
DROP CONSTRAINT IF EXISTS scene_batches_world_id_fkey;

-- Drop world_id column
ALTER TABLE scene_batches
DROP COLUMN IF EXISTS world_id;

-- Add session_id column back
ALTER TABLE scene_batches
ADD COLUMN session_id BIGINT NOT NULL REFERENCES adventure_sessions(id) ON DELETE CASCADE;

-- Recreate old indexes
CREATE INDEX idx_scene_batches_session_id ON scene_batches(session_id);
CREATE UNIQUE INDEX idx_scene_batches_session_act ON scene_batches(session_id, act_number);

-- Revert comments
COMMENT ON TABLE scene_batches IS 'Pre-generated scene skeletons for each act (batch of 3 scenes)';
COMMENT ON COLUMN scene_batches.scenes IS 'JSONB array of 3 scene skeleton objects';
-- +goose StatementEnd
