# ADM Katekese — Pastoral Productivity Platform

Current controlled engineering baseline: **v1.0.0-rc77-WIP**  
Checkpoint date: **2026-09-16**

ADM Katekese is a configurable pastoral program management platform for catechesis, sacramental preparation, communities, events, operational administration, reporting, and document-grounded AI assistance.

## Current controlled status

- RC76/RC77 source continuity: PASS
- Backend regression: 287/287 PASS
- RC77 routing tests: 7/7 PASS
- Frontend check/lint/full regression: PASS
- Migration pairing: 53 UP + 53 DOWN PASS
- DB contract: 34 required tables PASS
- OpenAPI: 126 endpoints, 0 orphan
- RBAC parity and static secret scan: PASS
- Release integrity: 726/726 PASS
- Local Final Gate: 33/34 PASS
- Production frontend build: BLOCKED (`vite: not found` in the prior execution environment)
- Runtime Alpha: NOT VERIFIED
- Production: NO-GO

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Queue/cache: Redis
- Reverse proxy: Nginx
- Deployment: Docker Compose
- CI: GitHub Actions
- AI: 7DNA Model Fabric + provider routing + document-grounded RAG

## Product architecture

ADM Katekese is evolving from fixed program modules into a **Configurable Program Management Platform**. Programs such as Baptis Dewasa, Baptis Bayi, Komuni Pertama, Krisma, MRT/Persiapan Perkawinan, OMK, retreats, seminars, and other parish activities are intended to use reusable program templates, workflows, actor models, requirements, attendance, approval, outputs, reporting, and knowledge scopes.

## Source of truth

### Code
Repository: https://github.com/naradakomunikasi-ux/adm-katekese

### Project governance, PRD/MoM, release evidence, QA, and checkpoint archive
Google Drive project root: https://drive.google.com/drive/folders/1ATFhUxFcpEJfB3TFTG8vfKg0KdKyf1pe

Qualified RC77 checkpoint:
https://drive.google.com/file/d/1ZK3mFbfOdZbw7wd6oJe6CYubwPE3XzX8/view?usp=drivesdk

SHA-256:
`2464560d9848fa6c05dafb112160cd3a56088739dcb7e1e712922ed4193bab5a`

## Development URLs

Reference UI:
https://katekese.miyustudio.id

Target application frontend:
https://app.adm-katekese.miyustudio.id

Target API:
https://api.adm-katekese.miyustudio.id

## Quick start

1. Copy `.env.example` to `.env`.
2. Replace all default passwords/secrets.
3. Install dependencies from a trusted package source.
4. Run the static and regression gates.
5. Start the stack with Docker Compose when the runtime environment is available.

```bash
cp .env.example .env
docker compose up -d --build
```

No runtime, deployment, browser UAT, database migration, provider inference, or production-readiness gate should be marked PASS without corresponding evidence.
