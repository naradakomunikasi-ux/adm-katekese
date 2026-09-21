# ADM Katekese RC62 Deployment Operations

## One-time Super Admin bootstrap
When production PostgreSQL and the backend release are live, run from the backend runtime with secrets supplied through the environment:

```bash
DATABASE_URL='postgresql://...' \
SUPER_ADMIN_BOOTSTRAP_USERNAME='admin' \
SUPER_ADMIN_BOOTSTRAP_EMAIL='Michael.gani@gmail.com' \
SUPER_ADMIN_BOOTSTRAP_NAME='Michael Gani' \
SUPER_ADMIN_BOOTSTRAP_PASSWORD='<12+ character production password>' \
npm run bootstrap:super-admin
```

Do not place the plaintext password in source files, release notes, Docker images, or Google Drive artifacts.

## Verification
1. `GET /api/ready` must be 200 and report release/schema attestation for RC62 / generation 41.
2. `POST /api/auth/login` must be reachable (not 404).
3. Login must succeed with either `admin` or `Michael.gani@gmail.com` and the provisioned password.
4. `/api/me` must report role `SUPER_ADMIN`.
5. Old sessions are revoked by bootstrap.
