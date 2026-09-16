# ADM Katekese v1.0.0-rc77 WIP - Alpha Readiness

Checkpoint date: 2026-09-16

## Static Alpha

Readiness: approximately 99%, status **BLOCKED**.

Passing static gates include frontend syntax/check, lint and full regression through RC77; backend 287/287 tests; RC77 routing 7/7; 53 migration UP/DOWN pairs; 34 required-table DB contract; security scan; RBAC parity; 126-endpoint OpenAPI catalog with zero orphan; Docker reproducibility; release integrity 726/726; and release provenance.

The single static blocker remains the production frontend build. The execution environment does not contain Vite and cannot resolve the npm registry (`EAI_AGAIN`), so an authentic dependency restore is not possible here. `npm run build` exits with `vite: not found`. Static Alpha must remain BLOCKED until Vite dependencies are restored from a trusted package source and the real production build succeeds.

## Runtime Alpha

Status: **BLOCKED / NOT VERIFIED**.

Still required: apply migration 053 to real PostgreSQL with rollback/reapply evidence, connect Redis, start backend and frontend together, seed UAT data, verify login/RBAC, test Ollama URL + credential + configured model inference through the application, run main workflows, perform real browser UAT on desktop/tablet/mobile, verify upload/download, Ask Miyu provider path, backup/restore, and deployment environment.

Decision: Static Alpha = BLOCKED. Runtime Alpha = BLOCKED / NOT VERIFIED. Production = NO-GO.
