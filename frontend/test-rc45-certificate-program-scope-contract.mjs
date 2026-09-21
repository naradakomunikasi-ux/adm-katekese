import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[
 ['certificate generation action',app.includes('+ Generate Sertifikat')],
 ['program-first eligibility load',app.includes('chooseCertificateProgram')&&app.includes('certificate-eligibility')],
 ['eligible participant selection',app.includes("filter(x=>x.eligible).map(x=>x.id)")],
 ['generation submits program and participants',app.includes("programId:certificateDialog.programId")&&app.includes("participantIds:certificateDialog.selected")],
 ['certificate cards show program context',app.includes("x.program_name")&&app.includes("x.participant_name")],
 ['canonical enrollment explanation',app.includes('Eligibility dihitung dari enrollment canonical')]
];
for(const [name,pass] of checks){if(!pass){console.error('FAIL',name);process.exitCode=1}else console.log('PASS',name)}
if(!process.exitCode)console.log(`RC45 certificate program scope frontend contract ${checks.length}/${checks.length} PASS`);
