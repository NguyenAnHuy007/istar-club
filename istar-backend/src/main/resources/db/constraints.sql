-- Constraints to enforce business rules at Database level
-- Run this script to apply constraints

-- 1. Ensure only one active PRESIDENT
-- This uses a partial unique index. Only works if is_deleted is false and is_active is true.
DROP INDEX IF EXISTS idx_unique_active_president;
CREATE UNIQUE INDEX idx_unique_active_president
ON users (position)
WHERE position = 'PRESIDENT' AND is_deleted = false AND is_active = true;

-- 2. Ensure only one active Recruitment campaign
DROP INDEX IF EXISTS idx_unique_active_recruitment;
CREATE UNIQUE INDEX idx_unique_active_recruitment
ON recruitments (is_active)
WHERE is_active = true AND is_deleted = false;

-- 3. Ensure only one active DEPARTMENT_HEAD per Department
-- Note: 'department' and 'position' for department heads are stored in 'user_departments' table,
-- while 'is_active' and 'is_deleted' reside in 'users'.
-- Using a trigger with advisory lock and JOIN on users ensures that soft-deleted or deactivated users
-- do not prevent assigning an active DEPARTMENT_HEAD.
DROP INDEX IF EXISTS idx_unique_active_department_head;

CREATE OR REPLACE FUNCTION check_department_head_limit_func()
RETURNS TRIGGER AS $$
DECLARE
    head_count INTEGER;
    is_user_active_and_not_deleted BOOLEAN;
BEGIN
    -- Check user active & non-deleted status
    SELECT (is_deleted = false AND is_active = true) INTO is_user_active_and_not_deleted
    FROM users WHERE id = NEW.user_id;

    IF is_user_active_and_not_deleted = true AND NEW.position = 'DEPARTMENT_HEAD' THEN
        -- Serialize concurrent checks using an advisory lock
        PERFORM pg_advisory_xact_lock(hashtext('check_department_head_lock'));

        SELECT COUNT(*) INTO head_count
        FROM user_departments ud
        JOIN users u ON ud.user_id = u.id
        WHERE ud.department = NEW.department
          AND ud.position = 'DEPARTMENT_HEAD'
          AND u.is_deleted = false
          AND u.is_active = true
          AND ud.id != COALESCE(NEW.id, -1);

        IF head_count >= 1 THEN
            RAISE EXCEPTION 'Business Rule Violation: Ban % đã có một Trưởng ban đang hoạt động.', NEW.department;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_department_head_limit ON user_departments;
CREATE TRIGGER trg_check_department_head_limit
BEFORE INSERT OR UPDATE ON user_departments
FOR EACH ROW
EXECUTE FUNCTION check_department_head_limit_func();

-- 4. Advanced Constraints using Limits (Max 2 VICE_PRESIDENT, Max 3 AREA_MANAGER)
-- Since UNIQUE constraints cannot enforce limits > 1, we use a Trigger function with advisory lock.

CREATE OR REPLACE FUNCTION check_position_limits_func()
RETURNS TRIGGER AS $$
DECLARE
    vice_president_count INTEGER;
    area_manager_count INTEGER;
BEGIN
    -- Only check if the user is Active and Not Deleted
    IF NEW.is_deleted = false AND NEW.is_active = true THEN

        -- Take advisory transaction lock to serialize count checks against concurrent transactions
        PERFORM pg_advisory_xact_lock(hashtext('check_position_limits_lock'));

        -- Check Rule: Max 2 VICE_PRESIDENT
        IF NEW.position = 'VICE_PRESIDENT' THEN
            SELECT COUNT(*) INTO vice_president_count
            FROM users
            WHERE position = 'VICE_PRESIDENT'
              AND is_deleted = false
              AND is_active = true
              AND id != COALESCE(NEW.id, -1); -- Exclude current user in case of update

            IF vice_president_count >= 2 THEN
                RAISE EXCEPTION 'Business Rule Violation: Limits for VICE_PRESIDENT (Max 2) reached.';
            END IF;
        END IF;

        -- Check Rule: Max 3 AREA_MANAGER
        IF NEW.position = 'AREA_MANAGER' THEN
            SELECT COUNT(*) INTO area_manager_count
            FROM users
            WHERE position = 'AREA_MANAGER'
              AND is_deleted = false
              AND is_active = true
              AND id != COALESCE(NEW.id, -1);

            IF area_manager_count >= 3 THEN
                RAISE EXCEPTION 'Business Rule Violation: Limits for AREA_MANAGER (Max 3) reached.';
            END IF;
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to execute before Insert or Update
DROP TRIGGER IF EXISTS trg_check_position_limits ON users;

CREATE TRIGGER trg_check_position_limits
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION check_position_limits_func();

-- 5. Constraint on Area & Position
-- Rule: Members in NINH_BINH cannot be PRESIDENT or VICE_PRESIDENT.
-- Rule: AREA_MANAGER must belong to NINH_BINH.
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_user_area_position;
ALTER TABLE users ADD CONSTRAINT chk_user_area_position
CHECK (
    NOT (area = 'NINH_BINH' AND position IN ('PRESIDENT', 'VICE_PRESIDENT'))
    AND NOT (position = 'AREA_MANAGER' AND area != 'NINH_BINH')
);
