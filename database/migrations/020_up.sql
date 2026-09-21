CREATE TABLE IF NOT EXISTS user_program_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_id, batch_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_program_assignment_program_scope
  ON user_program_assignments(user_id, program_id)
  WHERE batch_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_program_assignments_user_active
  ON user_program_assignments(user_id, active, program_id, batch_id);
CREATE INDEX IF NOT EXISTS idx_user_program_assignments_program_batch
  ON user_program_assignments(program_id, batch_id, active);
