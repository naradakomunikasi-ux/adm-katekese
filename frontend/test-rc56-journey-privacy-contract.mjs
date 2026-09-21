import fs from 'node:fs';
const src=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[
  ['journey visibility contract rendered',src.includes("journey.visibility?.payments===false?'Terbatas'")],
  ['approval visibility contract rendered',src.includes("journey.visibility?.approvals===false?'Terbatas'")],
  ['certificate visibility contract rendered',src.includes("journey.visibility?.certificates===false?'Terbatas'")],
  ['document visibility contract rendered',src.includes("journey.visibility?.documents===false?'Terbatas'")],
  ['journey keeps pastoral service UI',src.includes('Catatan Pelayanan')],
  ['journey keeps canonical enrollment notice',src.includes('participant_programs')],
];
for(const [name,ok] of checks){if(!ok)throw new Error(`FAIL ${name}`); console.log(`PASS ${name}`)}
console.log(`RC56 journey privacy contract: ${checks.length}/${checks.length} PASS`);
