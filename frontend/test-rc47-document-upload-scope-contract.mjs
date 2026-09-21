import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[
  ["participant upload button", app.includes("role==='PESERTA'")&&app.includes('+ Unggah Dokumen')],
  ['upload context endpoint',app.includes("api.get('/documents/upload-context')")],
  ['requirement-bound payload',app.includes("'X-Document-Requirement-Id':requirement.id")|| (app.includes('requirementId:requirement.id')&&app.includes('documentType:requirement.documentType'))],
  ['program requirement selector',app.includes('Requirement<select')&&app.includes('programId:e.target.value,requirementId')],
  ['no arbitrary participant input',app.includes('value={documentDialog.participantName} disabled')],
  ['binary storage successor',app.includes("api.uploadFile('/documents/upload'")||app.includes('storage adapter')]
];
for(const [name,pass] of checks){if(!pass){console.error('FAIL',name);process.exitCode=1;}else console.log('PASS',name)}
if(process.exitCode)process.exit(process.exitCode);
console.log(`${checks.length}/${checks.length} RC47 document upload frontend checks PASS`);
