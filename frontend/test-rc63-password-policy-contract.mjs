import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('src/App.jsx','utf8');
const checks=[
  ['login minimum 8',/current-password" required minLength="8"/.test(app)],
  ['reset password minimum 8',(app.match(/new-password" required minLength="8"/g)||[]).length>=2],
  ['old minimum 12 removed',!app.includes('minLength="12"')],
];
for(const [name,ok] of checks) assert.ok(ok,name);
console.log(`RC63 password policy contract ${checks.length}/${checks.length} PASS`);
