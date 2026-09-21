BEGIN;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_period_check;
ALTER TABLE programs ADD CONSTRAINT programs_period_check CHECK(start_date IS NULL OR end_date IS NULL OR end_date >= start_date);
CREATE INDEX IF NOT EXISTS idx_programs_period ON programs(start_date,end_date) WHERE status IN('PUBLISHED','ACTIVE');
COMMIT;
