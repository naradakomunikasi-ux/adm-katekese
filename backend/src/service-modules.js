export const DOCUMENT_STATUSES=['PENDING','UNDER_REVIEW','VALID','REVISION_REQUIRED','REJECTED'];
export const PAYMENT_STATUSES=['UNPAID','PARTIAL','PAID','WAIVED'];
export const APPROVAL_STATUSES=['DRAFT','SUBMITTED','APPROVED','REVISION_REQUIRED','REJECTED'];
export const ANNOUNCEMENT_STATUSES=['DRAFT','REVIEW','SCHEDULED','PUBLISHED','ARCHIVED'];
export const ANNOUNCEMENT_AUDIENCES=['ALL','PESERTA','KATEKIS','PASTOR','ADMIN'];
export const KNOWLEDGE_STATUSES=['DRAFT','REVIEW','ACTIVE','ARCHIVED'];

const text=(v,max=500)=>String(v??'').trim().slice(0,max);
const nullableText=(v,max=500)=>text(v,max)||null;
const money=(v)=>{const n=Number(v);if(!Number.isFinite(n)||n<0)throw new Error('Invalid amount');return Math.round(n*100)/100;};
const nonNegativeInt=(v,name)=>{const n=Number(v);if(!Number.isInteger(n)||n<0)throw new Error(`Invalid ${name}`);return n;};

