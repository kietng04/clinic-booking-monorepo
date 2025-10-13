-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500) NOT NULL,
    discount_percentage NUMERIC(5, 2) NOT NULL,
    max_discount NUMERIC(12, 2) NOT NULL,
    min_purchase_amount NUMERIC(12, 2) NOT NULL,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL,
    usage_limit INTEGER NOT NULL DEFAULT -1,
    used_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_is_active ON vouchers(is_active);
CREATE INDEX idx_vouchers_valid_from_to ON vouchers(valid_from, valid_to);
CREATE INDEX idx_vouchers_created_at ON vouchers(created_at DESC);

-- Insert sample vouchers
INSERT INTO vouchers (code, description, discount_percentage, max_discount, min_purchase_amount, valid_from, valid_to, usage_limit, is_active)
VALUES
    ('WELCOME10', 'Welcome discount 10%', 10.00, 100000, 0, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '30 days', -1, TRUE),
    ('VIP20', 'VIP member 20% discount', 20.00, 500000, 500000, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '60 days', 100, TRUE),
    ('SUMMER15', 'Summer sale 15%', 15.00, 300000, 200000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', 500, TRUE),
    ('LOYALTY25', 'Loyalty program 25%', 25.00, 1000000, 1000000, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '180 days', -1, TRUE);

-- Add comment
COMMENT ON TABLE vouchers IS 'Stores discount vouchers and promotional codes';
COMMENT ON COLUMN vouchers.code IS 'Unique voucher code (uppercase)';
COMMENT ON COLUMN vouchers.discount_percentage IS 'Discount percentage (0-100)';
COMMENT ON COLUMN vouchers.max_discount IS 'Maximum discount amount in VND';
COMMENT ON COLUMN vouchers.min_purchase_amount IS 'Minimum order amount to use voucher';
COMMENT ON COLUMN vouchers.usage_limit IS 'Total usage limit (-1 for unlimited)';
COMMENT ON COLUMN vouchers.used_count IS 'Number of times voucher has been used';
