import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('./src/ui-state.js',import.meta.url),'utf8');
const nav=fs.readFileSync(new URL('./src/navigation.js',import.meta.url),'utf8');
const checks=[
 ['forbidden copy is explicit',ui.includes('Anda tidak memiliki akses.')],
 ['forbidden state offers role guidance',app.includes('Akses dibatasi sesuai peran Anda')],
 ['forbidden state has dashboard recovery action',app.includes('Kembali ke Dashboard')],
 ['403 maps to forbidden state',app.includes("err.status===403)setState('forbidden')")],
 ['route guard returns unauthorized user to dashboard',app.includes("if(!canAccessPage(role,page)) setPage('dashboard')")],
 ['navigation is role-aware',nav.includes('canAccessPage')],
];
for(const [name,pass] of checks){assert.equal(pass,true,name);console.log(`PASS ${name}`)}
console.log(`Permission UX: ${checks.length}/${checks.length} PASS`);
