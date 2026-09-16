# ADM Katekese — Pastoral Productivity Release Candidate

Release candidate version: **v1.0.0-rc7**

Evidence-backed production hardening package for ADM Katekese. Runtime gates that cannot be executed in the current environment remain explicitly blocked rather than counted as PASS.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Queue/cache: Redis
- Reverse proxy: Nginx
- Deployment: Docker Compose
- CI: GitHub Actions

## Quick start
1. Copy `.env.example` to `.env`
2. Update passwords/secrets.
3. Run:
   ```bash
   docker compose up -d --build
   ```
4. Open:
   - Web: http://localhost
   - API health: http://localhost/api/health

## Production domains
Recommended:
- app.adm-katekese.miyustudio.id
- api.adm-katekese.miyustudio.id

## Definition of Done
- Frontend builds successfully
- Backend health endpoint returns OK
- PostgreSQL schema + seed apply cleanly
- Redis responds
- Docker services healthy
- Nginx routes `/` to frontend and `/api/` to backend
- RBAC and authentication hardened before production traffic

## v1.0.0-rc9

- Hybrid RAG retrieval: semantic embeddings + lexical fallback.
- Query embedding is role-scoped and used for search/ask ranking.
- Retrieval metrics expose hybrid/lexical mode.

## v1.0.0-rc8
RC8 adds the first production-shaped knowledge ingestion path: protected administrative ingestion, deterministic content hashing/deduplication, chunk preparation, external embedding-provider abstraction with graceful degradation, persistent embedding metadata, and migration 008. External runtime gates remain blocked until actual npm/PostgreSQL/Docker/GitHub/Hostinger/live-provider evidence exists.

## RC15 production-readiness hardening

RC15 adds a fail-closed runtime configuration contract, `.env.example` version consistency coverage, explicit external-environment preflight diagnostics, and deterministic release finalization (`node scripts/finalize-release.mjs`). These source-side controls do not replace actual PostgreSQL, Docker, browser UAT, GitHub CI, or Hostinger evidence.
