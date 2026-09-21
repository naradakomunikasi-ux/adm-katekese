ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'ASSIGNEE';
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_visibility_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_visibility_check CHECK (visibility IN ('ASSIGNEE','INTERNAL'));
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status_due ON tasks(assigned_to,status,due_at);
