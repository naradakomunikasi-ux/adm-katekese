ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_status_check;
ALTER TABLE programs ADD CONSTRAINT programs_status_check CHECK (status IN ('DRAFT','REVIEW','PENDING_APPROVAL','PUBLISHED','ACTIVE','COMPLETED','ARCHIVED'));
ALTER TABLE programs ALTER COLUMN status SET DEFAULT 'DRAFT';
ALTER TABLE programs ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS pic_name TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS capacity INTEGER CHECK (capacity IS NULL OR capacity >= 0);
ALTER TABLE programs ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS program_features (
  program_id UUID PRIMARY KEY REFERENCES programs(id) ON DELETE CASCADE,
  registration_enabled BOOLEAN NOT NULL DEFAULT true,
  document_requirement_enabled BOOLEAN NOT NULL DEFAULT true,
  meeting_enabled BOOLEAN NOT NULL DEFAULT true,
  attendance_enabled BOOLEAN NOT NULL DEFAULT true,
  payment_enabled BOOLEAN NOT NULL DEFAULT false,
  certificate_enabled BOOLEAN NOT NULL DEFAULT false,
  announcement_enabled BOOLEAN NOT NULL DEFAULT true,
  pastoral_approval_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE batches ADD COLUMN IF NOT EXISTS registration_open_at TIMESTAMPTZ;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS registration_close_at TIMESTAMPTZ;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS capacity INTEGER CHECK (capacity IS NULL OR capacity >= 0);

ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_status_check;
ALTER TABLE meetings ADD CONSTRAINT meetings_status_check CHECK (status IN ('DRAFT','PUBLISHED','SCHEDULED','COMPLETED','CANCELLED','ARCHIVED'));
ALTER TABLE meetings ALTER COLUMN status SET DEFAULT 'DRAFT';
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS theme TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS audience_group TEXT CHECK (audience_group IS NULL OR audience_group IN ('REMAJA','OMK','DEWASA','ALL'));
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS attendance_opens_at TIMESTAMPTZ;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS attendance_closes_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS meeting_teachers (
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  audience_group TEXT NOT NULL DEFAULT 'ALL' CHECK (audience_group IN ('REMAJA','OMK','DEWASA','ALL')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (meeting_id, teacher_name, audience_group)
);

INSERT INTO permissions(code,description) VALUES
 ('program:read','Read programs and batches'),
 ('program:write','Create and update programs and batches'),
 ('meeting:write','Create and update meetings and teacher assignments')
ON CONFLICT(code) DO NOTHING;

INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON
 (r.code='ADMIN_KATEKESE' AND p.code IN ('program:read','program:write','meeting:write')) OR
 (r.code='ADMIN_PROGRAM' AND p.code IN ('program:read','program:write','meeting:write')) OR
 (r.code IN ('KATEKIS','PASTOR') AND p.code='program:read')
ON CONFLICT DO NOTHING;

INSERT INTO program_features(program_id)
SELECT id FROM programs ON CONFLICT(program_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_programs_status_publish ON programs(status,publish_at);
CREATE INDEX IF NOT EXISTS idx_meeting_teachers_name ON meeting_teachers(teacher_name);
