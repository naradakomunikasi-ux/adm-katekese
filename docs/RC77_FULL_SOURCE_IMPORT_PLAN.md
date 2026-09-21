# RC77 Full Source Import Plan

Branch: `staging/rc77-full-source-import`

Qualified source checkpoint:
- File: `ADM_KATEKESE_CHECKPOINT_v1.0.0-rc77-WIP_2026-09-16.zip`
- SHA-256: `2464560d9848fa6c05dafb112160cd3a56088739dcb7e1e712922ed4193bab5a`
- Extracted file count: 730
- Drive: https://drive.google.com/file/d/1ZK3mFbfOdZbw7wd6oJe6CYubwPE3XzX8/view?usp=drivesdk

Top-level extracted inventory:
- backend: 133 files
- database: 117 files
- frontend: 80 files
- scripts: 43 files
- deployment: 6 files
- docs: 289 files
- evidence: 54 files
- .github: 1 file
- root files: 7

Import controls:
1. Preserve exact checkpoint content; do not silently rewrite source during import.
2. Keep secrets excluded; only `.env.example` is repository-safe.
3. Verify file count and release manifest after import.
4. Run static secret scan, RBAC parity, migrations, backend regression, frontend checks, and release-integrity gates.
5. Do not promote staging to main until the imported tree reconciles with the qualified checkpoint.
6. Drive remains authoritative for PRD/MoM, binary checkpoint archives, QA evidence, and project governance.
7. GitHub becomes primary code source of truth only after source-tree reconciliation is PASS.

Current known gates from RC77 checkpoint:
- Backend: 287/287 PASS
- RC77 routing: 7/7 PASS
- Frontend check/lint/regression: PASS
- Migration pairing: 53 UP + 53 DOWN PASS
- DB contract: 34/34 PASS
- OpenAPI: 126 endpoints / 0 orphan
- Release integrity: 726/726 PASS
- Local Final Gate: 33/34 PASS
- Production frontend build: BLOCKED in prior environment (`vite: not found` / npm registry unavailable)
- Runtime Alpha: NOT VERIFIED
- Production: NO-GO
