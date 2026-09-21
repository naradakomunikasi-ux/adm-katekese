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
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_participant_id_certificate_type_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_certificates_participant_program_type ON certificates(participant_id,program_id,certificate_type);
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
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS issued_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS revoked_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS revoke_reason TEXT;
CREATE INDEX IF NOT EXISTS idx_certificates_program_status ON certificates(program_id,status);

CREATE OR REPLACE FUNCTION enforce_payment_enrollment() RETURNS trigger AS $$
BEGIN
  IF NEW.program_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM participant_programs pp
    WHERE pp.participant_id=NEW.participant_id AND pp.program_id=NEW.program_id AND pp.status<>'CANCELLED'
  ) THEN
    RAISE EXCEPTION 'PAYMENT_ENROLLMENT_INVARIANT' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_payment_enrollment ON payments;
CREATE TRIGGER trg_payment_enrollment BEFORE INSERT OR UPDATE OF participant_id,program_id ON payments FOR EACH ROW EXECUTE FUNCTION enforce_payment_enrollment();
CREATE INDEX IF NOT EXISTS idx_payments_participant_program_status ON payments(participant_id,program_id,status,created_at DESC);

CREATE OR REPLACE FUNCTION enforce_document_requirement_enrollment() RETURNS trigger AS $$
DECLARE requirement_program UUID;
BEGIN
  IF NEW.requirement_id IS NULL THEN RETURN NEW; END IF;
  SELECT program_id INTO requirement_program FROM document_requirements WHERE id=NEW.requirement_id;
  IF requirement_program IS NULL OR NOT EXISTS (
    SELECT 1 FROM participant_programs pp WHERE pp.participant_id=NEW.participant_id AND pp.program_id=requirement_program AND pp.status<>'CANCELLED'
  ) THEN RAISE EXCEPTION 'DOCUMENT_REQUIREMENT_ENROLLMENT_INVARIANT' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_document_requirement_enrollment ON documents;
CREATE TRIGGER trg_document_requirement_enrollment BEFORE INSERT OR UPDATE OF participant_id,requirement_id ON documents FOR EACH ROW EXECUTE FUNCTION enforce_document_requirement_enrollment();
CREATE INDEX IF NOT EXISTS idx_documents_participant_requirement_status ON documents(participant_id,requirement_id,verification_status,created_at DESC);

ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_audience_check;
ALTER TABLE announcements ADD CONSTRAINT announcements_audience_check CHECK (audience IN ('ALL','PESERTA','KATEKIS','PASTOR','ADMIN'));
CREATE INDEX IF NOT EXISTS idx_announcements_public_audience_publish ON announcements(audience,status,publish_at DESC);

ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_schedule_publish_at_check;
ALTER TABLE announcements ADD CONSTRAINT announcements_schedule_publish_at_check CHECK (status <> 'SCHEDULED' OR publish_at IS NOT NULL);
ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_expiry_after_publish_check;
ALTER TABLE announcements ADD CONSTRAINT announcements_expiry_after_publish_check CHECK (expires_at IS NULL OR publish_at IS NULL OR expires_at > publish_at);
CREATE INDEX IF NOT EXISTS idx_announcements_due_schedule ON announcements(status,publish_at) WHERE status='SCHEDULED';

CREATE INDEX IF NOT EXISTS idx_certificates_participant_status_created ON certificates(participant_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journey_events_participant_occurred ON participant_journey_events(participant_id,occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_pastoral_notes_participant_visibility_created ON pastoral_notes(participant_id,visibility,created_at DESC);

CREATE OR REPLACE VIEW report_program_pastoral_summary AS
SELECT p.id,p.name,p.status,
       COALESCE(enrollment.participants,0)::int AS participants,
       COALESCE(enrollment.attendance_average,0)::numeric AS attendance_average,
       COALESCE(meeting_stats.meetings,0)::int AS meetings,
       COALESCE(cert_stats.certificates_ready,0)::int AS certificates_ready
FROM programs p
LEFT JOIN LATERAL (SELECT count(DISTINCT pp.participant_id)::int participants,round(COALESCE(avg(pa.attendance_percent),0),1) attendance_average FROM participant_programs pp JOIN participants pa ON pa.id=pp.participant_id WHERE pp.program_id=p.id AND pp.status<>'CANCELLED') enrollment ON true
LEFT JOIN LATERAL (SELECT count(*)::int meetings FROM meetings m JOIN batches b ON b.id=m.batch_id WHERE b.program_id=p.id AND m.status<>'ARCHIVED') meeting_stats ON true
LEFT JOIN LATERAL (SELECT count(*) FILTER(WHERE c.status IN('APPROVED','ISSUED'))::int certificates_ready FROM certificates c WHERE c.program_id=p.id) cert_stats ON true;
CREATE INDEX IF NOT EXISTS idx_payments_program_status_due ON payments(program_id,status,due_date);

CREATE INDEX IF NOT EXISTS idx_payments_pending_participant ON payments(participant_id,due_date,created_at DESC) WHERE status IN ('UNPAID','PARTIAL');
CREATE INDEX IF NOT EXISTS idx_approvals_submitted_participant ON approvals(participant_id,created_at DESC) WHERE status='SUBMITTED';
CREATE INDEX IF NOT EXISTS idx_documents_pending_participant ON documents(participant_id,created_at DESC) WHERE verification_status IN ('PENDING','UNDER_REVIEW','REVISION_REQUIRED');

CREATE TABLE IF NOT EXISTS runtime_schema_contract (
  id smallint PRIMARY KEY CHECK (id = 1),
  schema_generation integer NOT NULL CHECK (schema_generation > 0),
  release_floor text NOT NULL CHECK (release_floor ~ '^1\.0\.0-rc[0-9]+$'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO runtime_schema_contract(id,schema_generation,release_floor,updated_at)
VALUES(1,41,'1.0.0-rc62',now())
ON CONFLICT(id) DO UPDATE SET schema_generation=EXCLUDED.schema_generation, release_floor=EXCLUDED.release_floor, updated_at=now();
