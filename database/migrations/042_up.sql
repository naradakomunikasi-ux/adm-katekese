CREATE TABLE IF NOT EXISTS program_types (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 code TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 category TEXT,
 active BOOLEAN NOT NULL DEFAULT true,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO program_types(code,name,category) VALUES
 ('KATEKUMEN','Katekumen / Baptis Dewasa','Sakramen'),
 ('BAPTIS_BAYI','Baptis Bayi','Sakramen'),
 ('KOMUNI_PERTAMA','Komuni Pertama','Sakramen'),
 ('KRISMA','Sakramen Krisma','Sakramen'),
 ('MRT','Persiapan Perkawinan / MRT','Sakramen'),
 ('BINA_IMAN_ANAK','Bina Iman Anak','Pembinaan'),
 ('BINA_IMAN_REMAJA','Bina Iman Remaja','Pembinaan'),
 ('OMK','OMK','Pembinaan'),
 ('REKOLEKSI_RETRET','Rekoleksi / Retret','Pembinaan'),
 ('SEMINAR','Seminar','Katekese Tematik'),
 ('WEBINAR','Webinar / Katekese Tematik','Katekese Tematik'),
 ('CUSTOM','Custom Program','Pelayanan')
ON CONFLICT(code) DO UPDATE SET name=excluded.name,category=excluded.category,active=true,updated_at=now();

ALTER TABLE programs ADD COLUMN IF NOT EXISTS program_type_id UUID REFERENCES program_types(id);
UPDATE programs p SET program_type_id=pt.id FROM program_types pt WHERE p.program_type_id IS NULL AND pt.code='CUSTOM';

CREATE TABLE IF NOT EXISTS program_journey_stages (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
 stage_key TEXT NOT NULL,
 label TEXT NOT NULL,
 sort_order INTEGER NOT NULL CHECK(sort_order>0),
 required BOOLEAN NOT NULL DEFAULT true,
 approval_required BOOLEAN NOT NULL DEFAULT false,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(program_id,stage_key),
 UNIQUE(program_id,sort_order)
);
CREATE INDEX IF NOT EXISTS ix_program_journey_stages_program ON program_journey_stages(program_id,sort_order);

INSERT INTO runtime_schema_contract(id,schema_generation,release_floor,updated_at)
VALUES(1,42,'1.0.0-rc64',now())
ON CONFLICT(id) DO UPDATE SET schema_generation=EXCLUDED.schema_generation, release_floor=EXCLUDED.release_floor, updated_at=now();
