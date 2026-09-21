CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'REGISTERED',
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  attendance_percent INTEGER NOT NULL DEFAULT 0 CHECK (attendance_percent BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  verification_status TEXT NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  approval_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'P1' CHECK (priority IN ('P0','P1','P2')),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','DONE')),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_to UUID,
  created_by UUID,
  visibility TEXT NOT NULL DEFAULT 'ASSIGNEE' CHECK (visibility IN ('ASSIGNEE','INTERNAL')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status);
CREATE INDEX IF NOT EXISTS idx_documents_verification ON documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_payments_verification ON payments(verification_status);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);

ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_extension TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS size_bytes BIGINT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sha256 TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS content BYTEA;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_binary_all_or_none_check;
ALTER TABLE documents ADD CONSTRAINT documents_binary_all_or_none_check CHECK ((file_name IS NULL AND file_extension IS NULL AND mime_type IS NULL AND size_bytes IS NULL AND sha256 IS NULL AND content IS NULL) OR (file_name IS NOT NULL AND file_extension IS NOT NULL AND mime_type IS NOT NULL AND size_bytes > 0 AND size_bytes <= 62914560 AND sha256 IS NOT NULL AND content IS NOT NULL));
CREATE INDEX IF NOT EXISTS idx_documents_participant_requirement_created ON documents(participant_id,requirement_id,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_documents_participant_requirement_sha256 ON documents(participant_id,requirement_id,sha256) WHERE sha256 IS NOT NULL;
