import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
for(const token of ['CommunicationsWorkspace','Buat Pesan & Reminder','/communications/context','/communications','Semua penerima','Program tertentu','Peserta tertentu','WHATSAPP','Preview Pesan','Jadwalkan Pesan'])assert.ok(app.includes(token),`missing ${token}`);
console.log('RC70 communication workspace contract: 10/10 PASS');
