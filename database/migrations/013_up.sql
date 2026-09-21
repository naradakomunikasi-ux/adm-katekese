BEGIN;
CREATE TABLE IF NOT EXISTS participant_journey_events(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
 event_type TEXT NOT NULL, title TEXT NOT NULL, description TEXT, occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(), created_by UUID REFERENCES users(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_journey_participant_date ON participant_journey_events(participant_id,occurred_at DESC);

CREATE TABLE IF NOT EXISTS pastoral_notes(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
 note TEXT NOT NULL, visibility TEXT NOT NULL DEFAULT 'PASTOR_KATEKIS' CHECK(visibility IN('PASTOR_ONLY','PASTOR_KATEKIS','ADMIN_PASTOR')),
 author_user_id UUID REFERENCES users(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pastoral_notes_participant ON pastoral_notes(participant_id,created_at DESC);

CREATE TABLE IF NOT EXISTS document_requirements(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
 document_type TEXT NOT NULL, description TEXT, required BOOLEAN NOT NULL DEFAULT true, sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(program_id,document_type)
);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS requirement_id UUID REFERENCES document_requirements(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
UPDATE documents SET verification_status='VALID' WHERE verification_status='VERIFIED';

CREATE TABLE IF NOT EXISTS program_payment_settings(
 program_id UUID PRIMARY KEY REFERENCES programs(id) ON DELETE CASCADE, amount NUMERIC(14,2) NOT NULL DEFAULT 0,
 due_date DATE, installment_allowed BOOLEAN NOT NULL DEFAULT false, installment_count INTEGER NOT NULL DEFAULT 1 CHECK(installment_count BETWEEN 1 AND 24),
 payment_method TEXT, notes TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'UNPAID';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS installment_no INTEGER NOT NULL DEFAULT 1;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_payments_program_status ON payments(program_id,status);

ALTER TABLE approvals ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id) ON DELETE SET NULL;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS entity_type TEXT NOT NULL DEFAULT 'PARTICIPANT';
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS reviewer_note TEXT;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
UPDATE approvals SET status='SUBMITTED' WHERE status='PENDING';

CREATE TABLE IF NOT EXISTS certificate_templates(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, program_type TEXT, file_name TEXT, mime_type TEXT,
 variables JSONB NOT NULL DEFAULT '[]'::jsonb, status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN('DRAFT','PUBLISHED','ARCHIVED')),
 created_by UUID REFERENCES users(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS certificate_rules(
 program_id UUID PRIMARY KEY REFERENCES programs(id) ON DELETE CASCADE, attendance_minimum NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK(attendance_minimum BETWEEN 0 AND 100),
 documents_complete BOOLEAN NOT NULL DEFAULT false, payment_required BOOLEAN NOT NULL DEFAULT false, evaluation_required BOOLEAN NOT NULL DEFAULT false,
 pastoral_approval_required BOOLEAN NOT NULL DEFAULT false, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id) ON DELETE SET NULL;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES certificate_templates(id) ON DELETE SET NULL;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_number TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS pdf_content BYTEA;
CREATE UNIQUE INDEX IF NOT EXISTS uq_certificate_number ON certificates(certificate_number) WHERE certificate_number IS NOT NULL;

ALTER TABLE announcements ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS cta_label TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS cta_url TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'DRAFT';
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_announcements_status_publish ON announcements(status,publish_at DESC);

CREATE TABLE IF NOT EXISTS app_settings(
 id INTEGER PRIMARY KEY CHECK(id=1), language TEXT NOT NULL DEFAULT 'id', timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
 date_format TEXT NOT NULL DEFAULT 'DD MMM YYYY', locale TEXT NOT NULL DEFAULT 'id-ID', whatsapp_config JSONB NOT NULL DEFAULT '{}'::jsonb,
 updated_by UUID REFERENCES users(id) ON DELETE SET NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO app_settings(id) VALUES(1) ON CONFLICT(id) DO NOTHING;

ALTER TABLE knowledge_documents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE knowledge_documents ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE knowledge_documents ADD COLUMN IF NOT EXISTS effective_at TIMESTAMPTZ;
ALTER TABLE knowledge_documents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE knowledge_documents DROP CONSTRAINT IF EXISTS knowledge_documents_status_check;
ALTER TABLE knowledge_documents ALTER COLUMN status SET DEFAULT 'DRAFT';
ALTER TABLE knowledge_documents ADD CONSTRAINT knowledge_documents_status_check CHECK(status IN('DRAFT','REVIEW','ACTIVE','ARCHIVED'));
COMMIT;
