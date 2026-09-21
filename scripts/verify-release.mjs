import fs from 'node:fs';

const required = [
  'frontend/Dockerfile','frontend/package.json','frontend/src/App.jsx',
  'backend/Dockerfile','backend/package.json','backend/src/index.js','backend/src/transaction.js','backend/src/idempotency.js',
  'database/migrations/001_up.sql','database/migrations/005_up.sql','database/migrations/005_down.sql','deployment/nginx.conf','docker-compose.yml',
  '.env.example','scripts/deploy-hostinger.sh','scripts/backup.sh','scripts/restore.sh'
];
const missing = required.filter((p) => !fs.existsSync(new URL(`../${p}`, import.meta.url)));
if (missing.length) {
  console.error('Missing release files:', missing.join(', '));
  process.exit(1);
}
const env = fs.readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
for (const key of ['POSTGRES_DB','POSTGRES_USER','POSTGRES_PASSWORD','DATABASE_URL','REDIS_URL','FRONTEND_ORIGIN']) {
  if (!env.includes(`${key}=`)) throw new Error(`Missing env contract: ${key}`);
}
console.log(`Release structure PASS: ${required.length} mandatory artifacts present.`);
