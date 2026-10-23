export const rolePermissions = Object.freeze({
  Peserta: [],
  'Orang Tua/Wali': [],
  Katekis: ['attendance.validate', 'recovery.verify'],
  Koordinator: ['registration.verify', 'program.manage', 'recovery.assign', 'readiness.review'],
  Sekretariat: ['registration.verify', 'document.verify', 'staging.prepare'],
  'Romo / Approver': ['approval.finalize'],
  'Admin Katekese': ['registration.verify', 'program.manage', 'recovery.assign', 'readiness.review', 'document.verify'],
  'Super Admin': ['system.configure', 'users.manage', 'roles.assign'],
  Auditor: []
});
export function evaluateAccess({actorId, role, action, assignment, targetProgramId, now = new Date()}) {
  if (!Number.isSafeInteger(actorId) || actorId < 1) return {allow:false, reason:'UNAUTHENTICATED'};
  if (!(rolePermissions[role] || []).includes(action)) return {allow:false, reason:'FORBIDDEN_ROLE'};
  if (!assignment || assignment.user_id !== actorId || assignment.role_name !== role || assignment.revoked_at) return {allow:false, reason:'NO_ACTIVE_ASSIGNMENT'};
  const nowMs = new Date(now).getTime();
  if (!Number.isFinite(nowMs)) return {allow:false, reason:'INVALID_TIME'};
  if (assignment.starts_at && new Date(assignment.starts_at).getTime() > nowMs) return {allow:false, reason:'OUTSIDE_ASSIGNMENT_PERIOD'};
  if (assignment.ends_at && new Date(assignment.ends_at).getTime() <= nowMs) return {allow:false, reason:'OUTSIDE_ASSIGNMENT_PERIOD'};
  if (assignment.program_id !== null && assignment.program_id !== undefined && assignment.program_id !== targetProgramId) return {allow:false, reason:'OUTSIDE_PROGRAM_SCOPE'};
  if (!Number.isSafeInteger(targetProgramId) || targetProgramId < 1) return {allow:false, reason:'INVALID_TARGET'};
  return {allow:true, reason:'AUTHORIZED'};
}
export function guardianCanRead({actorId, participantOwnerId, link}) {
  if (!Number.isSafeInteger(actorId) || actorId < 1) return false;
  if (actorId === participantOwnerId) return true;
  return !!(link && link.guardian_user_id === actorId && link.verified_at && !link.revoked_at);
}
