const KEY='adm-katekese-session';
export function loadSession(storage=globalThis.sessionStorage){
  try { const raw=storage?.getItem(KEY); if(!raw)return null; const value=JSON.parse(raw); if(!value?.token||!value?.user)return null; return value; } catch { return null; }
}
export function saveSession(session,storage=globalThis.sessionStorage){ storage?.setItem(KEY,JSON.stringify(session)); return session; }
export function clearSession(storage=globalThis.sessionStorage){ storage?.removeItem(KEY); }
export function isExpired(session,now=Date.now()){ return !session?.expiresAt || new Date(session.expiresAt).getTime() <= now; }
export function millisecondsUntilExpiry(session,now=Date.now()){
  if(!session?.expiresAt)return 0;
  const remaining=new Date(session.expiresAt).getTime()-now;
  return Number.isFinite(remaining)?Math.max(0,remaining):0;
}
export function sessionExpiryLevel(session,now=Date.now(),warningWindowMs=5*60*1000){
  const remaining=millisecondsUntilExpiry(session,now);
  if(remaining<=0)return 'expired';
  if(remaining<=warningWindowMs)return 'warning';
  return 'active';
}

export const DEFAULT_IDLE_TIMEOUT_MS=30*60*1000;
export function lastActivityAt(session){
 const value=Number(session?.lastActivityAt||0);
 return Number.isFinite(value)&&value>0?value:0;
}
export function isIdle(session,now=Date.now(),idleTimeoutMs=DEFAULT_IDLE_TIMEOUT_MS){
 const last=lastActivityAt(session);
 if(!last)return false;
 return now-last>=idleTimeoutMs;
}
export function touchSession(session,now=Date.now(),storage=globalThis.sessionStorage){
 if(!session)return null;
 const next={...session,lastActivityAt:now};
 saveSession(next,storage);
 return next;
}
export function sessionSecurityState(session,now=Date.now(),warningWindowMs=5*60*1000,idleTimeoutMs=DEFAULT_IDLE_TIMEOUT_MS){
 if(isExpired(session,now))return 'expired';
 if(isIdle(session,now,idleTimeoutMs))return 'idle';
 return sessionExpiryLevel(session,now,warningWindowMs);
}
