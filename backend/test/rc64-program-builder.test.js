import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultJourneyStages,normalizeJourneyStages,normalizeProgramTypeCode} from '../src/program-builder.js';

test('RC64 provides configurable sacramental journey templates',()=>{
 const baptis=defaultJourneyStages('BAPTIS_BAYI');
 assert.equal(baptis[0].label,'Pendaftaran');
 assert.equal(baptis.at(-1).label,'Selesai');
 assert.ok(baptis.some(x=>x.approvalRequired));
});
test('RC64 custom journey preserves human labels and stable ordering',()=>{
 const stages=normalizeJourneyStages([{label:'Mulai'},{label:'Pendampingan Pastoral',approvalRequired:true},{label:'Selesai'}],'CUSTOM');
 assert.deepEqual(stages.map(x=>x.sortOrder),[1,2,3]);
 assert.equal(stages[1].approvalRequired,true);
});
test('RC64 rejects duplicate journey stages',()=>assert.throws(()=>normalizeJourneyStages(['Pembinaan','Pembinaan'],'CUSTOM'),/Duplicate/));
test('RC64 normalizes generic program type',()=>assert.equal(normalizeProgramTypeCode('bina iman remaja'),'BINA_IMAN_REMAJA'));

test('Program Builder has dedicated MRT journey with couple and pastoral gates',()=>{
 const mrt=defaultJourneyStages('MRT');
 assert.ok(mrt.some(x=>/Calon Mempelai 1/.test(x.label)));
 assert.ok(mrt.some(x=>/Calon Mempelai 2/.test(x.label)));
 assert.ok(mrt.some(x=>/Kehadiran Pasangan/.test(x.label)));
 assert.ok(mrt.some(x=>x.approvalRequired));
});

test('Program Builder has continuous OMK membership journey',()=>{
 const omk=defaultJourneyStages('OMK');
 assert.ok(omk.some(x=>x.label==='Anggota Aktif'));
 assert.ok(omk.some(x=>/Pelayanan/.test(x.label)));
 assert.equal(omk.at(-1).label,'Arsip');
});

test('Program Builder has simplified event journeys',()=>{
 const seminar=defaultJourneyStages('SEMINAR');
 assert.deepEqual(seminar.map(x=>x.label),['Pendaftaran','Pembayaran Opsional','Konfirmasi','Kehadiran','Pelaksanaan','Selesai']);
});
