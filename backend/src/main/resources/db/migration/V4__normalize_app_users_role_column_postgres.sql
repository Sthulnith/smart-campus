-- MySQL-safe role normalization.
-- Ensure app_users.role can store any enum name (including ROLE_TECHNICIAN).

SET @role_check := (
    SELECT tc.CONSTRAINT_NAME
    FROM information_schema.TABLE_CONSTRAINTS tc
    JOIN information_schema.CHECK_CONSTRAINTS cc
      ON cc.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
     AND cc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
    WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
      AND tc.TABLE_NAME = 'app_users'
      AND tc.CONSTRAINT_TYPE = 'CHECK'
      AND (
          cc.CHECK_CLAUSE LIKE '%`role`%'
          OR cc.CHECK_CLAUSE LIKE '% role %'
      )
    LIMIT 1
);

SET @drop_check_sql := IF(
    @role_check IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE app_users DROP CHECK `', @role_check, '`')
);

PREPARE drop_stmt FROM @drop_check_sql;
EXECUTE drop_stmt;
DEALLOCATE PREPARE drop_stmt;

ALTER TABLE app_users
    MODIFY COLUMN role VARCHAR(64) NOT NULL;
