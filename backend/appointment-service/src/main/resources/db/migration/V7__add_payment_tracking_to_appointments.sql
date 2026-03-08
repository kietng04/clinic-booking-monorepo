ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS payment_order_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(32),
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
    ADD COLUMN IF NOT EXISTS payment_expires_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_appointments_payment_order_id ON appointments(payment_order_id);
