import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnnouncement, announcementAudienceForRole } from '../src/service-modules.js';

test('announcement audience is normalized and constrained',()=>{
 assert.equal(normalizeAnnouncement({title:'Info',body:'Isi',audience:'peserta'}).audience,'PESERTA');
 assert.throws(()=>normalizeAnnouncement({title:'Info',body:'Isi',audience:'SECRET'}),/Invalid announcement audience/);
});

test('role maps to canonical announcement audience',()=>{
 assert.equal(announcementAudienceForRole('PESERTA'),'PESERTA');
 assert.equal(announcementAudienceForRole('KATEKIS'),'KATEKIS');
 assert.equal(announcementAudienceForRole('PASTOR'),'PASTOR');
 assert.equal(announcementAudienceForRole('ADMIN_KATEKESE'),'ADMIN');
 assert.equal(announcementAudienceForRole('SUPER_ADMIN'),'ADMIN');
});
