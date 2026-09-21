import { spawnSync } from 'node:child_process';
function run(script){ const r=spawnSync(process.execPath,[script],{encoding:'utf8',stdio:'pipe'}); if(r.status!==0){process.stderr.write(r.stderr||r.stdout);process.exit(r.status||1);} process.stdout.write(r.stdout); }
run('scripts/generate-release-manifest.mjs');
run('scripts/generate-release-provenance.mjs');
run('scripts/generate-release-manifest.mjs');
run('scripts/verify-release-provenance.mjs');
run('scripts/verify-release-integrity.mjs');
console.log('Release finalization PASS: manifest/provenance stabilized and verified.');
