CREATE OR REPLACE VIEW report_program_pastoral_summary AS
SELECT p.id,
       p.name,
       p.status,
       COALESCE(enrollment.participants,0)::int AS participants,
       COALESCE(enrollment.attendance_average,0)::numeric AS attendance_average,
       COALESCE(meeting_stats.meetings,0)::int AS meetings,
       COALESCE(cert_stats.certificates_ready,0)::int AS certificates_ready
FROM programs p
LEFT JOIN LATERAL (
  SELECT count(DISTINCT pp.participant_id)::int AS participants,
         round(COALESCE(avg(pa.attendance_percent),0),1) AS attendance_average
  FROM participant_programs pp
  JOIN participants pa ON pa.id=pp.participant_id
  WHERE pp.program_id=p.id AND pp.status<>'CANCELLED'
) enrollment ON true
LEFT JOIN LATERAL (
  SELECT count(*)::int AS meetings
  FROM meetings m JOIN batches b ON b.id=m.batch_id
  WHERE b.program_id=p.id AND m.status<>'ARCHIVED'
) meeting_stats ON true
LEFT JOIN LATERAL (
  SELECT count(*) FILTER(WHERE c.status IN('APPROVED','ISSUED'))::int AS certificates_ready
  FROM certificates c WHERE c.program_id=p.id
) cert_stats ON true;

CREATE INDEX IF NOT EXISTS idx_payments_program_status_due
ON payments(program_id,status,due_date);
