import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[
 ['payment create action',app.includes('+ Tambah Tagihan')],
 ['program-first payment flow',app.includes('choosePaymentProgram')&&app.includes("api.get(`/programs/${programId}/participants`)" )],
 ['canonical enrollment payment explanation',app.includes('Peserta diambil dari enrollment canonical program tersebut.')],
 ['participant and program submitted together',app.includes("programId:paymentDialog.programId")&&app.includes("participantId:paymentDialog.participantId")],
 ['payment amount and installment fields',app.includes('installmentNo:Number(paymentDialog.installmentNo||1)')&&app.includes('amount:Number(paymentDialog.amount||0)')],
 ['empty program participant state',app.includes('Belum ada peserta aktif pada program ini.')]
];
for(const [name,pass] of checks){if(!pass){console.error('FAIL',name);process.exitCode=1}else console.log('PASS',name)}
if(!process.exitCode)console.log(`RC46 payment enrollment frontend contract ${checks.length}/${checks.length} PASS`);
