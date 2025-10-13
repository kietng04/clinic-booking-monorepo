-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    module VARCHAR(50)
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(10) NOT NULL,
    code VARCHAR(50) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    attempt_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed default permissions
INSERT INTO permissions (code, name, description, module) VALUES
('appointments.view_own', 'View Own Appointments', 'View user own appointments', 'APPOINTMENTS'),
('appointments.view_all', 'View All Appointments', 'View all appointments in system', 'APPOINTMENTS'),
('appointments.create', 'Create Appointment', 'Create new appointments', 'APPOINTMENTS'),
('appointments.cancel', 'Cancel Appointment', 'Cancel appointments', 'APPOINTMENTS'),
('appointments.check_in', 'Check In', 'Process check-in for appointments', 'APPOINTMENTS'),
('medical_records.view', 'View Medical Records', 'View medical records', 'MEDICAL'),
('medical_records.create', 'Create Medical Records', 'Create new medical records', 'MEDICAL'),
('prescriptions.create', 'Create Prescriptions', 'Create prescriptions', 'MEDICAL'),
('prescriptions.view', 'View Prescriptions', 'View prescriptions', 'MEDICAL'),
('medications.manage', 'Manage Medications', 'Manage medication catalog', 'MEDICAL'),
('lab_tests.view', 'View Lab Tests', 'View lab test results', 'MEDICAL'),
('lab_tests.update', 'Update Lab Tests', 'Update lab test results', 'MEDICAL'),
('users.manage', 'Manage Users', 'Add/edit/delete users', 'ADMIN'),
('clinics.manage', 'Manage Clinics', 'Add/edit/delete clinics', 'ADMIN'),
('payments.process', 'Process Payments', 'Handle payment operations', 'PAYMENT'),
('reports.view', 'View Reports', 'View system reports', 'ADMIN'),
('profile.view', 'View Profile', 'View own profile', 'PROFILE'),
('profile.edit', 'Edit Profile', 'Edit own profile', 'PROFILE')
ON CONFLICT (code) DO NOTHING;
