BEGIN;
CREATE INDEX IF NOT EXISTS idx_payments_pending_participant
  ON payments(participant_id, due_date, created_at DESC)
  WHERE status IN ('UNPAID','PARTIAL');
CREATE INDEX IF NOT EXISTS idx_approvals_submitted_participant
  ON approvals(participant_id, created_at DESC)
  WHERE status='SUBMITTED';
CREATE INDEX IF NOT EXISTS idx_documents_pending_participant
  ON documents(participant_id, created_at DESC)
  WHERE verification_status IN ('PENDING','UNDER_REVIEW','REVISION_REQUIRED');
COMMIT;
