ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS patient_rating NUMERIC(2,1),
    ADD COLUMN IF NOT EXISTS patient_review TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_appointments_patient_rating_range'
    ) THEN
        ALTER TABLE appointments
            ADD CONSTRAINT chk_appointments_patient_rating_range
            CHECK (patient_rating IS NULL OR (patient_rating >= 1.0 AND patient_rating <= 5.0));
    END IF;
END $$;
