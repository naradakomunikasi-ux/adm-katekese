export const JOURNEY_STAGES = [
  'REGISTERED',
  'DOCUMENTS_PENDING',
  'DOCUMENTS_VERIFIED',
  'PAYMENT_VERIFIED',
  'ACTIVE',
  'READY_FOR_REVIEW',
  'APPROVED',
  'CERTIFICATE_READY',
  'COMPLETED',
];

function nowIso(clock = () => new Date()) { return clock().toISOString(); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function requireRole(actor, allow) {
  if (!actor?.role || !allow.includes(actor.role)) throw new Error('FORBIDDEN');
}
function requireParticipantScope(actor, participant) {
  if (actor.role === 'PESERTA' && actor.sub !== participant.userId) throw new Error('FORBIDDEN_SCOPE');
}

export function createJourney({ participantId, userId, fullName, programName }, clock) {
  if (!participantId || !userId || !fullName || !programName) throw new Error('INVALID_PARTICIPANT');
  const createdAt = nowIso(clock);
  return {
    participant: { id: participantId, userId, fullName, programName, status: 'REGISTERED', progressPercent: 10, createdAt },
    documents: [], payments: [], meetings: [], attendance: [], approvals: [], certificates: [], audit: [],
  };
}

function audit(state, actor, action, entityType, entityId, clock) {
  state.audit.push({ actorId: actor.sub, role: actor.role, action, entityType, entityId, at: nowIso(clock) });
}

export function uploadDocument(inputState, actor, document, clock) {
  const state = clone(inputState); requireParticipantScope(actor, state.participant);
  requireRole(actor, ['PESERTA','ADMIN_PROGRAM','ADMIN_KATEKESE','SUPER_ADMIN']);
  const item = { id: document.id, type: document.type, status: 'PENDING', uploadedBy: actor.sub };
  state.documents.push(item); state.participant.status = 'DOCUMENTS_PENDING'; state.participant.progressPercent = Math.max(state.participant.progressPercent, 20);
  audit(state, actor, 'DOCUMENT_UPLOAD', 'document', item.id, clock); return state;
}

export function verifyDocument(inputState, actor, documentId, clock) {
  const state = clone(inputState); requireRole(actor, ['ADMIN_PROGRAM','ADMIN_KATEKESE','SUPER_ADMIN']);
  const item = state.documents.find(x => x.id === documentId); if (!item) throw new Error('DOCUMENT_NOT_FOUND');
  item.status = 'VERIFIED'; item.verifiedBy = actor.sub;
  if (state.documents.length && state.documents.every(x => x.status === 'VERIFIED')) { state.participant.status = 'DOCUMENTS_VERIFIED'; state.participant.progressPercent = Math.max(state.participant.progressPercent, 35); }
  audit(state, actor, 'DOCUMENT_VERIFY', 'document', item.id, clock); return state;
}

export function recordPayment(inputState, actor, payment, clock) {
  const state = clone(inputState); requireParticipantScope(actor, state.participant);
  requireRole(actor, ['PESERTA','ADMIN_KATEKESE','SUPER_ADMIN']);
  const item = { id: payment.id, amount: Number(payment.amount), status: 'PENDING', recordedBy: actor.sub };
  if (!(item.amount >= 0)) throw new Error('INVALID_PAYMENT');
  state.payments.push(item); audit(state, actor, 'PAYMENT_RECORD', 'payment', item.id, clock); return state;
}

export function verifyPayment(inputState, actor, paymentId, clock) {
  const state = clone(inputState); requireRole(actor, ['ADMIN_KATEKESE','SUPER_ADMIN']);
  const item = state.payments.find(x => x.id === paymentId); if (!item) throw new Error('PAYMENT_NOT_FOUND');
  item.status = 'VERIFIED'; item.verifiedBy = actor.sub; state.participant.status = 'PAYMENT_VERIFIED'; state.participant.progressPercent = Math.max(state.participant.progressPercent, 45);
  audit(state, actor, 'PAYMENT_VERIFY', 'payment', item.id, clock); return state;
}

export function scheduleMeeting(inputState, actor, meeting, clock) {
  const state = clone(inputState); requireRole(actor, ['KATEKIS','ADMIN_PROGRAM','ADMIN_KATEKESE','PASTOR','SUPER_ADMIN']);
  const item = { id: meeting.id, title: meeting.title, scheduledAt: meeting.scheduledAt, status: 'SCHEDULED' };
  state.meetings.push(item); if (state.participant.status === 'PAYMENT_VERIFIED') { state.participant.status = 'ACTIVE'; state.participant.progressPercent = Math.max(state.participant.progressPercent, 55); }
  audit(state, actor, 'MEETING_SCHEDULE', 'meeting', item.id, clock); return state;
}

export function recordAttendance(inputState, actor, { meetingId, present }, clock) {
  const state = clone(inputState); requireRole(actor, ['KATEKIS','ADMIN_PROGRAM','ADMIN_KATEKESE','SUPER_ADMIN']);
  if (!state.meetings.some(x => x.id === meetingId)) throw new Error('MEETING_NOT_FOUND');
  state.attendance.push({ meetingId, participantId: state.participant.id, present: Boolean(present), recordedBy: actor.sub });
  const attended = state.attendance.filter(x => x.present).length;
  if (attended > 0) state.participant.progressPercent = Math.max(state.participant.progressPercent, 70);
  audit(state, actor, 'ATTENDANCE_RECORD', 'meeting', meetingId, clock); return state;
}

export function markReadyForReview(inputState, actor, clock) {
  const state = clone(inputState); requireRole(actor, ['ADMIN_KATEKESE','ADMIN_PROGRAM','KATEKIS','SUPER_ADMIN']);
  const docsOk = state.documents.length > 0 && state.documents.every(x => x.status === 'VERIFIED');
  const paymentOk = state.payments.length === 0 || state.payments.some(x => x.status === 'VERIFIED');
  const attendanceOk = state.attendance.some(x => x.present);
  if (!docsOk || !paymentOk || !attendanceOk) throw new Error('NOT_READY');
  state.participant.status = 'READY_FOR_REVIEW'; state.participant.progressPercent = Math.max(state.participant.progressPercent, 80);
  audit(state, actor, 'PARTICIPANT_READY_REVIEW', 'participant', state.participant.id, clock); return state;
}

export function decideApproval(inputState, actor, { approved, notes = '' }, clock) {
  const state = clone(inputState); requireRole(actor, ['PASTOR','ADMIN_KATEKESE','SUPER_ADMIN']);
  if (state.participant.status !== 'READY_FOR_REVIEW') throw new Error('INVALID_STAGE');
  const item = { id: `approval-${state.approvals.length + 1}`, approved: Boolean(approved), notes, decidedBy: actor.sub };
  state.approvals.push(item);
  state.participant.status = approved ? 'APPROVED' : 'ON_HOLD'; state.participant.progressPercent = approved ? 90 : state.participant.progressPercent;
  audit(state, actor, 'APPROVAL_DECIDE', 'approval', item.id, clock); return state;
}

export function issueCertificate(inputState, actor, certificate, clock) {
  const state = clone(inputState); requireRole(actor, ['ADMIN_KATEKESE','PASTOR','SUPER_ADMIN']);
  if (state.participant.status !== 'APPROVED') throw new Error('INVALID_STAGE');
  const item = { id: certificate.id, number: certificate.number, status: 'ISSUED', issuedBy: actor.sub };
  state.certificates.push(item); state.participant.status = 'CERTIFICATE_READY'; state.participant.progressPercent = 95;
  audit(state, actor, 'CERTIFICATE_ISSUE', 'certificate', item.id, clock); return state;
}

export function completeJourney(inputState, actor, clock) {
  const state = clone(inputState); requireRole(actor, ['ADMIN_KATEKESE','SUPER_ADMIN']);
  if (state.participant.status !== 'CERTIFICATE_READY') throw new Error('INVALID_STAGE');
  state.participant.status = 'COMPLETED'; state.participant.progressPercent = 100;
  audit(state, actor, 'PARTICIPANT_COMPLETE', 'participant', state.participant.id, clock); return state;
}

export function participantView(inputState, actor) {
  const state = clone(inputState); requireParticipantScope(actor, state.participant);
  return { participant: state.participant, documents: state.documents, meetings: state.meetings, attendance: state.attendance, certificates: state.certificates };
}
