import fs from 'node:fs';
const source=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[
  ['finance visibility flag',/x\.financial_visible/],
  ['restricted finance label',/Keuangan: Terbatas/],
  ['payment amount guarded',/x\.financial_visible\?<>Terbayar:/],
  ['pastoral report wording',/Insight pelayanan mengikuti kewenangan tiap domain/],
  ['reports completion endpoint preserved',/\/reports\/completion-funnel/],
  ['reports attention endpoint preserved',/\/reports\/attention/],
];
let pass=0;
for(const [name,re] of checks){if(!re.test(source))throw new Error(`FAIL ${name}`);pass++;}
console.log(`RC58 report privacy contract ${pass}/${checks.length} PASS`);
