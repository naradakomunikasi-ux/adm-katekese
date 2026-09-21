DROP INDEX IF EXISTS idx_participant_programs_participant_status;
-- Backfilled enrollment rows are intentionally retained on rollback because deleting them would be destructive.
-- The application rollback returns to legacy read/write behavior while preserving enrollment data.
