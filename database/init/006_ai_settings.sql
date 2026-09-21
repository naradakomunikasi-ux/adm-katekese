CREATE TABLE IF NOT EXISTS system_ai_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id=1), primary_base_url TEXT, primary_model TEXT, primary_api_key_enc TEXT,
  cloud_enabled BOOLEAN NOT NULL DEFAULT FALSE, cloud_base_url TEXT, cloud_model TEXT, cloud_api_key_enc TEXT,
  embedding_base_url TEXT, embedding_model TEXT, embedding_api_key_enc TEXT, drive_storage_url TEXT, drive_folder_id TEXT,
  cloud_escalation TEXT NOT NULL DEFAULT 'complex_only' CHECK (cloud_escalation IN ('never','complex_only','always')),
  require_citations BOOLEAN NOT NULL DEFAULT TRUE, updated_by UUID REFERENCES users(id), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO system_ai_settings(id) VALUES(1) ON CONFLICT(id) DO NOTHING;
