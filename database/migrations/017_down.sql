BEGIN;
DROP INDEX IF EXISTS idx_programs_period;
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_period_check;
ALTER TABLE programs DROP COLUMN IF EXISTS end_date;
ALTER TABLE programs DROP COLUMN IF EXISTS start_date;
COMMIT;
