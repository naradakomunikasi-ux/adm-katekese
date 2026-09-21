import pg from 'pg';
import { hashPassword } from '../src/security.js';
import { validateEmail, validateLoginIdentity, validatePasswordPolicy } from '../src/validation.js';

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
const username = validateLoginIdentity(process.env.SUPER_ADMIN_BOOTSTRAP_USERNAME || 'admin');
const email = validateEmail(process.env.SUPER_ADMIN_BOOTSTRAP_EMAIL || 'Michael.gani@gmail.com');
const fullName = String(process.env.SUPER_ADMIN_BOOTSTRAP_NAME || 'Michael Gani').trim().slice(0,160);
const password = String(process.env.SUPER_ADMIN_BOOTSTRAP_PASSWORD || '');
if (!databaseUrl) throw new Error('DATABASE_URL is required');
validatePasswordPolicy(password);
const passwordHash = hashPassword(password);
const pool = new Pool({ connectionString: databaseUrl, ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined });
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const role = (await client.query(`SELECT id FROM roles WHERE code='SUPER_ADMIN' LIMIT 1`)).rows[0];
  if (!role) throw new Error('SUPER_ADMIN role is not initialized');
  const user = (await client.query(`
    INSERT INTO users(username,email,full_name,password_hash,status,updated_at)
    VALUES($1,$2,$3,$4,'ACTIVE',now())
    ON CONFLICT(email) DO UPDATE SET username=excluded.username,full_name=excluded.full_name,password_hash=excluded.password_hash,status='ACTIVE',updated_at=now()
    RETURNING id,username,email,full_name,status
  `,[username,email,fullName,passwordHash])).rows[0];
  await client.query(`INSERT INTO user_roles(user_id,role_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,[user.id,role.id]);
  await client.query(`DELETE FROM user_roles ur USING roles r WHERE ur.role_id=r.id AND ur.user_id=$1 AND r.code<>'SUPER_ADMIN'`,[user.id]);
  await client.query(`UPDATE auth_sessions SET revoked_at=now() WHERE user_id=$1 AND revoked_at IS NULL`,[user.id]);
  await client.query(`INSERT INTO audit_events(actor_user_id,action,entity_type,entity_id,metadata) VALUES(NULL,'SUPER_ADMIN_BOOTSTRAP','user',$1,$2::jsonb)`,[user.id,JSON.stringify({username,email,role:'SUPER_ADMIN',sessionsRevoked:true})]);
  await client.query('COMMIT');
  console.log(JSON.stringify({ok:true,user,role:'SUPER_ADMIN'}));
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
