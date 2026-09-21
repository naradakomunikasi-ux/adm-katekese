CREATE UNIQUE INDEX IF NOT EXISTS uq_approvals_one_submitted_type
  ON approvals(participant_id,program_id,approval_type)
  WHERE status='SUBMITTED';
CREATE INDEX IF NOT EXISTS idx_approvals_program_status_created
  ON approvals(program_id,status,created_at DESC);
