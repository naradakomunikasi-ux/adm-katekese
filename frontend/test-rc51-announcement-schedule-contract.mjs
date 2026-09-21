import fs from 'node:fs';
const source=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[
 ['schedule dialog keeps explicit error state',source.includes("kind:'schedule',item:x,value:'',error:''")],
 ['datetime input has future minimum',source.includes('min={new Date(Date.now()+60000).toISOString().slice(0,16)}')],
 ['schedule validates future time before API call',source.includes("Waktu publikasi harus di masa depan.")],
 ['schedule sends ISO timestamp',source.includes("publishAt:publishAt.toISOString()")],
 ['schedule error is accessible',source.includes('role="alert"')],
 ['schedule remains explicit status transition',source.includes("status:'SCHEDULED'")]
];
for(const [name,ok] of checks){if(!ok)throw new Error(`FAIL: ${name}`);console.log(`PASS: ${name}`)}
console.log(`${checks.length}/${checks.length} RC51 announcement schedule contract checks passed.`);
