import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[
  ['approval create action',app.includes('+ Ajukan Persetujuan')],
  ['program-first approval flow',app.includes('chooseApprovalProgram')&&app.includes("api.get(`/programs/${programId}/participants`)")],
  ['canonical enrollment explanation',app.includes('enrollment canonical program tersebut')],
  ['participant and program submitted together',app.includes("programId:approvalDialog.programId")&&app.includes("participantId:approvalDialog.participantId")],
  ['empty program participant state',app.includes('Belum ada peserta aktif pada program ini.')]
];
for(const [name,pass] of checks){if(!pass){console.error('FAIL',name);process.exitCode=1}else console.log('PASS',name)}
if(!process.exitCode)console.log(`RC44 approval enrollment frontend contract ${checks.length}/${checks.length} PASS`);
