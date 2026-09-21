export const BATCH_STATUSES=['PLANNED','OPEN','ACTIVE','CLOSED','ARCHIVED'];
export const MEETING_STATUSES=['DRAFT','PUBLISHED','SCHEDULED','COMPLETED','CANCELLED','ARCHIVED'];
export const AUDIENCE_GROUPS=['REMAJA','OMK','DEWASA','ALL'];

function text(value,max=200){const v=String(value??'').trim();return v?v.slice(0,max):null;}
function dateOnly(value,label){if(value==null||value==='')return null;const v=String(value);if(!/^\d{4}-\d{2}-\d{2}$/.test(v))throw new Error(`Invalid ${label}`);return v;}
function dateTime(value,label,{required=false}={}){if(value==null||value===''){if(required)throw new Error(`${label} is required`);return null;}const d=new Date(value);if(Number.isNaN(d.getTime()))throw new Error(`Invalid ${label}`);return d.toISOString();}

export function normalizeBatchInput(input={}){
 const programId=String(input.programId||'').trim();
 const name=String(input.name||'').trim();
 if(!programId)throw new Error('programId is required');
 if(!name||name.length>160)throw new Error('Invalid batch name');
 const status=String(input.status||'PLANNED').toUpperCase();if(!BATCH_STATUSES.includes(status))throw new Error('Invalid batch status');
 const startDate=dateOnly(input.startDate,'startDate'),endDate=dateOnly(input.endDate,'endDate');
 if(startDate&&endDate&&endDate<startDate)throw new Error('endDate must be on or after startDate');
 const registrationOpenAt=dateTime(input.registrationOpenAt,'registrationOpenAt');
 const registrationCloseAt=dateTime(input.registrationCloseAt,'registrationCloseAt');
 if(registrationOpenAt&&registrationCloseAt&&registrationCloseAt<registrationOpenAt)throw new Error('registrationCloseAt must be after registrationOpenAt');
 const capacity=input.capacity==null||input.capacity===''?null:Number(input.capacity);if(capacity!==null&&(!Number.isInteger(capacity)||capacity<0))throw new Error('Invalid capacity');
 return {programId,name,startDate,endDate,status,registrationOpenAt,registrationCloseAt,capacity};
}

export function normalizeMeetingInput(input={}){
 const batchId=String(input.batchId||'').trim();const title=String(input.title||'').trim();
 if(!batchId)throw new Error('batchId is required');if(!title||title.length>200)throw new Error('Invalid meeting title');
 const startsAt=dateTime(input.startsAt,'startsAt',{required:true}),endsAt=dateTime(input.endsAt,'endsAt');if(endsAt&&endsAt<=startsAt)throw new Error('endsAt must be after startsAt');
 const attendanceOpensAt=dateTime(input.attendanceOpensAt,'attendanceOpensAt'),attendanceClosesAt=dateTime(input.attendanceClosesAt,'attendanceClosesAt');if(attendanceOpensAt&&attendanceClosesAt&&attendanceClosesAt<=attendanceOpensAt)throw new Error('attendanceClosesAt must be after attendanceOpensAt');
 const audienceGroup=String(input.audienceGroup||'ALL').toUpperCase();if(!AUDIENCE_GROUPS.includes(audienceGroup))throw new Error('Invalid audience group');
 const status=String(input.status||'DRAFT').toUpperCase();if(!MEETING_STATUSES.includes(status))throw new Error('Invalid meeting status');
 return {batchId,title,theme:text(input.theme,200),material:text(input.material,4000),startsAt,endsAt,location:text(input.location,200),audienceGroup,status,attendanceOpensAt,attendanceClosesAt};
}

export function normalizeTeachers(input=[]){
 if(!Array.isArray(input))throw new Error('teachers must be an array');
 const seen=new Set();return input.map((row)=>{const teacherName=String(row?.teacherName||row?.name||'').trim().slice(0,160);if(!teacherName)throw new Error('Invalid teacher name');const audienceGroup=String(row?.audienceGroup||'ALL').toUpperCase();if(!AUDIENCE_GROUPS.includes(audienceGroup))throw new Error('Invalid teacher audience group');const key=`${teacherName.toLocaleLowerCase('id-ID')}|${audienceGroup}`;if(seen.has(key))throw new Error('Duplicate teacher assignment');seen.add(key);return {teacherName,audienceGroup};});
}

export function overlaps(aStart,aEnd,bStart,bEnd){const ae=new Date(aEnd||aStart).getTime(),be=new Date(bEnd||bStart).getTime();return new Date(aStart).getTime()<be&&new Date(bStart).getTime()<ae;}

export function canTransitionBatch(from,to){
 const f=String(from||'').toUpperCase(),t=String(to||'').toUpperCase();
 if(!BATCH_STATUSES.includes(f)||!BATCH_STATUSES.includes(t))return false;
 if(f===t)return true;
 const allowed={PLANNED:['OPEN','ACTIVE','ARCHIVED'],OPEN:['PLANNED','ACTIVE','CLOSED','ARCHIVED'],ACTIVE:['CLOSED','ARCHIVED'],CLOSED:['ARCHIVED'],ARCHIVED:[]};
 return allowed[f].includes(t);
}

export function canTransitionMeeting(from,to){
 const f=String(from||'').toUpperCase(),t=String(to||'').toUpperCase();
 if(!MEETING_STATUSES.includes(f)||!MEETING_STATUSES.includes(t))return false;
 if(f===t)return true;
 const allowed={DRAFT:['PUBLISHED','CANCELLED','ARCHIVED'],PUBLISHED:['SCHEDULED','CANCELLED','ARCHIVED'],SCHEDULED:['COMPLETED','CANCELLED','ARCHIVED'],COMPLETED:['ARCHIVED'],CANCELLED:['DRAFT','ARCHIVED'],ARCHIVED:[]};
 return allowed[f].includes(t);
}

export function batchReadiness({batch={},meetingStatuses=[],participantCount=0}={}){
 const blockers=[];
 const status=String(batch.status||'').toUpperCase();
 const openMeetings=(meetingStatuses||[]).filter(s=>!['COMPLETED','CANCELLED','ARCHIVED'].includes(String(s||'').toUpperCase())).length;
 if(status==='ARCHIVED')blockers.push('BATCH_ARCHIVED');
 if(openMeetings>0)blockers.push('MEETINGS_NOT_FINISHED');
 if(batch.capacity!=null&&Number(participantCount)>Number(batch.capacity))blockers.push('CAPACITY_EXCEEDED');
 return {readyToClose:blockers.length===0,blockers,openMeetings,participantCount:Number(participantCount)||0};
}
