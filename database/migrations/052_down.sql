ALTER TABLE system_ai_settings
  DROP COLUMN IF EXISTS primary_engine_code,
  DROP COLUMN IF EXISTS classnote_model_code,
  DROP COLUMN IF EXISTS selected_capability_code;
DROP TABLE IF EXISTS ai_model_engines;
UPDATE runtime_schema_contract SET schema_generation=51,release_floor='1.0.0-rc75',updated_at=now() WHERE id=1;
