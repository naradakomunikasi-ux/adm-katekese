import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NAV_GROUPS, MOBILE_NAV, ROLE_PAGE_ACCESS } from './src/navigation.js';
import { PAGE_REGISTRY } from './src/page-registry.js';

const app = fs.readFileSync(new URL('./src/App.jsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('./src/styles.css', import.meta.url), 'utf8');

test('six production roles are defined', () => {
  assert.deepEqual(Object.keys(ROLE_PAGE_ACCESS).sort(), ['ADMIN_KATEKESE','ADMIN_PROGRAM','KATEKIS','PASTOR','PESERTA','SUPER_ADMIN'].sort());
});

test('pastoral productivity navigation includes required groups and pages', () => {
  const labels = NAV_GROUPS.flatMap(([,items])=>items.map(([,label])=>label));
  for (const label of ['Program & Batch','Peserta','Pertemuan & Kehadiran','Dokumen','Pembayaran','Persetujuan Pastoral','Sertifikat','Pengumuman','Pesan & Reminder','Perpustakaan Digital','Ask Miyu','Laporan','Pengaturan']) assert.ok(labels.includes(label),`missing ${label}`);
  for (const legacy of ['Participant 360','Notifikasi','WhatsApp','AI & Integrasi','Basis Pengetahuan']) assert.ok(!labels.includes(legacy),`legacy primary nav must be removed: ${legacy}`);
});

test('role-aware mobile nav has exactly five items and responsive breakpoint', () => {
  for (const [role,items] of Object.entries(MOBILE_NAV)) assert.equal(items.length,5,`${role} must have five mobile items`);
  assert.match(css, /@media\(max-width:720px\)/);
  assert.match(css, /\.mobileNav\{display:grid/);
  assert.match(css, /\.sidebar\{display:none\}/);
});

test('dashboard is API-driven and production page registry is present', () => {
  assert.ok(app.includes("PAGE_REGISTRY"));
  assert.ok(app.includes("api.get(config.endpoint)"));
  assert.equal(PAGE_REGISTRY.dashboard.endpoint,'/dashboard');
  assert.ok(Object.keys(PAGE_REGISTRY).length >= 18);
});
