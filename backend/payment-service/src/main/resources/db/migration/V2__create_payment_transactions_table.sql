-- Payment Transactions Table
-- Stores Momo transaction details and API responses

CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    payment_order_id BIGINT NOT NULL,

    -- Momo transaction details
    partner_code VARCHAR(50) NOT NULL,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    trans_id BIGINT,

    -- Request data
    request_type VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    order_info TEXT,
    redirect_url TEXT,
    ipn_url TEXT,

    -- Response data
    pay_url TEXT,
    deeplink TEXT,
    qr_code_url TEXT,

    -- Signature & security
    signature VARCHAR(512),
    request_signature VARCHAR(512),

    -- Status
    result_code INTEGER,
    message TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_transactions_order FOREIGN KEY (payment_order_id) REFERENCES payment_orders(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(payment_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_request_id ON payment_transactions(request_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_trans_id ON payment_transactions(trans_id);
