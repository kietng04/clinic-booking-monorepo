import path from 'node:path'

export const E2E_ACCOUNTS = {
  PATIENT: {
    role: 'PATIENT',
    email: process.env.E2E_PATIENT_EMAIL || 'patient1@clinic.com',
    password: process.env.E2E_PASSWORD || 'password',
  },
  DOCTOR: {
    role: 'DOCTOR',
    email: process.env.E2E_DOCTOR_EMAIL || 'dr.sarah@clinic.com',
    password: process.env.E2E_PASSWORD || 'password',
  },
  ADMIN: {
    role: 'ADMIN',
    email: process.env.E2E_ADMIN_EMAIL || 'admin@clinic.com',
    password: process.env.E2E_PASSWORD || 'password',
  },
}

export const AUTH_DIR = path.resolve('tests/e2e/.auth')

export const AUTH_STATE = {
  PATIENT: path.join(AUTH_DIR, 'patient.json'),
  DOCTOR: path.join(AUTH_DIR, 'doctor.json'),
  ADMIN: path.join(AUTH_DIR, 'admin.json'),
}

export const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080'
