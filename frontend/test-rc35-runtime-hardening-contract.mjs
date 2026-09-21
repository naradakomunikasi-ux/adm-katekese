import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const checks=[
 ['runtime config executable check',()=>assert.match(read('backend/package.json'),/"config:check"\s*:\s*"node runtime-config-check\.mjs"/)],
 ['runtime config check source exists',()=>assert.equal(fs.existsSync(path.join(root,'backend/runtime-config-check.mjs')),true)],
 ['RBAC migration 018 exists',()=>assert.equal(fs.existsSync(path.join(root,'database/migrations/018_up.sql')),true)],
 ['RBAC parity gate included',()=>assert.match(read('scripts/local-final-gate.mjs'),/verify-rbac-catalog-parity\.mjs/)],
 ['CI includes RBAC parity',()=>assert.match(read('.github/workflows/ci.yml'),/verify-rbac-catalog-parity\.mjs/)],
 ['library proxy remains 60 MB',()=>assert.match(read('deployment/nginx.conf'),/client_max_body_size\s+60m;/)],
];
let passed=0;
for(const [name,fn] of checks){try{fn();passed++;console.log(`PASS ${name}`);}catch(e){console.error(`FAIL ${name}: ${e.message}`);process.exitCode=1;}}
console.log(`RC35 runtime hardening contract: ${passed}/${checks.length} PASS`);
