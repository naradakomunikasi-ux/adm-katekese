import fs from 'node:fs';
const app=fs.readFileSync('src/App.jsx','utf8');
const api=fs.readFileSync('src/api.js','utf8');
const checks=[
  ['file input exists',app.includes('type="file"')&&app.includes('X-Document-Requirement-Id')],
  ['binary endpoint used',app.includes("api.uploadFile('/documents/upload'")],
  ['no legacy runtime-storage placeholder',!app.includes('Penyimpanan file binary akan memakai storage adapter saat runtime service tersedia')],
  ['upload requires selected file',app.includes('!documentDialog.file')],
  ['document download action exists',app.includes('/documents/${x.id}/download')],
  ['upload helper allows route-specific headers',api.includes("headers={}")&&api.includes('...headers')]
];
for(const [name,pass] of checks){if(!pass)throw new Error(`FAIL: ${name}`);}
console.log(`RC59 document binary contract ${checks.length}/${checks.length} PASS`);
