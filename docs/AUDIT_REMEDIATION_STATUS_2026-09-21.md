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
