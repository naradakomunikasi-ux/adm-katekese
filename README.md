# ADM Katekese UIXF-002 — Hostinger Cloud Startup / MySQL

Replacement source candidate. The application serves a simulated UI prototype and provides health and MySQL readiness endpoints. **It does not implement production authentication, authorization or transactional workflow APIs.**

Hostinger Node.js Web App: `npm install` then `npm start`, `server.js`, port from `PORT`. Configure DB_HOST=127.0.0.1 and full Hostinger-prefixed MySQL credentials as environment variables. `/health` tests server; `/ready` tests DB. Never set live DB data until migrations are reviewed.

RC77 source is preserved in prior Git history, not in this replacement tree. UIXF-002 official design freeze, functional QA and production approval pending. `p3` architecture terminology requires confirmation.
