import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');const css=readFileSync(new URL('./src/styles.css',import.meta.url),'utf8');
for(const token of ['ParticipantProfileWorkspace','participantProfileHeader','participantTabs','Ringkasan','Kehadiran','Dokumen','Pembayaran','Komunikasi','Pendampingan Pastoral','Sertifikat','Lihat Profil Pelayanan','profilePhotoUrl','preferredName','aria-selected'])assert.ok(app.includes(token),`missing ${token}`);
for(const token of ['.participantProfileHeader','.participantTabs','.profileTabPanel','.participantAvatar'])assert.ok(css.includes(token),`missing ${token}`);
console.log('RC72 participant profile tabs contract: 18/18 PASS');

