-- Medications Catalog Table
CREATE TABLE IF NOT EXISTS medications (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'viên',
    default_dosage VARCHAR(100),
    default_frequency VARCHAR(100),
    default_duration VARCHAR(100),
    instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add medication_id to prescriptions (optional reference)
ALTER TABLE prescriptions
ADD COLUMN medication_id BIGINT REFERENCES medications(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_medication_name ON medications(name);
CREATE INDEX IF NOT EXISTS idx_medication_category ON medications(category);
CREATE INDEX IF NOT EXISTS idx_medication_active ON medications(is_active);
CREATE INDEX IF NOT EXISTS idx_prescription_medication ON prescriptions(medication_id);
