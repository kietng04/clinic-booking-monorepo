const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

const MOCK_DEMO_ACCOUNTS = {
  PATIENT: {
    role: 'PATIENT',
    label: 'Bệnh nhân',
    email: 'john.anderson@email.com',
    password: 'password',
  },
  DOCTOR: {
    role: 'DOCTOR',
    label: 'Bác sĩ',
    email: 'sarah.mitchell@healthflow.com',
    password: 'password',
  },
  ADMIN: {
    role: 'ADMIN',
    label: 'Quản trị',
    email: 'admin@healthflow.com',
    password: 'password',
  },
}

const REAL_DEMO_ACCOUNTS = {
  PATIENT: {
    role: 'PATIENT',
    label: 'Bệnh nhân',
    email: 'patient1@clinic.com',
    password: 'password',
  },
  DOCTOR: {
    role: 'DOCTOR',
    label: 'Bác sĩ',
    email: 'dr.sarah@clinic.com',
    password: 'password',
  },
  ADMIN: {
    role: 'ADMIN',
    label: 'Quản trị',
    email: 'admin@clinic.com',
    password: 'password',
  },
}

export const DEMO_ACCOUNTS = USE_MOCK_BACKEND ? MOCK_DEMO_ACCOUNTS : REAL_DEMO_ACCOUNTS

export const QUICK_DEMO_LOGINS = [DEMO_ACCOUNTS.PATIENT, DEMO_ACCOUNTS.DOCTOR, DEMO_ACCOUNTS.ADMIN]
