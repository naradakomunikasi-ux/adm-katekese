export const PROGRAM_STATUSES=['DRAFT','REVIEW','PENDING_APPROVAL','PUBLISHED','ACTIVE','COMPLETED','ARCHIVED'];
export const PROGRAM_FEATURE_KEYS=['registrationEnabled','documentRequirementEnabled','meetingEnabled','attendanceEnabled','paymentEnabled','certificateEnabled','announcementEnabled','pastoralApprovalEnabled'];

function dateOnly(value,label){if(value==null||value==='')return null;const v=String(value);if(!/^\d{4}-\d{2}-\d{2}$/.test(v))throw new Error(`Invalid ${label}`);return v;}

export function normalizeProgramInput(input={}){
  const name=String(input.name||'').trim();
  if(!name || name.length>160) throw new Error('Invalid program name');
  const code=String(input.code||name).trim().toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,64);
  if(!code) throw new Error('Invalid program code');
  const status=String(input.status||'DRAFT').toUpperCase();
  if(!PROGRAM_STATUSES.includes(status)) throw new Error('Invalid program status');
  const capacity=input.capacity==null||input.capacity===''?null:Number(input.capacity);
  if(capacity!==null && (!Number.isInteger(capacity)||capacity<0)) throw new Error('Invalid capacity');
  const startDate=dateOnly(input.startDate,'startDate'),endDate=dateOnly(input.endDate,'endDate');
  if(startDate&&endDate&&endDate<startDate)throw new Error('endDate must be on or after startDate');
  return {code,name,description:String(input.description||'').trim().slice(0,4000)||null,category:String(input.category||'').trim().slice(0,80)||null,location:String(input.location||'').trim().slice(0,200)||null,picName:String(input.picName||'').trim().slice(0,160)||null,capacity,status,startDate,endDate,publishAt:input.publishAt||null};
}

export function normalizeProgramFeatures(input={}){
  const out={};
  for(const key of PROGRAM_FEATURE_KEYS) out[key]=Boolean(input[key]);
  return out;
}

export function canTransitionProgram(from,to,{approvalRequired=false}={}){
  const f=String(from||'').toUpperCase(), t=String(to||'').toUpperCase();
  if(!PROGRAM_STATUSES.includes(f)||!PROGRAM_STATUSES.includes(t)) return false;
  if(f===t) return true;
  const allowed={DRAFT:['REVIEW','ARCHIVED'],REVIEW:approvalRequired?['DRAFT','PENDING_APPROVAL']:['DRAFT','PUBLISHED'],PENDING_APPROVAL:['REVIEW','PUBLISHED'],PUBLISHED:['ACTIVE','ARCHIVED'],ACTIVE:['COMPLETED','ARCHIVED'],COMPLETED:['ARCHIVED'],ARCHIVED:[]};
  return allowed[f].includes(t);
}

export function normalizeProgramPatch(input={}, {allowEmpty=false}={}){
 const out={};
 if(Object.hasOwn(input,'name')){const name=String(input.name||'').trim();if(!name||name.length>160)throw new Error('Invalid program name');out.name=name;}
 if(Object.hasOwn(input,'description'))out.description=String(input.description||'').trim().slice(0,4000)||null;
 if(Object.hasOwn(input,'category'))out.category=String(input.category||'').trim().slice(0,80)||null;
 if(Object.hasOwn(input,'location'))out.location=String(input.location||'').trim().slice(0,200)||null;
 if(Object.hasOwn(input,'picName'))out.picName=String(input.picName||'').trim().slice(0,160)||null;
 if(Object.hasOwn(input,'capacity')){const capacity=input.capacity==null||input.capacity===''?null:Number(input.capacity);if(capacity!==null&&(!Number.isInteger(capacity)||capacity<0))throw new Error('Invalid capacity');out.capacity=capacity;}
 if(Object.hasOwn(input,'startDate'))out.startDate=dateOnly(input.startDate,'startDate');
 if(Object.hasOwn(input,'endDate'))out.endDate=dateOnly(input.endDate,'endDate');
 if(Object.hasOwn(input,'startDate')||Object.hasOwn(input,'endDate')){const sd=out.startDate??input.currentStartDate??null,ed=out.endDate??input.currentEndDate??null;if(sd&&ed&&ed<sd)throw new Error('endDate must be on or after startDate');}
 if(Object.hasOwn(input,'publishAt'))out.publishAt=input.publishAt||null;
 if(!allowEmpty&&!Object.keys(out).length)throw new Error('No program fields to update');
 return out;
}

export function validateProgramFeatureDependencies(features={}){
  const f=normalizeProgramFeatures(features);
  const errors=[];
  if(f.attendanceEnabled&&!f.meetingEnabled)errors.push('Attendance requires meetings');
  if(f.certificateEnabled&&!f.registrationEnabled)errors.push('Certificates require participant registration');
  if(f.documentRequirementEnabled&&!f.registrationEnabled)errors.push('Document requirements require participant registration');
  if(f.paymentEnabled&&!f.registrationEnabled)errors.push('Payments require participant registration');
  return {valid:errors.length===0,errors,features:f};
}

export function programReadiness({program={},features={},batchCount=0,publishedMeetingCount=0,documentRequirementCount=0,certificateRuleCount=0,paymentSettingsCount=0}={}){
  const f=normalizeProgramFeatures(features);
  const blockers=[];
  if(!String(program.name||'').trim())blockers.push('PROGRAM_NAME_REQUIRED');
  if(!String(program.category||'').trim())blockers.push('PROGRAM_CATEGORY_REQUIRED');
  if(f.meetingEnabled&&Number(batchCount)<1)blockers.push('BATCH_REQUIRED');
  if(f.meetingEnabled&&Number(publishedMeetingCount)<1)blockers.push('PUBLISHED_MEETING_REQUIRED');
  if(f.documentRequirementEnabled&&Number(documentRequirementCount)<1)blockers.push('DOCUMENT_REQUIREMENT_REQUIRED');
  if(f.certificateEnabled&&Number(certificateRuleCount)<1)blockers.push('CERTIFICATE_RULE_REQUIRED');
  if(f.paymentEnabled&&Number(paymentSettingsCount)<1)blockers.push('PAYMENT_SETTINGS_REQUIRED');
  return {ready:blockers.length===0,blockers};
}

export function programCompletionReadiness({batchStatuses=[],meetingStatuses=[]}={}){
 const blockers=[];
 const openBatches=(batchStatuses||[]).filter(s=>!['CLOSED','ARCHIVED'].includes(String(s||'').toUpperCase())).length;
 const openMeetings=(meetingStatuses||[]).filter(s=>!['COMPLETED','CANCELLED','ARCHIVED'].includes(String(s||'').toUpperCase())).length;
 if(openBatches>0)blockers.push('BATCHES_NOT_CLOSED');
 if(openMeetings>0)blockers.push('MEETINGS_NOT_FINISHED');
 return {readyToComplete:blockers.length===0,blockers,openBatches,openMeetings};
}
