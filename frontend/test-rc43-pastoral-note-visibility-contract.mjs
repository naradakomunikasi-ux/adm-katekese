import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
assert.doesNotMatch(app,/visibility:'PASTORAL_TEAM'/);
assert.match(app,/value="PASTOR_ONLY">Hanya Pastor/);
assert.match(app,/value="PASTOR_KATEKIS">Pastor \+ Katekis/);
assert.match(app,/value="ADMIN_PASTOR">Admin Katekese \+ Pastor/);
assert.doesNotMatch(app,/\['SUPER_ADMIN','ADMIN_KATEKESE','KATEKIS','PASTOR'\]\.includes\(role\).*Catatan Pelayanan/);
console.log('RC43 pastoral note visibility frontend contract PASS');
