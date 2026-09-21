import fs from 'node:fs';import path from 'node:path';
const roots=['frontend/src','backend/src','database/migrations','deployment','scripts'];
const findings=[]; const forbidden=[/BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY/,/AKIA[0-9A-Z]{16}/,/sk-[A-Za-z0-9]{20,}/];
for(const root of roots){for(const file of walk(root)){const text=fs.readFileSync(file,'utf8');for(const rule of forbidden)if(rule.test(text))findings.push({file,rule:String(rule)});}}
function walk(dir){if(!fs.existsSync(dir))return[];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});}
if(findings.length){console.error(JSON.stringify(findings,null,2));process.exit(1);}console.log('static secret scan PASS: no high-confidence embedded secrets/private keys');
