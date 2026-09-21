export function resolveParticipantScope({fullRead=false,assignedRead=false,selfRead=false}={}) {
  if (fullRead) return 'FULL';
  if (assignedRead) return 'ASSIGNED';
  if (selfRead) return 'SELF';
  return 'NONE';
}

export function participantScopeSql(mode,{alias='pa',parameter=1,userId}={}) {
  if (mode==='FULL') return { clause:'TRUE', params:[] };
  if (mode==='SELF') return { clause:`${alias}.user_id = $${parameter}`, params:[userId] };
  if (mode==='ASSIGNED') return {
    clause:`EXISTS (SELECT 1 FROM participant_programs scope_pp JOIN user_program_assignments scope_ua ON scope_ua.program_id=scope_pp.program_id AND (scope_ua.batch_id IS NULL OR scope_ua.batch_id=scope_pp.batch_id) WHERE scope_pp.participant_id=${alias}.id AND scope_pp.status<>'CANCELLED' AND scope_ua.user_id=$${parameter} AND scope_ua.active=true)`,
    params:[userId]
  };
  return { clause:'FALSE', params:[] };
}

export function batchScopeSql(mode,{alias='b',parameter=1,userId}={}) {
  if (mode==='FULL') return { clause:'TRUE', params:[] };
  if (mode==='SELF') return {
    clause:`EXISTS (SELECT 1 FROM participant_programs scope_pp JOIN participants scope_pa ON scope_pa.id=scope_pp.participant_id WHERE scope_pp.batch_id=${alias}.id AND scope_pp.status<>'CANCELLED' AND scope_pa.user_id=$${parameter})`,
    params:[userId]
  };
  if (mode==='ASSIGNED') return {
    clause:`EXISTS (SELECT 1 FROM user_program_assignments scope_ua WHERE scope_ua.program_id=${alias}.program_id AND (scope_ua.batch_id IS NULL OR scope_ua.batch_id=${alias}.id) AND scope_ua.user_id=$${parameter} AND scope_ua.active=true)`,
    params:[userId]
  };
  return { clause:'FALSE', params:[] };
}
