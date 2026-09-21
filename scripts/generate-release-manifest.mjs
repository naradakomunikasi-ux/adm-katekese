import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const excluded=new Set(['RELEASE_SHA256SUMS.txt']);
function walk(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name==='.git')continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...walk(full));
    else out.push(path.relative(root,full).replaceAll(path.sep,'/'));
  }
  return out;
}
const files=walk(root).filter(rel=>!excluded.has(rel)).sort();
const rows=files.map(rel=>`${crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex')}  ${rel}`);
fs.writeFileSync(path.join(root,'RELEASE_SHA256SUMS.txt'),rows.join('\n')+'\n');
console.log(JSON.stringify({status:'PASS',generated:rows.length,manifest:'RELEASE_SHA256SUMS.txt'},null,2));
