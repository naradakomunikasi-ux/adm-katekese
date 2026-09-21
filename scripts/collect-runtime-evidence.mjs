import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
const run=(cmd,args=[],opts={})=>{const r=spawnSync(cmd,args,{encoding:'utf8',timeout:opts.timeout||8000,cwd:opts.cwd||process.cwd(),env:{...process.env,...(opts.env||{})}});return {status:r.status,signal:r.signal,stdout:(r.stdout||'').trim().slice(-1200),stderr:(r.stderr||'').trim().slice(-1200),ok:r.status===0};};
const command=(name)=>run('bash',['-lc',`command -v ${name}`]);
const dns=run('bash',['-lc','getent hosts registry.npmjs.org'],{timeout:5000});
const registry=run('npm',['config','get','registry']);
const checks={
 timestamp:new Date().toISOString(),
 node:run('node',['--version']),npm:run('npm',['--version']),npmRegistry:registry,npmRegistryDns:dns,
 frontendLock:{ok:fs.existsSync('frontend/package-lock.json')},backendLock:{ok:fs.existsSync('backend/package-lock.json')},
 vite:command('vite'),docker:command('docker'),psql:command('psql'),gh:command('gh'),
 frontendBuild:run('npm',['run','build'],{cwd:'frontend'}),
 backendConfigCheck:run('npm',['run','config:check'],{cwd:'backend',env:{NODE_ENV:'production',DATABASE_URL:'postgresql://adm:password@db:5432/adm',REDIS_URL:'redis://redis:6379',FRONTEND_ORIGIN:'https://example.invalid',AUTH_SECRET:'0123456789abcdef0123456789abcdef0123456789abcdef',APP_VERSION:'1.0.0-rc76'}}),
 backendStartProbe:run('node',['-e',"import('./backend/src/index.js').then(()=>setTimeout(()=>process.exit(0),500)).catch(e=>{console.error(e.code||e.message);process.exit(2)})"],{env:{NODE_ENV:'production',DATABASE_URL:'postgresql://adm:password@127.0.0.1:5432/adm',REDIS_URL:'redis://127.0.0.1:6379',FRONTEND_ORIGIN:'https://example.invalid',AUTH_SECRET:'0123456789abcdef0123456789abcdef0123456789abcdef',APP_VERSION:'1.0.0-rc76'}})
};
checks.runtimeChain={installVerified:checks.frontendLock.ok&&checks.backendLock.ok,buildVerified:checks.frontendBuild.ok,startVerified:checks.backendStartProbe.ok,postgresVerified:checks.psql.ok,dockerVerified:checks.docker.ok,ciCliAvailable:checks.gh.ok};
console.log(JSON.stringify(checks,null,2));
