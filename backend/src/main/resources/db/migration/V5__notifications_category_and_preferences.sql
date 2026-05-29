-- Notification categories and per-user notification preferences.
-- Safe for PostgreSQL (Aiven) and idempotent for repeated deploys.

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    type VARCHAR(40) NOT NULL,
    category VARCHAR(40) NOT NULL DEFAULT 'GENERAL',
    target_role VARCHAR(40) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'notifications'
          AND column_name = 'category'
    ) THEN
        ALTER TABLE notifications
            ADD COLUMN category VARCHAR(40) NOT NULL DEFAULT 'GENERAL';
    END IF;
END $$;

UPDATE notifications
SET category = 'GENERAL'
WHERE category IS NULL OR btrim(category) = '';

CREATE INDEX IF NOT EXISTS idx_notifications_target_role
    ON notifications (target_role);

CREATE INDEX IF NOT EXISTS idx_notifications_category
    ON notifications (category);

CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(40) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT uk_user_notification_pref UNIQUE (user_id, category),
    CONSTRAINT fk_user_notification_pref_user
        FOREIGN KEY (user_id) REFERENCES app_users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_notification_pref_user
    ON user_notification_preferences (user_id);
