import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
assert.match(source,/Username atau Email/);
assert.match(source,/type="text" autoComplete="username"/);
assert.match(source,/api\.post\('\/auth\/login',\{identity:loginIdentity,password\}\)/);
console.log('RC62 frontend login identity contract: 3/3 PASS');
