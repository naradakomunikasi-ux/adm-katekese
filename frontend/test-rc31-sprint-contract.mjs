import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const backend=fs.readFileSync(new URL('../backend/src/index.js',import.meta.url),'utf8');
const program=fs.readFileSync(new URL('../backend/src/program-core.js',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../database/migrations/017_up.sql',import.meta.url),'utf8');
const checks=[
 ['program period fields',app.includes('Mulai Program')&&app.includes('Selesai Program')&&program.includes("startDate")&&migration.includes('start_date DATE')],
 ['real meeting form',app.includes('Pertemuan Baru')&&app.includes('Simpan Draft')&&app.includes("api.post('/meetings'")],
 ['meeting audience groups',app.includes('REMAJA')&&app.includes('OMK')&&app.includes('DEWASA')],
 ['publish readiness hard gate',backend.includes("target==='PUBLISHED'")&&backend.includes('PROGRAM_NOT_READY')],
 ['scheduled announcement due visibility',backend.includes("status='SCHEDULED' AND publish_at<=now()")],
 ['public announcement read is side-effect free',!backend.slice(backend.indexOf("app.get('/api/public/announcements'"),backend.indexOf("app.get('/api/public/announcements'")+1200).includes('UPDATE announcements')],
 ['public program period',backend.includes('p.start_date,p.end_date,p.publish_at')],
];
for(const [name,pass] of checks){if(!pass){console.error(`FAIL ${name}`);process.exitCode=1;}else console.log(`PASS ${name}`)}
if(!process.exitCode) console.log(`RC31 sprint contract: ${checks.length}/${checks.length} PASS`);
