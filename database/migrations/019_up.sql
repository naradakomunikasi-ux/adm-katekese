-- RC38: make participant_programs the canonical participant-to-program enrollment relation.
-- Legacy participants.program_name / participants.batch_id are retained temporarily for rollback compatibility,
-- but application reads/writes are moved to participant_programs.

INSERT INTO participant_programs(participant_id, program_id, batch_id, status)
SELECT p.id,
       pr.id,
       CASE WHEN b.id IS NOT NULL AND b.program_id = pr.id THEN b.id ELSE NULL END,
       CASE p.status
         WHEN 'COMPLETED' THEN 'COMPLETED'
         WHEN 'CANCELLED' THEN 'CANCELLED'
         WHEN 'REGISTERED' THEN 'REGISTERED'
         ELSE 'ACTIVE'
       END
FROM participants p
JOIN programs pr ON lower(trim(pr.name)) = lower(trim(p.program_name))
LEFT JOIN batches b ON b.id = p.batch_id
ON CONFLICT (participant_id, program_id) DO UPDATE
SET batch_id = COALESCE(EXCLUDED.batch_id, participant_programs.batch_id);

CREATE INDEX IF NOT EXISTS idx_participant_programs_participant_status
  ON participant_programs(participant_id, status);
