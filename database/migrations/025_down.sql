BEGIN;
DROP TRIGGER IF EXISTS trg_payment_enrollment ON payments;
DROP FUNCTION IF EXISTS enforce_payment_enrollment();
DROP INDEX IF EXISTS idx_payments_participant_program_status;
COMMIT;
