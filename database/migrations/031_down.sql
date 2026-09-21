DROP INDEX IF EXISTS idx_tasks_assignee_status_due;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_visibility_check;
ALTER TABLE tasks DROP COLUMN IF EXISTS visibility;
ALTER TABLE tasks DROP COLUMN IF EXISTS created_by;
ALTER TABLE tasks DROP COLUMN IF EXISTS assigned_to;
