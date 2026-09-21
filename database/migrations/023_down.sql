BEGIN;
DROP TRIGGER IF EXISTS trg_approval_enrollment ON approvals;
DROP FUNCTION IF EXISTS enforce_approval_enrollment();
DROP INDEX IF EXISTS idx_approvals_participant_program_status;
COMMIT;
