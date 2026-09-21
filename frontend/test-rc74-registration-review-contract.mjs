import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const app=readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const nav=readFileSync(new URL('./src/navigation.js',import.meta.url),'utf8');
const registry=readFileSync(new URL('./src/page-registry.js',import.meta.url),'utf8');
for(const token of ['RegistrationReviewWorkspace','Registration Review Workspace','Mulai Tinjau','Minta Dilengkapi','Terima','Tidak Dilanjutkan','Akun login tidak dibuat otomatis','/registrations/${selected.item.id}/accept','/registrations/${selected.item.id}/review'])assert.ok(app.includes(token),`missing ${token}`);
assert.ok(nav.includes("['registrations','Pendaftaran Masuk']"));
assert.ok(registry.includes("registrations:{title:'Pendaftaran Masuk',endpoint:'/registrations'"));
console.log('RC74 registration review UX contract: 11/11 PASS');
