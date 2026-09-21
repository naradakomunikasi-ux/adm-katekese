import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
const strict=process.argv.includes('--strict');
const command=(c)=>{const r=spawnSync('bash',['-lc',`command -v ${c}`],{encoding:'utf8'});return {available:r.status===0,path:r.status===0?r.stdout.trim():null};};
const registry=spawnSync('npm',['config','get','registry'],{encoding:'utf8'});
const registryUrl=(registry.stdout||'').trim();
const registryDns=spawnSync('bash',['-lc','getent hosts registry.npmjs.org'],{encoding:'utf8',timeout:5000});
let registryValid=false; try{const u=new URL(registryUrl);registryValid=['http:','https:'].includes(u.protocol)&&Boolean(u.hostname);}catch{}
const checks={
 docker:command('docker'), psql:command('psql'), gh:command('gh'),
 frontendLock:{available:fs.existsSync('frontend/package-lock.json')}, backendLock:{available:fs.existsSync('backend/package-lock.json')},
 npmRegistry:{available:registry.status===0&&registryValid,value:registryUrl||null},
 npmRegistryDns:{available:registryDns.status===0,value:registryDns.status===0?registryDns.stdout.trim().split(/\s+/)[0]:null}
};
const blocked=Object.entries(checks).filter(([,v])=>!v.available).map(([k])=>k);
const result={gate:'runtime-preflight',status:blocked.length?'BLOCKED — EXTERNAL ENVIRONMENT':'PASS',blocked,checks};
console.log(JSON.stringify(result,null,2));
process.exit(strict&&blocked.length?2:0);
