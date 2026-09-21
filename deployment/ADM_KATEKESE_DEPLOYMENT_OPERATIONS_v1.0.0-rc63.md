# ADM Katekese RC63 Deployment Operations

## Super Admin bootstrap
Run only after migrations are applied and production PostgreSQL is reachable.

Required environment variables:
- `DATABASE_URL`
- `SUPER_ADMIN_BOOTSTRAP_USERNAME=admin`
- `SUPER_ADMIN_BOOTSTRAP_EMAIL=Michael.gani@gmail.com`
- `SUPER_ADMIN_BOOTSTRAP_PASSWORD` supplied securely at execution time

Command:
`npm --prefix backend run bootstrap:super-admin`

The bootstrap is idempotent, assigns only `SUPER_ADMIN`, revokes existing sessions, and stores a scrypt password hash. Do not place the plaintext password in source control, deployment files, or Drive documents.

## RC63 password policy
Minimum 8 characters with all four categories required: uppercase, lowercase, digit, symbol.

## Runtime gate
Deployment remains NO-GO until dependency installation, live PostgreSQL migration/bootstrap, Docker runtime, browser UAT, GitHub CI, and Hostinger smoke tests pass.
