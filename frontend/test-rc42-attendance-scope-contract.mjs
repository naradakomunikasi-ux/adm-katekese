import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[
 ['katekis scope notice',/program\/batch yang ditugaskan kepada Anda/],
 ['participant schedule scope notice',/batch tempat Anda terdaftar/],
 ['assigned meeting empty state',/Belum ada pertemuan pada penugasan Anda/],
 ['participant meeting empty state',/Belum ada pertemuan untuk batch Anda/]
];
for(const [name,re] of checks){if(!re.test(app)){console.error('FAIL',name);process.exit(1)}console.log('PASS',name)}
console.log(`RC42 frontend attendance scope contract: ${checks.length}/${checks.length} PASS`);
