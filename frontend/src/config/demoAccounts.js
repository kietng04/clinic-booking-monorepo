export const MOCK_DEMO_ACCOUNTS = {
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

export const REAL_DEMO_ACCOUNTS = {
  PATIENT: {
    role: 'PATIENT',
    label: 'Bệnh nhân',
    email: 'patient.1@healthflow.vn',
    password: 'password',
  },
  DOCTOR: {
    role: 'DOCTOR',
    label: 'Bác sĩ',
    email: 'doctor.1@healthflow.vn',
    password: 'password',
  },
  ADMIN: {
    role: 'ADMIN',
    label: 'Quản trị',
    email: 'admin.1@healthflow.vn',
    password: 'password',
  },
}

const resolveMode = () => String(import.meta.env.VITE_USE_MOCK_BACKEND).toLowerCase() === 'true'

export const getDemoAccounts = (useMockBackend = resolveMode()) =>
  useMockBackend ? MOCK_DEMO_ACCOUNTS : REAL_DEMO_ACCOUNTS

export const getQuickDemoLogins = (useMockBackend = resolveMode()) => {
  const demoAccounts = getDemoAccounts(useMockBackend)
  return [demoAccounts.PATIENT, demoAccounts.DOCTOR, demoAccounts.ADMIN]
}
