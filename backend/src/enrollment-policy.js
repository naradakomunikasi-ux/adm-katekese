export const ENROLLMENT_STATUSES=['REGISTERED','ACTIVE','COMPLETED','CANCELLED'];

export function normalizeEnrollmentInput(input={}){
  const programId=String(input.programId||'').trim();
  const batchId=input.batchId==null||input.batchId===''?null:String(input.batchId).trim();
  const status=String(input.status||'REGISTERED').toUpperCase();
  if(!programId)throw new Error('programId is required');
  if(!ENROLLMENT_STATUSES.includes(status))throw new Error('Invalid enrollment status');
  return {programId,batchId,status};
}

export function canTransitionEnrollment(from,to){
  const f=String(from||'').toUpperCase(),t=String(to||'').toUpperCase();
  if(!ENROLLMENT_STATUSES.includes(f)||!ENROLLMENT_STATUSES.includes(t))return false;
  if(f===t)return true;
  const allowed={REGISTERED:['ACTIVE','CANCELLED'],ACTIVE:['COMPLETED','CANCELLED'],COMPLETED:[],CANCELLED:['REGISTERED']};
  return allowed[f].includes(t);
}

export function isActiveEnrollment(status){
  return ['REGISTERED','ACTIVE'].includes(String(status||'').toUpperCase());
}
