import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NAV_GROUPS, ROLE_PAGE_ACCESS } from './src/navigation.js';
import { PAGE_REGISTRY } from './src/page-registry.js';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('./src/api.js',import.meta.url),'utf8');
const labels=NAV_GROUPS.flatMap(([,items])=>items.map(([,label])=>label));
const checks=[
 ['library navigation exists',labels.includes('Perpustakaan Digital')],
 ['library page uses production endpoint',PAGE_REGISTRY.library?.endpoint==='/library/files'],
 ['all roles can access library page',['SUPER_ADMIN','ADMIN_KATEKESE','ADMIN_PROGRAM','KATEKIS','PASTOR','PESERTA'].every(r=>ROLE_PAGE_ACCESS[r].includes('*')||ROLE_PAGE_ACCESS[r].includes('library'))],
 ['admin upload UI is role constrained',app.includes("['SUPER_ADMIN','ADMIN_KATEKESE','ADMIN_PROGRAM'].includes(role)")],
 ['file picker accepts supported office/image types',app.includes('.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif')],
 ['binary upload API exists',api.includes('async function uploadFile')&&api.includes("'X-File-Name':encodeURIComponent(file.name)")],
 ['authenticated download API exists',api.includes('async function downloadFile')&&api.includes('Authorization:`Bearer ${token}`')],
];
for(const [name,pass] of checks){assert.equal(pass,true,name);console.log(`PASS ${name}`)}console.log(`Library contract: ${checks.length}/${checks.length} PASS`);
