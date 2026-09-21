import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
assert.match(app,/Cicilan/);
assert.match(app,/certificates\/\$\{x.id\}\/download/);
assert.match(app,/Download PDF/);
console.log('RC33 frontend contract: 3/3 PASS');
