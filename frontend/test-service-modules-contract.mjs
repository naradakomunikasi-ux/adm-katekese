import fs from 'node:fs';import assert from 'node:assert/strict';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');const pages=fs.readFileSync(new URL('./src/page-registry.js',import.meta.url),'utf8');
for(const text of ['Perjalanan Peserta','Administrasi Dokumen','Pembayaran Program','Persetujuan Pastoral','Sertifikat','Pengumuman','Basis Pengetahuan Miyu','Laporan Pelayanan'])assert.ok(app.includes(text),`missing ${text}`);
assert.ok(pages.includes("endpoint:'/system/settings'"));assert.ok(pages.includes("endpoint:'/reports/programs'"));console.log('RC23 service module frontend contract: PASS');
