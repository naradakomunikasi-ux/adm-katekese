import crypto from 'node:crypto';

export function embeddingConfig(env=process.env){
  return {
    baseUrl:String(env.EMBEDDING_API_BASE_URL||env.LLM_API_BASE_URL||'').replace(/\/$/,''),
    apiKey:String(env.EMBEDDING_API_KEY||env.LLM_API_KEY||''),
    model:String(env.EMBEDDING_MODEL||''),
    timeoutMs:Math.max(1000,Math.min(60000,Number(env.EMBEDDING_TIMEOUT_MS||15000))),
  };
}
export function isEmbeddingConfigured(config=embeddingConfig()){return Boolean(config.baseUrl&&config.apiKey&&config.model);}
export function contentHash(text){return crypto.createHash('sha256').update(String(text||'')).digest('hex');}
export async function embedTexts(texts,{config=embeddingConfig(),fetchImpl=globalThis.fetch}={}){
  const input=(texts||[]).map(v=>String(v||'').trim()).filter(Boolean);
  if(!input.length)return [];
  if(!isEmbeddingConfigured(config))return {vectors:[],provider:'unconfigured',degraded:true};
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),config.timeoutMs);
  try{
    const response=await fetchImpl(`${config.baseUrl}/embeddings`,{method:'POST',signal:controller.signal,headers:{Authorization:`Bearer ${config.apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:config.model,input})});
    if(!response.ok)throw new Error(`Embedding provider error ${response.status}`);
    const payload=await response.json();
    const vectors=(payload?.data||[]).sort((a,b)=>(a.index??0)-(b.index??0)).map(x=>x.embedding).filter(Array.isArray);
    if(vectors.length!==input.length)throw new Error('Embedding vector count mismatch');
    return {vectors,provider:'external',degraded:false};
  }catch(error){
    return {vectors:[],provider:'fallback',degraded:true,degradedReason:error?.name==='AbortError'?'PROVIDER_TIMEOUT':'PROVIDER_ERROR'};
  }finally{clearTimeout(timer);}
}
export function cosineSimilarity(a=[],b=[]){
  if(!a.length||a.length!==b.length)return 0;
  let dot=0,aa=0,bb=0; for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];}
  return aa&&bb?dot/(Math.sqrt(aa)*Math.sqrt(bb)):0;
}
