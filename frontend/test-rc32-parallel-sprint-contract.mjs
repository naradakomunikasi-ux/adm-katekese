import fs from 'node:fs';import assert from 'node:assert/strict';
const app=fs.readFileSync('src/App.jsx','utf8');
assert.match(app,/Kesiapan Batch/);assert.match(app,/\/batches\/\$\{batch\.id\}\/readiness/);assert.match(app,/BATCH_NOT_READY_TO_CLOSE|Tutup Batch/);assert.match(app,/Verifikasi/);assert.match(app,/verification_status==='VERIFIED'/);assert.match(app,/Jadwalkan Pengumuman/);assert.match(app,/type="datetime-local"/);console.log('RC32 parallel sprint frontend contract PASS');
