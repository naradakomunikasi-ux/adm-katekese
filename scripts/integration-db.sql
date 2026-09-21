\set ON_ERROR_STOP on

DO $$
DECLARE missing_count integer;
BEGIN
  SELECT count(*) INTO missing_count
  FROM (VALUES
    ('participants'),('documents'),('payments'),('approvals'),('tasks'),('users'),('roles'),('permissions'),('role_permissions'),('user_roles'),('audit_events'),('auth_sessions'),('password_reset_tokens'),('programs'),('batches'),('participant_programs'),('meetings'),('attendance'),('announcements'),('notifications'),('certificates'),('knowledge_documents'),('knowledge_chunks'),('idempotency_keys')
  ) AS required(name)
  WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=required.name);
  IF missing_count <> 0 THEN RAISE EXCEPTION '% required tables missing', missing_count; END IF;
END $$;

BEGIN;
INSERT INTO participants(full_name,program_name,status,progress_percent,attendance_percent)
VALUES('Integration Test User','Krisma','ACTIVE',50,80);
ROLLBACK;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM participants WHERE full_name='Integration Test User') THEN
    RAISE EXCEPTION 'transaction rollback failed';
  END IF;
END $$;

DO $$ BEGIN
  BEGIN
    INSERT INTO participants(full_name,program_name,status,progress_percent,attendance_percent)
    VALUES('Invalid Percent','Krisma','ACTIVE',101,80);
    RAISE EXCEPTION 'progress check did not reject invalid value';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;

DO $$ DECLARE rid uuid; BEGIN
  INSERT INTO roles(code,name) VALUES('INTEGRATION_UNIQUE','Integration Unique') RETURNING id INTO rid;
  BEGIN
    INSERT INTO roles(code,name) VALUES('INTEGRATION_UNIQUE','Duplicate');
    RAISE EXCEPTION 'unique constraint did not reject duplicate';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  DELETE FROM roles WHERE id=rid;
END $$;

DO $$ BEGIN
  BEGIN
    INSERT INTO documents(participant_id,document_type) VALUES('00000000-0000-4000-8000-000000000001','TEST');
    RAISE EXCEPTION 'foreign key did not reject missing participant';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END $$;

DO $$ DECLARE uid uuid; BEGIN
  INSERT INTO users(email,full_name,password_hash) VALUES('idem-integration@example.test','Idem Integration','x') RETURNING id INTO uid;
  INSERT INTO idempotency_keys(key,actor_user_id,method,request_path,request_hash) VALUES('integration-idempotency-0001',uid,'POST','/api/test','hash-a');
  BEGIN
    INSERT INTO idempotency_keys(key,actor_user_id,method,request_path,request_hash) VALUES('integration-idempotency-0001',uid,'POST','/api/test','hash-a');
    RAISE EXCEPTION 'idempotency unique constraint did not reject duplicate';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  DELETE FROM users WHERE id=uid;
END $$;

DO $$
DECLARE idx_count integer;
BEGIN
  SELECT count(*) INTO idx_count FROM pg_indexes WHERE schemaname='public' AND indexname IN (
    'idx_participants_status','idx_documents_verification','idx_payments_verification','idx_tasks_status_priority',
    'idx_audit_events_actor_created','idx_batches_program_status','idx_notifications_user_status','idx_knowledge_chunks_document','idx_auth_sessions_user_active','idx_idempotency_expiry'
  );
  IF idx_count < 10 THEN RAISE EXCEPTION 'required indexes missing: found %/10', idx_count; END IF;
END $$;

SELECT 'DB_INTEGRATION_PASS' AS status,
       (SELECT count(*) FROM pg_tables WHERE schemaname='public') AS table_count,
       (SELECT count(*) FROM pg_indexes WHERE schemaname='public') AS index_count;
