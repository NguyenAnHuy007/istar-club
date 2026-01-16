-- Constraints to enforce business rules at Database level
-- Run this script to apply constraints

-- 1. Ensure only one active PRESIDENT
-- This uses a partial unique index. Only works if is_active is true.
CREATE UNIQUE INDEX idx_unique_active_president
ON users (position)
WHERE position = 'PRESIDENT' AND is_active = true;

-- 2. Ensure only one active DEPARTMENT_HEAD per Department
CREATE UNIQUE INDEX idx_unique_active_department_head
ON users (department)
WHERE position = 'DEPARTMENT_HEAD' AND is_active = true;

-- 3. Advanced Constraints using Limits (Max 2 VICE_PRESIDENT, Max 3 AREA_MANAGER)
-- Since UNIQUE constraints cannot enforce limits > 1, we use a Trigger function.

CREATE OR REPLACE FUNCTION check_position_limits_func()
RETURNS TRIGGER AS $$
DECLARE
    vice_president_count INTEGER;
    area_manager_count INTEGER;
BEGIN
    -- Only check if the user is Active
    IF NEW.is_active = true THEN

        -- Check Rule: Max 2 VICE_PRESIDENT
        IF NEW.position = 'VICE_PRESIDENT' THEN
            SELECT COUNT(*) INTO vice_president_count
            FROM users
            WHERE position = 'VICE_PRESIDENT'
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
