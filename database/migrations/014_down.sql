BEGIN;
DROP INDEX IF EXISTS idx_payments_due_status;
DROP INDEX IF EXISTS idx_approvals_participant_status;
DROP INDEX IF EXISTS idx_documents_participant_status;
ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_status_check;
ALTER TABLE approvals DROP CONSTRAINT IF EXISTS approvals_status_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_verification_status_check;
COMMIT;
