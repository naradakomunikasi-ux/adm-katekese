import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd();
const version=fs.readFileSync(path.join(root,'VERSION'),'utf8').trim();
const manifestPath=path.join(root,'RELEASE_SHA256SUMS.txt');
const manifest=fs.readFileSync(manifestPath,'utf8');
const rows=manifest.trim().split(/\r?\n/).filter(Boolean);
const provenanceBasis=rows.filter((row)=>!row.endsWith('  RELEASE_PROVENANCE.json')).join('\n')+'\n';
const manifestSha256=crypto.createHash('sha256').update(provenanceBasis).digest('hex');
const provenancePath=path.join(root,'RELEASE_PROVENANCE.json');
if(!fs.existsSync(provenancePath)){console.error('RELEASE_PROVENANCE_MISSING');process.exit(1);}
const p=JSON.parse(fs.readFileSync(provenancePath,'utf8'));
const failures=[];
if(p.version!==version) failures.push('VERSION_MISMATCH');
if(p.manifestSha256!==manifestSha256) failures.push('MANIFEST_DIGEST_MISMATCH');
if(p.artifactCount!==rows.length) failures.push('ARTIFACT_COUNT_MISMATCH');
if(p.schema!==1) failures.push('SCHEMA_MISMATCH');
if(failures.length){console.error(JSON.stringify({status:'FAIL',failures},null,2));process.exit(1);}
console.log(`Release provenance PASS: ${version}; ${rows.length} artifacts; manifest ${manifestSha256.slice(0,12)}…`);
