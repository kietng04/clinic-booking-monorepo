-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    patient_name VARCHAR(255),
    doctor_name VARCHAR(255),
    patient_phone VARCHAR(20),
    family_member_id BIGINT,
    family_member_name VARCHAR(255),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    type VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    symptoms TEXT,
    notes TEXT,
    cancel_reason TEXT,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Schedules Table
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    doctor_name VARCHAR(255),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Appointments
CREATE INDEX IF NOT EXISTS idx_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_date_status ON appointments(appointment_date, status);

-- Indexes for Doctor Schedules
CREATE INDEX IF NOT EXISTS idx_doctor_id ON doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_day ON doctor_schedules(doctor_id, day_of_week);
