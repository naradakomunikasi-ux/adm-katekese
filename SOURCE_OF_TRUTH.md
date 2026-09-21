# ADM Katekese — Source of Truth

## Current qualified checkpoint

- Version: `v1.0.0-rc77-WIP`
- Checkpoint date: `2026-09-16`
- SHA-256: `2464560d9848fa6c05dafb112160cd3a56088739dcb7e1e712922ed4193bab5a`
- Drive checkpoint: https://drive.google.com/file/d/1ZK3mFbfOdZbw7wd6oJe6CYubwPE3XzX8/view?usp=drivesdk
- Drive project root: https://drive.google.com/drive/folders/1ATFhUxFcpEJfB3TFTG8vfKg0KdKyf1pe

## Repository

GitHub repository: https://github.com/naradakomunikasi-ux/adm-katekese
Controlled import branch: `staging/rc77-full-source-import`
Draft PR: https://github.com/naradakomunikasi-ux/adm-katekese/pull/1

Google Drive remains the authoritative archive for binary checkpoints, project governance, PRD/MoM, QA evidence, and release evidence.
GitHub is the controlled code repository.

## Current synchronization state — 2026-09-21

Qualified Drive checkpoint:
- 730 files total
- backend: 133
- frontend: 80
- database: 117
- docs: 289
- scripts: 43
- deployment: 6
- evidence: 54

Current GitHub staging tree:
- 368 files total
- backend: 87/133
- frontend: 77/80
- database: 117/117
- docs: 8/289
- scripts: 44 (43 checkpoint scripts + 1 staging completeness control)
- deployment: 6/6
- evidence: 19/54 plus staging evidence

Direct file-count synchronization is therefore incomplete. Database, checkpoint scripts, and deployment are fully represented. Frontend remains near-complete at 77/80. Backend advanced to 87/133. The exact qualified Drive ZIP was re-executed locally: backend check PASS, backend tests 287/287 PASS, frontend check PASS, and frontend tests PASS. Database, checkpoint scripts, and deployment categories are fully represented. Frontend is near-complete at 77/80; backend is 71/133. Docs and evidence remain intentionally incomplete while source import is prioritized. Database, checkpoint scripts, and deployment categories are now fully represented; backend, frontend, docs, and evidence remain incomplete. Scripts and deployment categories are now fully represented from the checkpoint; database import has advanced to 53/117 files.
The Drive checkpoint remains the qualified full-source reference until the GitHub tree is reconciled path-by-path and passes CI.

## Promotion rule

GitHub may become the primary qualified code source only after:
1. full checkpoint import is complete;
2. 730-file reconciliation is recorded;
3. source completeness gate passes;
4. source tests, dependency build, Docker config, and DB integration pass;
5. runtime compose smoke and browser UAT pass;
6. release evidence and rollback evidence are recorded.

Until then:
- PR #1 remains DRAFT;
- Runtime Alpha remains NOT VERIFIED;
- Production readiness remains NO-GO.
