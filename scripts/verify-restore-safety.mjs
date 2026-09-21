import fs from 'node:fs';
import assert from 'node:assert/strict';
const backup=fs.readFileSync('scripts/backup.sh','utf8');
const restore=fs.readFileSync('scripts/restore.sh','utf8');
for(const token of ['pg_dump','pg_restore --list','sha256sum']) assert.ok(backup.includes(token),`backup missing ${token}`);
for(const token of ['sha256sum -c','pg_restore --list','RESTORE_CONFIRM','RESTORE_ADM_KATEKESE','--exit-on-error','--clean','--if-exists']) assert.ok(restore.includes(token),`restore missing ${token}`);
console.log(JSON.stringify({status:'PASS',contract:'backup-restore-safety',checks:10},null,2));
