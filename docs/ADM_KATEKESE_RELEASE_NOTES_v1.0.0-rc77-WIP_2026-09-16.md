# ADM Katekese v1.0.0-rc77 WIP - Release Notes

Checkpoint update: 2026-09-16

RC77 evolves the RC76 global AI Model Fabric selection into canonical per-7DNA routing and provider governance.

## Added / refined

- Editable routing workspace for Capture, Knowledge, Radar, Companion, Generate, Evaluate, Action, and Engineering.
- Capability/model compatibility plus provider privacy filtering before options reach the UI.
- `Kembalikan ke Rekomendasi` restores a canonical compatible recommendation as DRAFT for explicit Super Admin review.
- Provider URL, masked API-key lifecycle, default model and real connection-test endpoint.
- Effective route requires READY provider health for non-deterministic providers.
- Fail-closed privacy, DNA/model-group, fallback, human-authority and pastoral autonomy checks.
- Ollama Cloud default policy bounded to INTERNAL; confidential/restricted routing prefers stronger compatible providers rather than silently weakening privacy.
- Full frontend regression remains extended through RC77.

## Current evidence

Backend 287/287 PASS; RC77 routing 7/7 PASS; frontend regression PASS; 53 migration pairs PASS; 34 required tables PASS; OpenAPI 126 endpoints / 0 orphan; release integrity 726/726 PASS; Local Final Gate 33/34 PASS.

Production frontend build remains blocked because Vite is unavailable and npm registry resolution fails in this execution environment. Browser/runtime Alpha remains NOT VERIFIED. Production remains NO-GO.
