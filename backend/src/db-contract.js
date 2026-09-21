export const REQUIRED_TABLES = [
  'participants','documents','payments','approvals','tasks',
  'users','roles','permissions','role_permissions','user_roles','audit_events','auth_sessions','password_reset_tokens',
  'programs','batches','participant_programs','user_program_assignments','meetings','attendance','announcements','notifications','certificates','knowledge_documents','knowledge_chunks','library_files','system_ai_settings','ai_capabilities','ai_model_engines','ai_provider_connections','ai_capability_model_routes','communication_campaigns','communication_campaign_recipients','communication_delivery_attempts','public_registration_submissions'
];

export function validateDashboardRow(row = {}) {
  const keys = ['active_participants','pending_documents','pending_payments','pending_approvals'];
  const missing = keys.filter((k) => !(k in row));
  if (missing.length) return { ok:false, missing };
  const invalid = keys.filter((k) => !Number.isInteger(Number(row[k])) || Number(row[k]) < 0);
  return invalid.length ? { ok:false, invalid } : { ok:true };
}

export function validateParticipantRow(row = {}) {
  const required = ['id','full_name','program_name','status','progress_percent','attendance_percent'];
  const missing = required.filter((k) => row[k] === undefined || row[k] === null);
  if (missing.length) return { ok:false, missing };
  const progress = Number(row.progress_percent);
  const attendance = Number(row.attendance_percent);
  if (progress < 0 || progress > 100 || attendance < 0 || attendance > 100) {
    return { ok:false, invalid:['progress_percent','attendance_percent'] };
  }
  return { ok:true };
}

export function migrationSequence(files = []) {
  const up = files.filter((f)=>/^\d+_up\.sql$/.test(f)).map((f)=>f.replace('_up.sql',''));
  const down = files.filter((f)=>/^\d+_down\.sql$/.test(f)).map((f)=>f.replace('_down.sql',''));
  return { up, down, paired: up.length === down.length && up.every((n)=>down.includes(n)) };
}
