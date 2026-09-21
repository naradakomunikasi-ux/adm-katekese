import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
for(const marker of ['Ask Miyu','Sumber jawaban','result?.evidence','result?.citations','Buka sumber','Evidence belum cukup untuk jawaban grounded.']) assert.ok(app.includes(marker),`missing ${marker}`);
assert.match(app,/target=\"_blank\" rel=\"noreferrer\"/);
console.log('Ask Miyu grounding UI contract: 7/7 PASS');
