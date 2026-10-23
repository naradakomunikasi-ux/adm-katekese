-- C019 candidate; REVIEW and backup before applying to staging.
CREATE TABLE IF NOT EXISTS role_assignments (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL,
 role_name VARCHAR(80) NOT NULL,
 program_id BIGINT UNSIGNED NULL,
 starts_at DATETIME NULL,
 ends_at DATETIME NULL,
 revoked_at DATETIME NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_assignment_user FOREIGN KEY(user_id) REFERENCES app_users(id),
 CONSTRAINT fk_assignment_program FOREIGN KEY(program_id) REFERENCES program_catalog(id),
 INDEX idx_assignment_active(user_id,role_name,revoked_at),
 INDEX idx_assignment_program(program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Rollback only after dependency review: DROP TABLE role_assignments;
