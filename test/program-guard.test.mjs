import test from 'node:test';import assert from 'node:assert/strict';import {requireProgramPermission} from '../program-guard.mjs';
function invoke({actor={id:7},params={programId:'11'},body={},assignments=[],fail=false}={}){
 const sent={};const req={actor,params,body},res={status(n){sent.status=n;return this},json(v){sent.body=v;return this}};
 let nextCalled=false;
 const db=()=>({execute:async()=>{if(fail)throw new Error('DB DOWN');return [assignments]}});
 return requireProgramPermission(db,'registration.verify')(req,res,()=>{nextCalled=true}).then(()=>({sent,nextCalled,req}));
}
const valid={user_id:7,role_name:'Sekretariat',program_id:11,starts_at:null,ends_at:null,revoked_at:null};
test('accept server-authenticated scoped assignment',async()=>assert.equal((await invoke({assignments:[valid]})).nextCalled,true));
test('reject unauthenticated',async()=>assert.equal((await invoke({actor:null})).sent.status,401));
test('reject cross-program assignment',async()=>assert.equal((await invoke({assignments:[{...valid,program_id:12}]})).sent.status,403));
test('reject auditor mutation',async()=>assert.equal((await invoke({assignments:[{...valid,role_name:'Auditor'}]})).sent.status,403));
test('reject revoked assignment',async()=>assert.equal((await invoke({assignments:[{...valid,revoked_at:'2026-10-22'}]})).sent.status,403));
test('fail closed on DB outage',async()=>assert.equal((await invoke({fail:true})).sent.status,503));
test('reject malformed program id',async()=>assert.equal((await invoke({params:{programId:'0'}})).sent.status,400));
test('never use user role from body',async()=>assert.equal((await invoke({body:{role:'Super Admin'},assignments:[]})).sent.status,403));
