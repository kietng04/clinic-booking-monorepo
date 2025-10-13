-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_id BIGINT,
    related_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Notifications
CREATE INDEX IF NOT EXISTS idx_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_created_at ON notifications(created_at);
