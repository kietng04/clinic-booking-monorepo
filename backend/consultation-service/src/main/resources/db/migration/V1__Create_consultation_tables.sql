-- Consultation Service Database Schema
-- Version: 1.0
-- Description: Initial schema for online consultations and messaging

-- ============================================
-- Table: consultations
-- Description: Stores online consultation requests
-- ============================================

CREATE TABLE IF NOT EXISTS consultations (
    id BIGSERIAL PRIMARY KEY,

    -- Patient Information
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(255) NOT NULL,

    -- Doctor Information
    doctor_id BIGINT NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(100),

    -- Consultation Details
    topic VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    -- Financial
    fee DECIMAL(12, 2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    payment_id VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- Rejection
    rejection_reason VARCHAR(500),

    -- Completion Details
    doctor_notes TEXT,
    diagnosis VARCHAR(1000),
    prescription TEXT,

    -- Rating
    rating DECIMAL(2, 1),
    review VARCHAR(1000),

    -- Indexes
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT chk_rating CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5))
);

-- Indexes for consultations table
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_created_at ON consultations(created_at DESC);
CREATE INDEX idx_consultations_patient_status ON consultations(patient_id, status);
CREATE INDEX idx_consultations_doctor_status ON consultations(doctor_id, status);

-- ============================================
-- Table: messages
-- Description: Stores chat messages in consultations
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,

    -- Consultation Reference
    consultation_id BIGINT NOT NULL,

    -- Sender Information
    sender_id BIGINT NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(20) NOT NULL,

    -- Message Content
    type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    content TEXT,

    -- File Attachment
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    file_mime_type VARCHAR(100),

    -- Timestamps
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Read Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,

    -- Soft Delete
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,

    -- Foreign Key
    CONSTRAINT fk_messages_consultation
        FOREIGN KEY (consultation_id)
        REFERENCES consultations(id)
        ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT chk_message_type CHECK (type IN ('TEXT', 'IMAGE', 'FILE', 'SYSTEM')),
    CONSTRAINT chk_sender_role CHECK (sender_role IN ('PATIENT', 'DOCTOR', 'SYSTEM'))
);

-- Indexes for messages table
CREATE INDEX idx_messages_consultation_id ON messages(consultation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at ASC);
CREATE INDEX idx_messages_consultation_sent ON messages(consultation_id, sent_at ASC);
CREATE INDEX idx_messages_unread ON messages(consultation_id, is_read) WHERE is_read = FALSE AND is_deleted = FALSE;

-- ============================================
-- Function: Update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for consultations table
CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE consultations IS 'Stores online consultation requests between patients and doctors';
COMMENT ON TABLE messages IS 'Stores chat messages within consultations';

COMMENT ON COLUMN consultations.status IS 'PENDING: Waiting for doctor, ACCEPTED: Doctor accepted, IN_PROGRESS: Chat started, COMPLETED: Finished, REJECTED: Doctor declined, CANCELLED: Patient cancelled';
COMMENT ON COLUMN messages.type IS 'TEXT: Regular message, IMAGE: Image attachment, FILE: File attachment, SYSTEM: System notification';
COMMENT ON COLUMN messages.is_read IS 'Indicates if the message has been read by the recipient';
COMMENT ON COLUMN messages.is_deleted IS 'Soft delete flag - message is hidden but not removed from database';
