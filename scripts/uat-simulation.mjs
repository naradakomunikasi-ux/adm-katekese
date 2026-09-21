import assert from 'node:assert/strict';
import { createJourney, uploadDocument, verifyDocument, recordPayment, verifyPayment, scheduleMeeting, recordAttendance, markReadyForReview, decideApproval, issueCertificate, completeJourney, participantView } from '../backend/src/workflow.js';

const clock=()=>new Date('2026-08-11T12:00:00.000Z');
const actor={
 participant:{sub:'uat-participant',role:'PESERTA'},
 admin:{sub:'uat-admin',role:'ADMIN_KATEKESE'},
 program:{sub:'uat-program',role:'ADMIN_PROGRAM'},
 katekis:{sub:'uat-katekis',role:'KATEKIS'},
 pastor:{sub:'uat-pastor',role:'PASTOR'},
};
const evidence=[];
function record(step, check){ assert.ok(check,step); evidence.push({step,status:'PASS'}); }
let s=createJourney({participantId:'uat-p1',userId:'uat-participant',fullName:'UAT Participant',programName:'Baptis Dewasa'},clock); record('1. participant registration',s.participant.status==='REGISTERED');
s=uploadDocument(s,actor.participant,{id:'uat-doc',type:'identitas'},clock); record('2. document upload',s.documents[0].status==='PENDING');
s=verifyDocument(s,actor.program,'uat-doc',clock); record('3. document verification',s.documents[0].status==='VERIFIED');
s=recordPayment(s,actor.participant,{id:'uat-pay',amount:100000},clock); s=verifyPayment(s,actor.admin,'uat-pay',clock); record('4. payment record + verification',s.payments[0].status==='VERIFIED');
s=scheduleMeeting(s,actor.katekis,{id:'uat-meet',title:'Pertemuan UAT',scheduledAt:'2026-08-16T03:00:00Z'},clock); record('5. meeting schedule',s.meetings[0].status==='SCHEDULED');
s=recordAttendance(s,actor.katekis,{meetingId:'uat-meet',present:true},clock); record('6. attendance',s.attendance[0].present===true);
s=markReadyForReview(s,actor.katekis,clock); record('7. ready for review',s.participant.status==='READY_FOR_REVIEW');
s=decideApproval(s,actor.pastor,{approved:true,notes:'UAT approved'},clock); record('8. approval',s.participant.status==='APPROVED');
s=issueCertificate(s,actor.pastor,{id:'uat-cert',number:'UAT-001'},clock); record('9. certificate',s.certificates[0].status==='ISSUED');
s=completeJourney(s,actor.admin,clock); const view=participantView(s,actor.participant); record('10. participant progress view',view.participant.progressPercent===100 && view.participant.status==='COMPLETED');
console.log(JSON.stringify({suite:'structured-uat-simulation',status:'PASS',steps:evidence},null,2));
