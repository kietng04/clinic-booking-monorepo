CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'appointments_no_active_overlap'
    ) THEN
        ALTER TABLE appointments
        ADD CONSTRAINT appointments_no_active_overlap
        EXCLUDE USING gist (
            doctor_id WITH =,
            tsrange(
                appointment_date + appointment_time,
                appointment_date + appointment_time + make_interval(mins => COALESCE(duration_minutes, 30)),
                '[)'
            ) WITH &&
        )
        WHERE (status IN ('PENDING', 'CONFIRMED'));
    END IF;
END $$;
