import fs from 'node:fs';
import { validateRuntimeConfig } from '../backend/src/runtime-config.js';
function parseEnv(text){ const out={}; for(const raw of text.split(/\r?\n/)){ const line=raw.trim(); if(!line||line.startsWith('#'))continue; const i=line.indexOf('='); if(i<1)continue; out[line.slice(0,i)]=line.slice(i+1); } return out; }
const version=fs.readFileSync('VERSION','utf8').trim();
const env=parseEnv(fs.readFileSync('.env.example','utf8'));
const result=validateRuntimeConfig(env,{expectedVersion:version,allowPlaceholders:true});
if(!result.ok){ console.error(JSON.stringify({gate:'runtime-config-contract',status:'FAIL',errors:result.errors,diagnostics:result.diagnostics},null,2)); process.exit(1); }
console.log(JSON.stringify({gate:'runtime-config-contract',status:'PASS',warnings:result.warnings,diagnostics:result.diagnostics},null,2));
