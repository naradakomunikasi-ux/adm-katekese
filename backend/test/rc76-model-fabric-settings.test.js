import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mergeAiSettings,normalizeAiSettingsPatch,safeAiSettings} from '../src/ai-settings-store.js';

test('RC76 normalizes explicit Model Fabric selections',()=>{
 const value=normalizeAiSettingsPatch({selectedCapabilityCode:'knowledge.answer',classNoteModelCode:'classnote-knowledge-g2',primaryEngineCode:'engine-classnote'});
 assert.deepEqual([value.selectedCapabilityCode,value.classNoteModelCode,value.primaryEngineCode],['knowledge.answer','classnote-knowledge-g2','engine-classnote']);
});
test('RC76 database selections override defaults and remain safe',()=>{
 const value=safeAiSettings(mergeAiSettings({row:{selected_capability_code:'knowledge.answer',classnote_model_code:'classnote-companion-g3',primary_engine_code:'engine-local-compatible'},env:{},secret:'x'.repeat(40)}));
 assert.equal(value.classNote.modelCode,'classnote-companion-g3');
 assert.equal(value.engine.primaryCode,'engine-local-compatible');
});
test('RC76 registry migration defines constrained specific choices',()=>{
 const sql=fs.readFileSync(new URL('../../database/migrations/052_up.sql',import.meta.url),'utf8');
 for(const marker of ['ai_model_engines','CLASSNOTE_MODEL','PRIMARY_ENGINE','classnote-knowledge-g2','engine-classnote','REFERENCES ai_capabilities']) assert.ok(sql.includes(marker),marker);
});
