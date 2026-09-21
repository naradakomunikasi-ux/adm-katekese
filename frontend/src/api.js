import { createIdempotencyKey } from './idempotency.js';
const DEFAULT_TIMEOUT = 12000;
const RETRYABLE_STATUS = new Set([429,502,503,504]);

export class ApiError extends Error {
  constructor(message, { status=0, code='NETWORK_ERROR', requestId=null, retryAfterMs=null } = {}) {
    super(message); this.name='ApiError'; this.status=status; this.code=code; this.requestId=requestId; this.retryAfterMs=retryAfterMs;
  }
}
export function parseRetryAfterMs(value, nowMs=Date.now()){
  if(value==null||value==='') return null;
  const seconds=Number(value);
  if(Number.isFinite(seconds) && seconds>=0) return Math.min(30000,Math.round(seconds*1000));
  const at=Date.parse(String(value));
  if(!Number.isFinite(at)) return null;
  return Math.min(30000,Math.max(0,at-nowMs));
}
export function isRetryableReadError(error){
  return error instanceof ApiError && (error.code==='NETWORK_ERROR' || error.code==='TIMEOUT' || RETRYABLE_STATUS.has(error.status));
}
export function retryDelayMs(attempt,{base=150,max=1200}={}){ return Math.min(max,base*(2**Math.max(0,attempt))); }
const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));

export function createApiClient({ baseUrl='/api', getToken=()=>null, timeout=DEFAULT_TIMEOUT, readRetries=2, sleepFn=sleep, onUnauthorized=()=>{} } = {}) {
  async function singleRequest(path, { method='GET', body, signal, headers={} } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), timeout);
    const token = getToken();
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method, signal: signal || controller.signal,
        headers: { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) , ...headers },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const payload = await response.json().catch(()=>null);
      if (!response.ok || payload?.ok === false) {
        const apiError = new ApiError(payload?.error?.message || `Request failed (${response.status})`, {
          status: response.status, code: payload?.error?.code || 'HTTP_ERROR', requestId: payload?.requestId || response.headers.get('x-request-id'), retryAfterMs: parseRetryAfterMs(response.headers.get('retry-after'))
        });
        if (response.status === 401) {
          try { onUnauthorized(apiError); } catch { /* auth cleanup callback must not mask API error */ }
        }
        throw apiError;
      }
      return payload?.data ?? payload;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error?.name === 'AbortError') throw new ApiError('Permintaan melewati batas waktu.', { code:'TIMEOUT' });
      throw new ApiError('Tidak dapat terhubung ke server.', { code:'NETWORK_ERROR' });
    } finally { clearTimeout(timer); }
  }
  async function request(path, options={}){
    const method=String(options.method||'GET').toUpperCase();
    const attempts=method==='GET'?Math.max(0,Math.min(3,Number(readRetries)||0)):0;
    let lastError;
    for(let attempt=0;attempt<=attempts;attempt++){
      try{return await singleRequest(path,{...options,method});}
      catch(error){lastError=error;if(attempt>=attempts||!isRetryableReadError(error)||options.signal?.aborted)throw error;await sleepFn(error.retryAfterMs ?? retryDelayMs(attempt));}
    }
    throw lastError;
  }
  async function uploadFile(path,file,{title='',description='',accessRole='PESERTA',category='',programIds=[],headers={}}={}){
    if(!file) throw new ApiError('Pilih file terlebih dahulu.',{code:'VALIDATION_ERROR'});
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),timeout); const token=getToken();
    try{
      const response=await fetch(`${baseUrl}${path}`,{method:'POST',signal:controller.signal,headers:{...(token?{Authorization:`Bearer ${token}`}:{ }),'Content-Type':file.type||'application/octet-stream','X-File-Name':encodeURIComponent(file.name),'X-File-Title':encodeURIComponent(title),'X-File-Description':encodeURIComponent(description),'X-File-Access-Role':encodeURIComponent(accessRole),'X-File-Category':encodeURIComponent(category),'X-File-Program-Ids':encodeURIComponent(programIds.join(',')),...headers},body:file});
      const payload=await response.json().catch(()=>null);
      if(!response.ok||payload?.ok===false) throw new ApiError(payload?.error?.message||`Upload gagal (${response.status})`,{status:response.status,code:payload?.error?.code||'HTTP_ERROR',requestId:payload?.requestId||response.headers.get('x-request-id')});
      return payload?.data??payload;
    }catch(error){if(error instanceof ApiError)throw error;if(error?.name==='AbortError')throw new ApiError('Upload melewati batas waktu.',{code:'TIMEOUT'});throw new ApiError('Tidak dapat mengupload file.',{code:'NETWORK_ERROR'});}finally{clearTimeout(timer);}
  }
  async function downloadFile(path,filename='download'){
    const token=getToken(); const response=await fetch(`${baseUrl}${path}`,{headers:{...(token?{Authorization:`Bearer ${token}`}:{})}});
    if(!response.ok){const payload=await response.json().catch(()=>null);throw new ApiError(payload?.error?.message||`Download gagal (${response.status})`,{status:response.status,code:payload?.error?.code||'HTTP_ERROR'});}
    const blob=await response.blob(); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);return true;
  }
  return { request, get:(p,o)=>request(p,{...o,method:'GET'}), post:(p,b,o)=>request(p,{...o,method:'POST',body:b}), put:(p,b,o)=>request(p,{...o,method:'PUT',body:b}), patch:(p,b,o)=>request(p,{...o,method:'PATCH',body:b}), delete:(p,o)=>request(p,{...o,method:'DELETE'}), uploadFile, downloadFile, criticalPost:(p,b,o={})=>request(p,{...o,method:'POST',body:b,headers:{'Idempotency-Key':o.idempotencyKey||createIdempotencyKey(p),...(o.headers||{})}}) };
}
