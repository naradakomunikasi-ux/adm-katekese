import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[
 ['dashboard pastoral inspiration',app.includes('Inspirasi Iman')&&app.includes('Jadwal Mendatang')],
 ['program readiness action',app.includes('Cek Kesiapan')&&app.includes('/readiness')],
 ['reports completion funnel',app.includes('Funnel Penyelesaian Program')&&app.includes('/reports/completion-funnel')],
 ['settings AI drilldown',app.includes("onNavigate?.('ai-settings')")],
 ['library 60 MB remains visible',app.includes('Maksimum 60 MB')],
];
for(const [name,pass] of checks){assert.equal(pass,true,name);console.log('PASS',name)}
console.log(`RC28 frontend alignment contract: ${checks.length}/${checks.length} PASS`);
