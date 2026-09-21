BEGIN;
DROP INDEX IF EXISTS idx_documents_pending_participant;
DROP INDEX IF EXISTS idx_approvals_submitted_participant;
DROP INDEX IF EXISTS idx_payments_pending_participant;
COMMIT;
