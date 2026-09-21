import fs from 'node:fs';import path from 'node:path';
const dir=path.resolve('database/migrations');const files=fs.readdirSync(dir).filter(f=>/_up\.sql$/.test(f)).sort();
const nums=files.map(f=>Number(f.split('_')[0]));const sequential=nums.every((n,i)=>i===0||n===nums[i-1]+1);
const dangerous=[];for(const f of files){const sql=fs.readFileSync(path.join(dir,f),'utf8');if(/\b(DROP\s+(TABLE|COLUMN)|TRUNCATE\b|DELETE\s+FROM\b)/i.test(sql))dangerous.push(f)}
const result={sequential,dangerousUpMigrations:dangerous,count:files.length,status:sequential&&dangerous.length===0?'PASS':'FAIL'};console.log(JSON.stringify(result,null,2));process.exit(result.status==='PASS'?0:1);