export function normalizeDocumentRequirement(input={}){
 const documentType=text(input.documentType,120); if(!documentType)throw new Error('Invalid document type');
 return {documentType,description:nullableText(input.description,500),required:input.required!==false,sortOrder:input.sortOrder==null?0:nonNegativeInt(Number(input.sortOrder),'sort order')};
}
export function normalizeDocumentReview(input={}){
 const status=text(input.status,40).toUpperCase();if(!DOCUMENT_STATUSES.includes(status))throw new Error('Invalid document status');
 return {status,notes:nullableText(input.notes,1000)};
}
export function normalizePaymentSettings(input={}){
 const amount=money(input.amount??0);const installmentAllowed=Boolean(input.installmentAllowed);const installmentCount=installmentAllowed?nonNegativeInt(Number(input.installmentCount??1),'installment count'):1;
 if(installmentCount<1||installmentCount>24)throw new Error('Invalid installment count');
 return {amount,dueDate:input.dueDate||null,installmentAllowed,installmentCount,paymentMethod:nullableText(input.paymentMethod,120),notes:nullableText(input.notes,1000)};
}
export function normalizePaymentInput(input={}){
 const amount=money(input.amount??0); const status=text(input.status||'UNPAID',40).toUpperCase(); if(!PAYMENT_STATUSES.includes(status))throw new Error('Invalid payment status');
 return {amount,status,dueDate:input.dueDate||null,installmentNo:input.installmentNo==null?1:nonNegativeInt(Number(input.installmentNo),'installment number'),notes:nullableText(input.notes,1000)};
}
export function normalizeApprovalInput(input={}){
 const approvalType=text(input.approvalType,120);if(!approvalType)throw new Error('Invalid approval type');
 const entityType=text(input.entityType||'PARTICIPANT',60).toUpperCase();
 return {approvalType,entityType,entityId:input.entityId||null,note:nullableText(input.note,2000)};
}
export function normalizeApprovalDecision(input={}){
 const status=text(input.status,40).toUpperCase();if(!['APPROVED','REVISION_REQUIRED','REJECTED'].includes(status))throw new Error('Invalid approval decision');
 return {status,note:nullableText(input.note,2000)};
}
export function normalizeCertificateTemplate(input={}){
 const name=text(input.name,160);if(!name)throw new Error('Invalid template name');
 return {name,programType:nullableText(input.programType,100),fileName:nullableText(input.fileName,255),mimeType:nullableText(input.mimeType,120),variables:Array.isArray(input.variables)?input.variables.map(v=>text(v,80)).filter(Boolean).slice(0,30):[] ,status:text(input.status||'DRAFT',40).toUpperCase()};
}
export function normalizeCertificateRule(input={}){
 const attendanceMinimum=Number(input.attendanceMinimum??0);if(!Number.isFinite(attendanceMinimum)||attendanceMinimum<0||attendanceMinimum>100)throw new Error('Invalid attendance minimum');
 return {attendanceMinimum,documentsComplete:Boolean(input.documentsComplete),paymentRequired:Boolean(input.paymentRequired),evaluationRequired:Boolean(input.evaluationRequired),pastoralApprovalRequired:Boolean(input.pastoralApprovalRequired)};
}
export function certificateEligibility({attendancePercent=0,documentsComplete=true,paymentSatisfied=true,evaluationPassed=true,pastoralApproved=true},rule={}){
 const reasons=[];if(Number(attendancePercent)<Number(rule.attendanceMinimum??0))reasons.push('ATTENDANCE_BELOW_MINIMUM');if(rule.documentsComplete&&!documentsComplete)reasons.push('DOCUMENTS_INCOMPLETE');if(rule.paymentRequired&&!paymentSatisfied)reasons.push('PAYMENT_INCOMPLETE');if(rule.evaluationRequired&&!evaluationPassed)reasons.push('EVALUATION_INCOMPLETE');if(rule.pastoralApprovalRequired&&!pastoralApproved)reasons.push('PASTORAL_APPROVAL_REQUIRED');return {eligible:reasons.length===0,reasons};
}
function optionalIsoDate(value,label){
 if(value==null||value==='')return null;
 const date=new Date(value);if(Number.isNaN(date.getTime()))throw new Error(`Invalid announcement ${label}`);
 return date.toISOString();
}
export function validateAnnouncementSchedule({status='DRAFT',publishAt=null,expiresAt=null}={},now=Date.now()){
 const normalizedStatus=text(status||'DRAFT',40).toUpperCase();
 const publish=optionalIsoDate(publishAt,'publishAt');const expires=optionalIsoDate(expiresAt,'expiresAt');
 if(normalizedStatus==='SCHEDULED'){if(!publish)throw new Error('Scheduled announcement requires publishAt');if(Date.parse(publish)<=Number(now))throw new Error('Scheduled announcement publishAt must be in the future');}
 if(expires){const base=publish?Date.parse(publish):Number(now);if(Date.parse(expires)<=base)throw new Error('Announcement expiresAt must be after publish time');}
 return {publishAt:publish,expiresAt:expires};
}
export function normalizeAnnouncement(input={}){
 const title=text(input.title,180);const body=text(input.body,10000);if(!title||!body)throw new Error('Invalid announcement');const status=text(input.status||'DRAFT',40).toUpperCase();if(!ANNOUNCEMENT_STATUSES.includes(status))throw new Error('Invalid announcement status');
 const audience=text(input.audience||'ALL',80).toUpperCase();if(!ANNOUNCEMENT_AUDIENCES.includes(audience))throw new Error('Invalid announcement audience');
 const schedule=validateAnnouncementSchedule({status,publishAt:input.publishAt,expiresAt:input.expiresAt});
 return {title,shortDescription:nullableText(input.shortDescription,500),body,category:text(input.category||'INFORMASI',80),audience,imageUrl:nullableText(input.imageUrl,1000),ctaLabel:nullableText(input.ctaLabel,80),ctaUrl:nullableText(input.ctaUrl,1000),status,...schedule};
}
export function normalizeGeneralSettings(input={}){
 const language=['id','en'].includes(input.language)?input.language:'id'; const timezone=text(input.timezone||'Asia/Jakarta',80); const dateFormat=text(input.dateFormat||'DD MMM YYYY',40); const locale=text(input.locale||(language==='id'?'id-ID':'en-US'),40);
 return {language,timezone,dateFormat,locale};
}
export function normalizeKnowledgeLifecycle(status){const s=text(status,40).toUpperCase();if(!KNOWLEDGE_STATUSES.includes(s))throw new Error('Invalid knowledge status');return s;}

