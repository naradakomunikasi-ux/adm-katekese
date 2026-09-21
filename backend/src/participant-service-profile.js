export const PASTORAL_STATUSES=['NORMAL','NEEDS_ATTENTION','NEEDS_ACCOMPANIMENT','PASTORAL_REVIEW','APPROVED'];

export function normalizePastoralStatus(value){
 const status=String(value||'').trim().toUpperCase();
 if(!PASTORAL_STATUSES.includes(status)) throw new Error('Invalid pastoral status');
 return status;
}

export function administrativeReadiness({missingDocuments=0,paymentRequired=false,paymentSatisfied=true,attendancePercent=0,attendanceMinimum=0}={}){
 const documentsComplete=Number(missingDocuments||0)===0;
 const paymentComplete=!paymentRequired||Boolean(paymentSatisfied);
 const attendanceReady=Number(attendancePercent||0)>=Number(attendanceMinimum||0);
 const ready=documentsComplete&&paymentComplete&&attendanceReady;
 return {
  status:ready?'READY_FOR_PASTORAL_REVIEW':'NEEDS_FOLLOW_UP',
  documents:{complete:documentsComplete,missing:Number(missingDocuments||0)},
  payment:{required:Boolean(paymentRequired),complete:paymentComplete},
  attendance:{percent:Number(attendancePercent||0),minimum:Number(attendanceMinimum||0),complete:attendanceReady},
  recommendation:ready?'Sistem menilai peserta telah memenuhi persyaratan administratif.':'Belum siap ke tahap berikut. Lengkapi persyaratan administratif yang masih tertunda.',
  decisionNotice:'Keputusan pastoral tetap memerlukan peninjauan Pastor/Admin yang berwenang.'
 };
}
