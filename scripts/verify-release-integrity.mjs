import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const manifestPath=path.join(root,'RELEASE_SHA256SUMS.txt');
const manifest=fs.readFileSync(manifestPath,'utf8').trim().split(/\r?\n/).filter(Boolean);
const failures=[]; const listed=new Set();
for(const line of manifest){
 const m=line.match(/^([a-f0-9]{64})\s+(.+)$/i); if(!m){failures.push(`invalid manifest row: ${line}`); continue;}
 const [,expected,rel]=m; listed.add(rel); const file=path.join(root,rel); if(!fs.existsSync(file)){failures.push(`missing ${rel}`);continue;}
 const actual=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); if(actual!==expected)failures.push(`checksum mismatch ${rel}`);
}
function walk(dir){
 const out=[]; for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.name==='.git')continue; const full=path.join(dir,entry.name);
  if(entry.isDirectory())out.push(...walk(full)); else out.push(path.relative(root,full).replaceAll(path.sep,'/'));
 } return out;
}
const eligible=walk(root).filter(rel=>rel!=='RELEASE_SHA256SUMS.txt').sort();
for(const rel of eligible) if(!listed.has(rel)) failures.push(`unlisted ${rel}`);
for(const rel of listed) if(!eligible.includes(rel)) failures.push(`manifest contains ineligible/missing ${rel}`);
if(failures.length){console.error(JSON.stringify({status:'FAIL',failures},null,2));process.exit(1);}
console.log(`Release integrity PASS: ${manifest.length} checksums verified; manifest coverage ${eligible.length}/${eligible.length}.`);
