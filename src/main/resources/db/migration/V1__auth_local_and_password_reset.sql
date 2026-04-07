-- Allow campus email/password accounts without a Google subject id
ALTER TABLE app_users MODIFY COLUMN provider_id VARCHAR(255) NULL;

-- One-time password reset tokens (raw token is never stored; only SHA-256 hex hash)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    used BIT(1) NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_password_reset_token_hash (token_hash),
    KEY idx_password_reset_user (user_id),
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES app_users (id) ON DELETE CASCADE
);
