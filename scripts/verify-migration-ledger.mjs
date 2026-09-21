import fs from 'node:fs';
import assert from 'node:assert/strict';
const migrate=fs.readFileSync('scripts/migrate.sh','utf8');
const rollback=fs.readFileSync('scripts/rollback.sh','utf8');
for(const token of ['CREATE TABLE IF NOT EXISTS schema_migrations','sha256sum','Migration drift detected','Skipping already applied','INSERT INTO schema_migrations']) assert.ok(migrate.includes(token),`missing migrate token ${token}`);
for(const token of ['schema_migrations','Skipping unapplied','DELETE FROM schema_migrations']) assert.ok(rollback.includes(token),`missing rollback token ${token}`);
console.log(JSON.stringify({status:'PASS',contract:'migration-ledger',checks:8},null,2));
