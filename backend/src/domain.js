export const PARTICIPANT_STATUSES = ['REGISTERED','ACTIVE','ON_HOLD','READY_FOR_REVIEW','APPROVED','COMPLETED'];
export const TASK_PRIORITIES = ['P0','P1','P2'];

export function normalizePagination(query = {}) {
  const limit = Math.max(1, Math.min(100, Number.parseInt(query.limit ?? '25', 10) || 25));
  const rawOffset = Number.parseInt(query.offset ?? '0', 10);
  const offset = Math.max(0, Math.min(1_000_000, Number.isFinite(rawOffset) ? rawOffset : 0));
  return { limit, offset };
}

export function participantPatch(input = {}) {
  const patch = {};
  if ('preferredName' in input) {
    const value=String(input.preferredName||'').trim();
    if(value.length>100||/[<>]/.test(value))throw new Error('Invalid preferred name');
    patch.preferred_name=value||null;
  }
  if ('profilePhotoUrl' in input) {
    const value=String(input.profilePhotoUrl||'').trim();
    if(value&&(!value.startsWith('https://')||value.length>500))throw new Error('Invalid profile photo URL');
    patch.profile_photo_url=value||null;
  }
  if ('status' in input) {
    const status = String(input.status || '').toUpperCase();
    if (!PARTICIPANT_STATUSES.includes(status)) throw new Error('Invalid participant status');
    patch.status = status;
  }
  if ('progressPercent' in input) {
    const value = Number(input.progressPercent);
    if (!Number.isInteger(value) || value < 0 || value > 100) throw new Error('Invalid progress percent');
    patch.progress_percent = value;
  }
  if ('attendancePercent' in input) {
    const value = Number(input.attendancePercent);
    if (!Number.isInteger(value) || value < 0 || value > 100) throw new Error('Invalid attendance percent');
    patch.attendance_percent = value;
  }
  return patch;
}

export function taskPriorityRank(priority) {
  const value = String(priority || '').toUpperCase();
  const index = TASK_PRIORITIES.indexOf(value);
  return index === -1 ? 99 : index;
}

export function exceptionScore(item = {}) {
  let score = 0;
  if (item.overdue) score += 100;
  score += Math.max(0, 100 - Number(item.progressPercent ?? 100));
  if (Number(item.attendancePercent ?? 100) < 80) score += 30;
  if (item.documentPending) score += 25;
  if (item.paymentPending) score += 20;
  return score;
}
