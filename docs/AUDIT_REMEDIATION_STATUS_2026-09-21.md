# ADM Katekese — Audit Remediation Status

Date: 2026-09-21
Branch: `staging/rc77-full-source-import`
PR: #1
Baseline checkpoint: `v1.0.0-rc77-WIP`

## Remediated in this increment

### P0 — Participant RBAC scope
- Removed broad implicit access for ADMIN_PROGRAM, KATEKIS, and PASTOR.
- Added fail-closed program/batch/participant assignment checks.
- Added SQL scope generation for explicit assignments.
- Sensitive payment access remains limited to SUPER_ADMIN, ADMIN_KATEKESE, and the owning participant.
- Added `backend/test/rc77-access-scope.test.js`.

### P1 — Configurable Program Builder completeness
- Added dedicated MRT journey with couple data, couple attendance, counseling/interview, pastoral approval, and certificate.
- Added continuous OMK membership journey.
- Added dedicated Bina Iman Anak/Remaja, Rekoleksi/Retret, Seminar, and Webinar journeys.
- Expanded tests for MRT, OMK, and one-time event templates.

### P1 — AI escalation semantics
- `CLOUD_LLM_ESCALATION=always` now takes precedence when cloud is ready.
- `complex_only` can route medium/high-confidence requests to cloud even when primary is healthy.
- Healthy primary remains default for non-escalated traffic.
- Cloud remains fallback when primary is unavailable.
- Added route policy tests.

## Current quantified repository state
- Qualified checkpoint: 730 files.
- Current staging Git tree after this increment: 49 files total (14 backend, 10 frontend, 4 database, 8 docs, 1 scripts, 2 deployment, 1 GitHub workflow, plus root files).
- Therefore the full-source reconciliation is still materially incomplete; direct file-count coverage is at most 49/730 (~6.7%) before path-by-path reconciliation.
- Latest GitHub Actions run #24: FAILURE. Jobs failing: source-tests, dependency-build, docker-config, integration-db. docker-build and runtime-compose-smoke were skipped.
- This failure is treated as expected evidence of an incomplete repository tree, not as a production regression verdict. Missing scripts/dependencies/configuration must be imported before CI can be evaluated as a final RC77 gate.

## Full checkpoint verification executed locally
- Drive checkpoint ZIP re-fetched directly and SHA-256 revalidated: `2464560d9848fa6c05dafb112160cd3a56088739dcb7e1e712922ed4193bab5a`.
- ZIP extracted successfully to exactly 730 files.
- Backend `npm run check`: PASS.
- Backend `npm test`: PASS, 287/287.
- Frontend `npm run check`: PASS.
- Frontend `npm test`: PASS.
- 18/18 static release/governance scripts from the CI source-test lane: PASS.
- These results verify the qualified full Drive checkpoint itself; they do not make the partial GitHub staging tree complete.

## CI control improvement
- Added `scripts/verify-source-completeness.mjs` as an explicit RC77 import gate.
- Downstream CI lanes (`source-tests`, `dependency-build`, `docker-config`, `integration-db`) now depend on source completeness first.
- This prevents misleading multi-lane failures while the repository is intentionally partial and makes the blocker explicit.

## Still open
- Full 730-file source reconciliation against the qualified Drive checkpoint.
- Remaining backend/frontend/database/scripts/deployment/docs import.
- Final dependency/import graph verification.
- GitHub CI PASS on the reconciled full source tree.
- PostgreSQL apply/rollback/reapply runtime evidence.
- Redis/backend/frontend integrated runtime.
- Browser role UAT, mobile, bilingual, accessibility.
- Backup/restore and production deployment evidence.

## Release control
PR #1 remains DRAFT.
Do not merge to `main` until reconciliation and verification gates pass.
Production remains NO-GO.
