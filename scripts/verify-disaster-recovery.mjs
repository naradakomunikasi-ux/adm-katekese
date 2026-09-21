import fs from 'node:fs';
const required = ['scripts/backup.sh','scripts/restore.sh','scripts/migrate.sh','scripts/rollback.sh','docs/DISASTER_RECOVERY.md'];
const missing = required.filter((f)=>!fs.existsSync(f));
const backup = fs.readFileSync('scripts/backup.sh','utf8');
const restore = fs.readFileSync('scripts/restore.sh','utf8');
const dr = fs.readFileSync('docs/DISASTER_RECOVERY.md','utf8');
const checks = {
  requiredFiles: missing.length === 0,
  backupUsesPgDump: /pg_dump/.test(backup),
  backupChecksum: /sha256/i.test(backup),
  restoreUsesPgRestoreOrPsql: /(pg_restore|psql)/.test(restore),
  drHasRto: /RTO/i.test(dr),
  drHasRpo: /RPO/i.test(dr),
  drHasRollback: /rollback/i.test(dr)
};
const failed = Object.entries(checks).filter(([,v])=>!v);
console.log(JSON.stringify({gate:'disaster-recovery-contract',status:failed.length?'FAIL':'PASS',checks,missing},null,2));
process.exit(failed.length?1:0);
