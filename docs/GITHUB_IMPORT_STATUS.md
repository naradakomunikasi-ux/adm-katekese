# ADM Katekese — GitHub Import Status

Checkpoint: v1.0.0-rc77-WIP (2026-09-16)
Qualified ZIP SHA-256: 2464560d9848fa6c05dafb112160cd3a56088739dcb7e1e712922ed4193bab5a

## Current state

- `main`: controlled baseline only.
- `staging/rc77-full-source-import`: active controlled import branch.
- Draft PR #1 is the merge gate into `main`.
- Extracted checkpoint contains 730 files.
- Import remains incomplete; do not promote GitHub as sole code source of truth until 730-file reconciliation and CI/runtime gates pass.

## Imported priority areas

- Configurable Program Builder and pastoral program types.
- 7DNA / AI Model Fabric routing configuration.
- Migration 052 and 053 up/down pair.
- Frontend navigation, session, RBAC, API and UI-state primitives.
- Program-builder and RC77 routing contract tests.
- Knowledge/RAG controls: access scope, answer grounding, knowledge policy, ingestion and retrieval confidence gate.

## Required before merge

1. Complete remaining backend source import.
2. Complete frontend source and regression contract import.
3. Complete database migrations/init, scripts, deployment and docs import.
4. Reconcile all 730 extracted files against GitHub tree.
5. Confirm no production secrets are present.
6. Run GitHub CI and resolve failures.
7. Re-run source integrity/checksum evidence.
8. Keep Runtime Alpha and Production NO-GO until authentic runtime evidence exists.
