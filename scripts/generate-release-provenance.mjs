import fs from 'node:fs';
import crypto from 'node:crypto';
const version=fs.readFileSync('VERSION','utf8').trim();
const manifest=fs.readFileSync('RELEASE_SHA256SUMS.txt','utf8');
const rows=manifest.trim().split(/\r?\n/).filter(Boolean);
const provenanceBasis=rows.filter((row)=>!row.endsWith('  RELEASE_PROVENANCE.json')).join('\n')+'\n';
const out={schema:1,product:'ADM Katekese',version,artifactCount:rows.length,manifestSha256:crypto.createHash('sha256').update(provenanceBasis).digest('hex')};
fs.writeFileSync('RELEASE_PROVENANCE.json',JSON.stringify(out,null,2)+'\n');
console.log(`Release provenance generated for ${version}: ${rows.length} artifacts.`);
