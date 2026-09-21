import pg from 'pg';
import { validateDashboardRow } from '../backend/src/db-contract.js';
const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');
const pool = new Pool({connectionString:process.env.DATABASE_URL});
try {
  const tables = await pool.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`);
  const names = new Set(tables.rows.map(r=>r.tablename));
  for (const t of ['participants','documents','payments','approvals','tasks','users','roles','programs','batches']) {
    if (!names.has(t)) throw new Error(`missing table ${t}`);
  }
  const result = await pool.query(`SELECT
    (SELECT count(*) FROM participants WHERE status='ACTIVE')::int active_participants,
    (SELECT count(*) FROM documents WHERE verification_status='PENDING')::int pending_documents,
    (SELECT count(*) FROM payments WHERE verification_status='PENDING')::int pending_payments,
    (SELECT count(*) FROM approvals WHERE status='PENDING')::int pending_approvals`);
  const check = validateDashboardRow(result.rows[0]);
  if (!check.ok) throw new Error(`dashboard contract invalid: ${JSON.stringify(check)}`);
  console.log(JSON.stringify({database:'PASS',tables:tables.rows.length,dashboard:'PASS'},null,2));
} finally { await pool.end(); }
