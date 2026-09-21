const CHANNELS=new Set(['IN_APP','EMAIL','WHATSAPP','PUSH']);
const AUDIENCES=new Set(['ALL','ROLE','PROGRAM','PARTICIPANT']);
export function normalizeCampaign(input={},now=Date.now()){
 const title=String(input.title||'').trim(),body=String(input.body||'').trim();
 const audienceType=String(input.audienceType||'ALL').toUpperCase();
 const channels=[...new Set((Array.isArray(input.channels)?input.channels:['IN_APP']).map(x=>String(x).toUpperCase()))];
 const scheduledAt=input.scheduledAt?new Date(input.scheduledAt):null;
 if(title.length<3||title.length>160||body.length<3||body.length>4000)throw new Error('INVALID_CAMPAIGN_CONTENT');
 if(!AUDIENCES.has(audienceType)||!channels.length||channels.some(x=>!CHANNELS.has(x)))throw new Error('INVALID_CAMPAIGN_SCOPE');
 if(scheduledAt&&(Number.isNaN(scheduledAt.getTime())||scheduledAt.getTime()<=now))throw new Error('INVALID_CAMPAIGN_SCHEDULE');
 return {title,body,audienceType,audienceValue:input.audienceValue?String(input.audienceValue).trim():null,channels,scheduledAt:scheduledAt?.toISOString()||null,status:scheduledAt?'SCHEDULED':'DRAFT'};
}
