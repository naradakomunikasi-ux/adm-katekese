# ADM Katekese RC45 Runtime Evidence

Date: 14 Agustus 2026

- Node v22.16.0: available.
- npm 10.9.2: available.
- npm registry configured as https://registry.npmjs.org/.
- Registry connectivity: BLOCKED — DNS cannot resolve registry.npmjs.org.
- frontend/package-lock.json: absent.
- backend/package-lock.json: absent.
- frontend production build: FAIL — vite not found.
- backend actual start: FAIL — express package not installed.
- production runtime configuration validation: PASS when supplied valid production-shaped environment values; AI provider warnings remain because no provider secrets were configured for the probe.
- docker: absent.
- psql: absent.
- gh: absent.

Runtime chain remains 0/8 production gates verified.
