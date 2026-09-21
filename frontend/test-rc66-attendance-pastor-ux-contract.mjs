import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[
  [/Check-in adalah signal; Katekis\/Admin menetapkan kehadiran final/, 'participant check-in copy'],
  [/Review Kehadiran/, 'attendance review workspace'],
  [/\/attendance\/review/, 'final attendance API'],
  [/Signal:/, 'signal shown separately'],
  [/Final:/, 'final status shown separately'],
  [/DASHBOARD PASTOR/, 'pastor-specific dashboard'],
  [/Membutuhkan Peninjauan Saya/, 'pastor action priority'],
  [/Administrasi pendukung tetap ditampilkan sebagai evidence, bukan keputusan otomatis/, 'pastoral authority copy'],
];
for(const [pattern,label] of checks) assert.match(source,pattern,label);
console.log(`RC66 attendance + pastor UX contract: ${checks.length}/${checks.length} PASS`);
