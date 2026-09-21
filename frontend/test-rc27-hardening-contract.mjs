import assert from 'node:assert/strict';
import fs from 'node:fs';
const files=['src/App.jsx','src/navigation.js','src/page-registry.js'];
const source=files.map(f=>fs.readFileSync(new URL(`./${f}`,import.meta.url),'utf8')).join('\n');
for(const label of ['Perjalanan Peserta','Persetujuan Pastoral','Perpustakaan','Laporan','Pengaturan']) assert.ok(source.includes(label),`missing ${label}`);
assert.ok(!source.includes("title:'Participant 360'"),'legacy Participant 360 title must not return');
console.log('RC27 frontend hardening contract PASS');
