-- Migration V4: Add Counter Payment Support
-- Add fields for receptionist confirmation of cash/bank transfer/card payments at counter

-- Add new columns to payment_orders table
ALTER TABLE payment_orders
ADD COLUMN confirmed_by_user_id BIGINT,
ADD COLUMN confirmed_at TIMESTAMP,
ADD COLUMN confirmation_note TEXT;

-- Add comments for new columns
COMMENT ON COLUMN payment_orders.confirmed_by_user_id IS 'ID of receptionist who confirmed counter payment';
COMMENT ON COLUMN payment_orders.confirmed_at IS 'Timestamp when counter payment was confirmed';
COMMENT ON COLUMN payment_orders.confirmation_note IS 'Optional note from receptionist during confirmation';

-- Add index for confirmed_by_user_id for reporting
CREATE INDEX idx_payment_orders_confirmed_by ON payment_orders(confirmed_by_user_id);

-- Add index for confirmed_at for date range queries
CREATE INDEX idx_payment_orders_confirmed_at ON payment_orders(confirmed_at);
