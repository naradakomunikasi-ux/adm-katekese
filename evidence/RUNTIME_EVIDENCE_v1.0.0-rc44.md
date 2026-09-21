# ADM Katekese RC44 Runtime Evidence

Date: 14 Agustus 2026

Actual preflight evidence:
- Node v22.16.0: available.
- npm 10.9.2: available.
- npm registry configured as https://registry.npmjs.org/.
- DNS resolution for registry.npmjs.org: FAIL.
- npm ping: did not complete successfully within probe window.
- frontend package-lock.json: absent.
- backend package-lock.json: absent.
- frontend production build: FAIL (`vite: not found`).
- backend production config check: PASS.
- backend actual start probe: FAIL (`ERR_MODULE_NOT_FOUND`).
- docker: absent.
- psql: absent.
- gh: absent.

Runtime production chain remains 0/8 verified. Static/unit evidence must not be interpreted as runtime readiness.
