import crypto from 'node:crypto';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeRequestId(value, generator=()=>crypto.randomUUID()){
  const candidate=String(value??'').trim();
  return UUID_RE.test(candidate)?candidate:generator();
}

export function apiCachePolicy(path=''){
  if(path==='/api/health'||path==='/api/openapi.json') return 'no-cache';
  return 'no-store';
}

export function createRuntimeState(){
  let phase='starting';
  return {
    markReady(){ if (phase !== 'shutting_down') phase='ready'; },
    markShuttingDown(){phase='shutting_down';},
    markDegraded(){ if (phase !== 'shutting_down') phase='degraded'; },
    get phase(){return phase;},
    isReady(){return phase==='ready';},
    canProbeDependencies(){return phase!=='shutting_down';},
  };
}
