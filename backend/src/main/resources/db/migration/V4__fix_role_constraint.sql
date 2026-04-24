-- Drop the existing role check constraint that might be missing ROLE_TECHNICIAN
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_check;

-- Re-add the constraint with all current roles
ALTER TABLE app_users ADD CONSTRAINT app_users_role_check 
    CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN', 'ROLE_STUDENT', 'ROLE_STAFF', 'ROLE_TECHNICIAN'));
