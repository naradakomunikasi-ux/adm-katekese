-- RC50: password reset race-safety
CREATE UNIQUE INDEX IF NOT EXISTS uq_password_reset_one_active_per_user
  ON password_reset_tokens(user_id)
  WHERE consumed_at IS NULL;
