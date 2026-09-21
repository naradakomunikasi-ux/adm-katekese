import test from 'node:test';import assert from 'node:assert/strict';
import {encryptSetting,decryptSetting,mergeAiSettings,normalizeAiSettingsPatch,safeAiSettings} from '../src/ai-settings-store.js';
const secret='x'.repeat(40);
test('AI setting secrets encrypt and decrypt',()=>{const enc=encryptSetting('api-secret',secret);assert.notEqual(enc,'api-secret');assert.equal(decryptSetting(enc,secret),'api-secret');});
test('database settings override environment without leaking secrets',()=>{const config=mergeAiSettings({env:{LLM_API_BASE_URL:'https://env/v1',LLM_API_KEY:'envkey',LLM_MODEL:'env'},secret,row:{primary_base_url:'https://db/v1',primary_model:'db',primary_api_key_enc:encryptSetting('dbkey',secret)}});const safe=safeAiSettings(config);assert.equal(config.primary.apiKey,'dbkey');assert.equal(safe.primary.baseUrl,'https://db/v1');assert.equal(JSON.stringify(safe).includes('dbkey'),false);});
test('settings patch allowlists escalation policy',()=>{assert.equal(normalizeAiSettingsPatch({cloudEscalation:'anything'}).cloudEscalation,'complex_only');assert.equal(normalizeAiSettingsPatch({cloudEscalation:'always'}).cloudEscalation,'always');});
