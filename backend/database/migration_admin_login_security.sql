-- Admin login audit + password change support
ALTER TABLE users
    ADD COLUMN last_login_at DATETIME NULL AFTER role,
    ADD COLUMN last_login_ip VARCHAR(45) NULL AFTER last_login_at,
    ADD COLUMN last_login_user_agent VARCHAR(500) NULL AFTER last_login_ip,
    ADD COLUMN previous_login_at DATETIME NULL AFTER last_login_user_agent,
    ADD COLUMN previous_login_ip VARCHAR(45) NULL AFTER previous_login_at,
    ADD COLUMN previous_login_user_agent VARCHAR(500) NULL AFTER previous_login_ip;

CREATE TABLE IF NOT EXISTS admin_login_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500) NULL,
    logged_in_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_login_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin_login_logs_user (user_id),
    INDEX idx_admin_login_logs_at (logged_in_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
