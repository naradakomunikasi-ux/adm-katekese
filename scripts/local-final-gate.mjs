import { spawnSync } from 'node:child_process';
const checks=[
 ['frontend','npm',['run','check']],['frontend','npm',['run','lint']],['frontend','npm',['test']],['frontend','npm',['run','test:rc75']],['frontend','node',['test-rc76-model-fabric-selector-contract.mjs']],['frontend','npm',['run','test:rc77']],['frontend','npm',['run','build']],
 ['backend','npm',['run','check']],['backend','npm',['run','lint']],['backend','npm',['test']],
 ['root','node',['scripts/uat-simulation.mjs']],['root','node',['scripts/verify-migrations.mjs']],
 ['root','node',['scripts/verify-db-contract.mjs']],['root','node',['scripts/verify-backup-contract.mjs']],
 ['root','node',['scripts/security-static-scan.mjs']],['root','node',['scripts/verify-compose-security.mjs']],
 ['root','node',['scripts/verify-release.mjs']],['root','node',['scripts/verify-disaster-recovery.mjs']],['root','node',['scripts/verify-openapi-contract.mjs']],['root','node',['scripts/verify-openapi-drift.mjs']],['root','node',['scripts/verify-release-integrity.mjs']],['root','node',['scripts/verify-migration-safety.mjs']],['root','node',['scripts/rag-quality-gate.mjs']],['root','node',['scripts/verify-migration-ledger.mjs']],['root','node',['scripts/verify-version-consistency.mjs']],['root','node',['scripts/verify-runtime-config-contract.mjs']],['root','node',['scripts/verify-restore-safety.mjs']],['root','node',['scripts/verify-deployment-contract.mjs']],['root','node',['scripts/verify-docker-reproducibility.mjs']],['root','node',['scripts/verify-rbac-catalog-parity.mjs']],['root','node',['scripts/verify-participant-enrollment-source.mjs']],['root','node',['scripts/verify-report-aggregation-safety.mjs']],['root','node',['scripts/verify-ci-runtime-definition.mjs']],['root','node',['scripts/verify-release-provenance.mjs']],
];
const cwd=process.cwd(); let failed=0; const evidence=[];
for(const [scope,cmd,args] of checks){ const run=spawnSync(cmd,args,{cwd:scope==='root'?cwd:`${cwd}/${scope}`,encoding:'utf8'}); const pass=run.status===0; if(!pass) failed++; evidence.push({scope,command:[cmd,...args].join(' '),status:pass?'PASS':'FAIL',exitCode:run.status}); if(!pass) process.stderr.write(run.stderr||run.stdout||''); }
console.log(JSON.stringify({gate:'local-final-gate',status:failed?'FAIL':'PASS',checks:evidence},null,2));
process.exit(failed?1:0);
