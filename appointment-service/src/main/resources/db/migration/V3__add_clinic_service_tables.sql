-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    phone VARCHAR(20),
    email VARCHAR(255),
    description TEXT,
    opening_hours TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    room_number VARCHAR(50),
    type VARCHAR(30),
    capacity INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

-- Create index for rooms by clinic
CREATE INDEX IF NOT EXISTS idx_room_clinic ON rooms (clinic_id);

-- Create medical_services table
CREATE TABLE IF NOT EXISTS medical_services (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(30),
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

-- Create index for services by clinic
CREATE INDEX IF NOT EXISTS idx_service_clinic ON medical_services (clinic_id);

-- Create service_prices table
CREATE TABLE IF NOT EXISTS service_prices (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL,
    doctor_id BIGINT,
    price NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES medical_services(id)
);

-- Create index for prices by service
CREATE INDEX IF NOT EXISTS idx_price_service ON service_prices (service_id);

-- Add clinic/service fields to appointments (optional, nullable for backward compatibility)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS clinic_id BIGINT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS room_id BIGINT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_id BIGINT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_fee NUMERIC(10,2);
