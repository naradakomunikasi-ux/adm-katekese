import fs from 'node:fs';
const required=['frontend/package-lock.json','backend/package-lock.json'];
const missing=required.filter(x=>!fs.existsSync(new URL(`../${x}`,import.meta.url)));
if(missing.length){
 console.log(JSON.stringify({status:'BLOCKED_EXTERNAL_ENVIRONMENT',reason:'LOCKFILE_MISSING',missing,remediation:'Generate with npm install using a working npm registry, commit lockfiles, then use npm ci.'},null,2));
 process.exit(2);
}
console.log('Lockfile readiness PASS: frontend and backend package-lock.json present.');
