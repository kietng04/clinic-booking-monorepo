CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE appointments
ADD CONSTRAINT appointments_no_active_overlap
EXCLUDE USING gist (
    doctor_id WITH =,
    tsrange(
        appointment_date + appointment_time,
        appointment_date + appointment_time + ((COALESCE(duration_minutes, 30)::text || ' minutes')::interval),
        '[)'
    ) WITH &&
)
WHERE (status IN ('PENDING', 'CONFIRMED'));
