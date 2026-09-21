import fs from 'node:fs';
const backup=fs.readFileSync('scripts/backup.sh','utf8');
const restore=fs.readFileSync('scripts/restore.sh','utf8');
const checks=[
 ['backup uses custom pg_dump', /pg_dump[\s\S]*--format=custom/.test(backup)],
 ['backup creates sha256', /sha256sum/.test(backup)],
 ['restore verifies checksum', /sha256sum -c/.test(restore)],
 ['restore cleans existing objects', /pg_restore[\s\S]*--clean/.test(restore)],
 ['restore requires database url', /DATABASE_URL/.test(restore)],
];
const failed=checks.filter(([,ok])=>!ok);
if(failed.length) throw new Error(failed.map(([n])=>n).join(', '));
console.log(`backup/restore contracts: ${checks.length}/${checks.length} PASS`);
