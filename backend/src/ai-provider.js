import { groundedFallback, citationsFromEvidence } from './rag.js';
import { validateAnswerGrounding } from './answer-grounding.js';
import { aiFabricConfig, selectAiRoute } from './ai-fabric-config.js';

export function aiConfig(env=process.env){ return aiFabricConfig(env).primary; }
export function isAiConfigured(config=aiConfig()){ return Boolean(config.baseUrl&&config.apiKey&&config.model); }
export function buildGroundedMessages(query,evidence=[]){
 const context=evidence.map((e,i)=>`[${i+1}] ${e.title}\n${e.content}`).join('\n\n');
 return [
  {role:'system',content:'Anda adalah Ask Miyu Admin, asisten informasi umat Adm Katekese. Jawab hanya berdasarkan konteks yang diberikan. Fokus pada informasi pelayanan dan administrasi seperti jadwal misa, pendaftaran katekumen, baptis, komuni, krisma, persyaratan dokumen, jadwal pertemuan, kontak, dan pengumuman. Jangan membuat keputusan pastoral, jangan mengarang jadwal/tanggal/biaya, dan jika konteks tidak cukup nyatakan bahwa informasi belum tersedia. Gunakan nomor sumber [n] untuk setiap fakta utama.'},
  {role:'user',content:`Pertanyaan umat: ${query}\n\nKonteks knowledge terverifikasi:\n${context}`}
 ];
}

async function callProvider({query,evidence,provider,fetchImpl}){
 const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),provider.timeoutMs||15000);
 try{
  const response=await fetchImpl(`${provider.baseUrl}/chat/completions`,{method:'POST',signal:controller.signal,headers:{Authorization:`Bearer ${provider.apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:provider.model,temperature:0.1,messages:buildGroundedMessages(query,evidence)})});
  if(!response.ok) throw new Error(`LLM provider error ${response.status}`);
  const payload=await response.json(); const answer=payload?.choices?.[0]?.message?.content?.trim();
  if(!answer) throw new Error('LLM provider returned empty answer');
  const grounding=validateAnswerGrounding(answer,evidence);
  if(!grounding.valid) return {ok:false,reason:`UNGROUNDED_PROVIDER_ANSWER:${grounding.reason}`};
  return {ok:true,answer,grounding};
 } finally { clearTimeout(timer); }
}

export async function answerWithProvider({query,evidence,confidence='none',config=aiFabricConfig(),fetchImpl=globalThis.fetch}){
 if(!evidence?.length) return {...groundedFallback(query,evidence),provider:'fallback',route:'fallback'};
 const fabricConfig=config?.primary?config:{...aiFabricConfig({}),primary:config,cloud:{enabled:false,baseUrl:'',apiKey:'',model:'',timeoutMs:20000},routing:{cloudEscalation:'complex_only',requireCitations:true}};
 const selected=selectAiRoute({confidence,config:fabricConfig});
 if(!selected.provider) return {...groundedFallback(query,evidence),provider:'fallback',route:'fallback'};
 try{
   const result=await callProvider({query,evidence,provider:selected.provider,fetchImpl});
   if(!result.ok) return {...groundedFallback(query,evidence),provider:'fallback',route:selected.route,degraded:true,degradedReason:result.reason};
   return {answer:result.answer,grounded:true,citations:citationsFromEvidence(evidence),provider:'external',route:selected.route,model:selected.provider.model,grounding:result.grounding};
 } catch(error) {
   const cloud=fabricConfig.cloud;
   const canFallbackCloud=selected.route==='primary'&&cloud.enabled&&cloud.baseUrl&&cloud.apiKey&&cloud.model&&['medium','high'].includes(confidence);
   if(canFallbackCloud){
     try{
       const cloudResult=await callProvider({query,evidence,provider:cloud,fetchImpl});
       if(cloudResult.ok) return {answer:cloudResult.answer,grounded:true,citations:citationsFromEvidence(evidence),provider:'external',route:'cloud-fallback',model:cloud.model,grounding:cloudResult.grounding,degraded:true,degradedReason:'PRIMARY_PROVIDER_FAILED'};
     }catch{}
   }
   const fallback=groundedFallback(query,evidence);
   return {...fallback,provider:'fallback',route:selected.route,degraded:true,degradedReason:error?.name==='AbortError'?'PROVIDER_TIMEOUT':'PROVIDER_ERROR'};
 }
}
export function chunkDocument(text,{maxChars=1200,overlap=150}={}){
 const normalized=String(text||'').replace(/\s+/g,' ').trim(); if(!normalized)return [];
 const chunks=[]; let start=0; while(start<normalized.length){const end=Math.min(normalized.length,start+maxChars);chunks.push(normalized.slice(start,end));if(end===normalized.length)break;start=Math.max(start+1,end-overlap);} return chunks;
}
