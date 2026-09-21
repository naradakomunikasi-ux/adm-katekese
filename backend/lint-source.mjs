import fs from 'node:fs';import path from 'node:path';
const files=fs.readdirSync('src').filter(f=>f.endsWith('.js')).map(f=>path.join('src',f));
const text=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
for(const [rule,msg] of [[/\beval\s*\(/,'eval forbidden'],[/child_process/,'child_process forbidden in API'],[/res\.status\(500\).*error\.message/s,'raw internal error leakage pattern detected']]){if(rule.test(text))throw new Error(msg);}
if(!text.includes("app.get('/api/ready'"))throw new Error('readiness endpoint required');
if(!text.includes('X-Request-Id'))throw new Error('request correlation required');
console.log('backend source lint PASS');
