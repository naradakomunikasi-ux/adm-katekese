import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const app=readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
for(const token of ['Status Pengiriman','delivery attempt dan receipt','/communications/campaigns','/communications/${id}/queue','Masukkan Antrean','Terkirim','Gagal'])assert.ok(app.includes(token),`missing ${token}`);
console.log('RC75 communication delivery lifecycle UX contract: 7/7 PASS');