export const CERTIFICATE_TEMPLATE_STATUSES=['DRAFT','PUBLISHED','ARCHIVED'];

export function canTransitionAnnouncement(from,to){
 const f=text(from,40).toUpperCase(),t=text(to,40).toUpperCase();
 if(!ANNOUNCEMENT_STATUSES.includes(f)||!ANNOUNCEMENT_STATUSES.includes(t))return false;
 if(f===t)return true;
 const allowed={DRAFT:['REVIEW','ARCHIVED'],REVIEW:['DRAFT','SCHEDULED','PUBLISHED'],SCHEDULED:['DRAFT','PUBLISHED','ARCHIVED'],PUBLISHED:['ARCHIVED'],ARCHIVED:[]};
 return allowed[f].includes(t);
}
export function canTransitionKnowledge(from,to){
 const f=text(from,40).toUpperCase(),t=text(to,40).toUpperCase();
 if(!KNOWLEDGE_STATUSES.includes(f)||!KNOWLEDGE_STATUSES.includes(t))return false;
 if(f===t)return true;
 const allowed={DRAFT:['REVIEW','ARCHIVED'],REVIEW:['DRAFT','ACTIVE'],ACTIVE:['ARCHIVED'],ARCHIVED:[]};
 return allowed[f].includes(t);
}
export function canTransitionCertificateTemplate(from,to){
 const f=text(from,40).toUpperCase(),t=text(to,40).toUpperCase();
 if(!CERTIFICATE_TEMPLATE_STATUSES.includes(f)||!CERTIFICATE_TEMPLATE_STATUSES.includes(t))return false;
 if(f===t)return true;
 const allowed={DRAFT:['PUBLISHED','ARCHIVED'],PUBLISHED:['ARCHIVED'],ARCHIVED:[]};
 return allowed[f].includes(t);
}
export function paymentProgress({expected=0,received=0}={}){
 const e=money(expected),r=money(received);
 const outstanding=Math.max(0,Math.round((e-r)*100)/100);
 const percent=e===0?100:Math.min(100,Math.round((r/e)*10000)/100);
 return {expected:e,received:r,outstanding,percent};
}
export function paymentInstallmentSummary(rows=[]){
 const installments=(Array.isArray(rows)?rows:[]).map(r=>({installmentNo:Number(r.installment_no??r.installmentNo??1),amount:money(r.amount??0),status:String(r.status||'UNPAID').toUpperCase(),verificationStatus:String(r.verification_status||r.verificationStatus||'PENDING').toUpperCase(),dueDate:r.due_date??r.dueDate??null})).sort((a,b)=>a.installmentNo-b.installmentNo);
 const expected=installments.reduce((n,x)=>n+x.amount,0);
 const received=installments.filter(x=>['PAID','WAIVED'].includes(x.status)).reduce((n,x)=>n+x.amount,0);
 const overdue=installments.filter(x=>!['PAID','WAIVED'].includes(x.status)&&x.dueDate&&new Date(x.dueDate).getTime()<Date.now()).length;
 return {...paymentProgress({expected,received}),installmentCount:installments.length,paidInstallments:installments.filter(x=>['PAID','WAIVED'].includes(x.status)).length,overdueInstallments:overdue,installments};
}
export function participantAttention({attendancePercent=100,missingDocuments=0,overduePayment=false,pendingApproval=false,certificateEligible=true}={}){
 const items=[];
 if(Number(attendancePercent)<80)items.push({code:'ATTENDANCE',severity:'HIGH',label:'Kehadiran perlu perhatian'});
 if(Number(missingDocuments)>0)items.push({code:'DOCUMENTS',severity:'HIGH',label:`${Number(missingDocuments)} dokumen belum lengkap`});
 if(overduePayment)items.push({code:'PAYMENT',severity:'MEDIUM',label:'Pembayaran melewati jatuh tempo'});
 if(pendingApproval)items.push({code:'APPROVAL',severity:'MEDIUM',label:'Menunggu persetujuan pastoral'});
 if(!certificateEligible)items.push({code:'CERTIFICATE',severity:'LOW',label:'Belum memenuhi syarat sertifikat'});
 return items;
}

