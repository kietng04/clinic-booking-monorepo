-- Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    patient_name VARCHAR(255),
    doctor_name VARCHAR(255),
    diagnosis TEXT,
    symptoms TEXT,
    treatment_plan TEXT,
    notes TEXT,
    follow_up_date DATE,
    attachments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGSERIAL PRIMARY KEY,
    medical_record_id BIGINT NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    doctor_id BIGINT NOT NULL,
    doctor_name VARCHAR(255),
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255),
    frequency VARCHAR(255),
    duration VARCHAR(255),
    instructions TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health Metrics Table
CREATE TABLE IF NOT EXISTS health_metrics (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(255),
    metric_type VARCHAR(50) NOT NULL,
    value VARCHAR(100) NOT NULL,
    unit VARCHAR(20),
    measured_at TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointment_id ON medical_records(appointment_id);
CREATE INDEX IF NOT EXISTS idx_medical_record ON prescriptions(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_metric ON health_metrics(patient_id, metric_type, measured_at);
