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
