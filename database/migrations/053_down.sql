DROP INDEX IF EXISTS idx_ai_routes_status;
DROP INDEX IF EXISTS idx_ai_provider_status;
DROP TABLE IF EXISTS ai_capability_model_routes;
DROP TABLE IF EXISTS ai_provider_connections;
DELETE FROM ai_model_engines WHERE code IN ('classnote-capture-g1','classnote-radar-g2','classnote-evaluate-g0','classnote-action-g0','classnote-engineering-g7');
DELETE FROM ai_capabilities WHERE code IN ('capture.ingest','radar.attention','companion.assist','generate.draft','engineering.orchestrate');
UPDATE runtime_schema_contract SET schema_generation=52,release_floor='1.0.0-rc76',updated_at=now() WHERE id=1;
