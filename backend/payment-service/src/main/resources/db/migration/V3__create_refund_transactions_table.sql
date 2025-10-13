-- Refund Transactions Table
-- Stores refund request and completion records

CREATE TABLE IF NOT EXISTS refund_transactions (
    id BIGSERIAL PRIMARY KEY,
    payment_order_id BIGINT NOT NULL,
    payment_transaction_id BIGINT NOT NULL,

    -- Refund details
    refund_id VARCHAR(50) UNIQUE NOT NULL,
    trans_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT,

    -- Momo refund response
    result_code INTEGER,
    message TEXT,

    -- Status
    status VARCHAR(50) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    CONSTRAINT fk_refund_transactions_order FOREIGN KEY (payment_order_id) REFERENCES payment_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_refund_transactions_payment_txn FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_refund_transactions_order_id ON refund_transactions(payment_order_id);
CREATE INDEX IF NOT EXISTS idx_refund_transactions_refund_id ON refund_transactions(refund_id);
CREATE INDEX IF NOT EXISTS idx_refund_transactions_status ON refund_transactions(status);
