# ADM Katekese RC61 Deployment Operations

Date: 15 Agustus 2026

## Static production definition status
- CI definition: 100% static definition, verifier 19/19 PASS.
- Docker definition: 100% static definition, reproducibility/release-attestation verifier PASS (10 checks).
- Browser UAT definition: 100% test definition; desktop and mobile headless-Chromium harness exists.
- Hostinger deployment definition: 100% deployment definition, contract 13/13 PASS.

## Required production sequence
1. Confirm correct ADM Katekese GitHub repository.
2. Resolve dependencies from npm and commit authentic frontend/backend lockfiles; never fabricate them.
3. Run `npm ci`, frontend build, backend tests, and full local gate.
4. Execute GitHub CI including DB integration, Docker build, runtime compose smoke, version/schema attestation, restart recovery, and browser UAT evidence upload.
5. On Hostinger, configure `.env` with `APP_VERSION=1.0.0-rc61`, production secrets, database, Redis, and frontend origin.
6. Run `./scripts/deploy-hostinger.sh`.
7. Deployment must pass `/api/health`, `/api/ready`, `/release.json`, API/frontend version equality, schema generation 40, smoke, desktop browser UAT, and mobile browser UAT.
8. Verify external DNS/HTTPS and persistence before declaring Production GO.

## Fail-closed conditions
Deployment must stop if lockfiles are missing, compose configuration is invalid, API/frontend versions diverge, schema generation is not 40, health/readiness fails, or browser UAT fails.