export const CERTIFICATE_STATUSES=['DRAFT','APPROVED','ISSUED','REVOKED'];
export function normalizeCertificateGeneration(input={}){
 const participantIds=Array.isArray(input.participantIds)?[...new Set(input.participantIds.map(v=>text(v,80)).filter(Boolean))].slice(0,500):[];
 const certificateType=text(input.certificateType||'SERTIFIKAT',120); if(!certificateType)throw new Error('Invalid certificate type');
 const templateId=nullableText(input.templateId,80); return {participantIds,certificateType,templateId};
}
export function normalizeCertificateIssue(input={}){
 const certificateNumber=text(input.certificateNumber,120);if(!certificateNumber)throw new Error('Invalid certificate number');
 const pdfBase64=nullableText(input.pdfBase64,8_000_000); if(pdfBase64&&!/^[A-Za-z0-9+/=\s]+$/.test(pdfBase64))throw new Error('Invalid PDF payload');
 return {certificateNumber,pdfBase64};
}
export function canTransitionCertificate(from,to){
 const f=text(from,40).toUpperCase(),t=text(to,40).toUpperCase();if(!CERTIFICATE_STATUSES.includes(f)||!CERTIFICATE_STATUSES.includes(t))return false;if(f===t)return true;
 const allowed={DRAFT:['APPROVED'],APPROVED:['ISSUED'],ISSUED:['REVOKED'],REVOKED:[]};return allowed[f].includes(t);
}
export function journeyProgress({events=[],documents=[],payments=[],approvals=[],certificates=[]}={}){
 const docsReady=documents.length===0||documents.every(x=>String(x.verification_status||x.status).toUpperCase()==='VALID');
 const paymentReady=payments.length===0||payments.every(x=>['PAID','WAIVED'].includes(String(x.status).toUpperCase()));
 const approvalReady=approvals.length===0||approvals.every(x=>String(x.status).toUpperCase()==='APPROVED');
 const certificateReady=certificates.some(x=>['APPROVED','ISSUED'].includes(String(x.status).toUpperCase()));
 const stages=[{key:'registration',label:'Pendaftaran',complete:true},{key:'documents',label:'Dokumen',complete:docsReady},{key:'formation',label:'Pendampingan',complete:events.length>0},{key:'approval',label:'Persetujuan',complete:approvalReady},{key:'certificate',label:'Sertifikat',complete:certificateReady}];
 const completed=stages.filter(x=>x.complete).length;return {stages,completed,total:stages.length,percent:Math.round((completed/stages.length)*100),paymentReady};
}

export function normalizeWhatsappConfig(input={}){
 const apiUrl=nullableText(input.apiUrl,1000),sender=nullableText(input.sender,160),token=nullableText(input.token,4000);
 if(apiUrl){try{const u=new URL(apiUrl);if(!['https:','http:'].includes(u.protocol))throw new Error();}catch{throw new Error('Invalid WhatsApp API URL');}}
 return {apiUrl,sender,token};
}
export function safeWhatsappConfig(input={}){
 return {apiUrl:nullableText(input.apiUrl,1000),sender:nullableText(input.sender,160),tokenConfigured:Boolean(input.tokenEnc||input.tokenConfigured)};
}

export function announcementAudienceForRole(role){const r=String(role||'').toUpperCase();if(['SUPER_ADMIN','ADMIN_KATEKESE','ADMIN_PROGRAM'].includes(r))return 'ADMIN';if(['PESERTA','KATEKIS','PASTOR'].includes(r))return r;return null;}
