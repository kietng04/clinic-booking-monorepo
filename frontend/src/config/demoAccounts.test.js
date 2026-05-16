import { describe, it, expect } from 'vitest'
import { getDemoAccounts, getQuickDemoLogins } from './demoAccounts'

describe('demoAccounts', () => {
  it('returns healthflow demo accounts in mock mode', () => {
    const accounts = getDemoAccounts(true)

    expect(accounts.PATIENT.email).toBe('john.anderson@email.com')
    expect(accounts.DOCTOR.email).toBe('sarah.mitchell@healthflow.com')
    expect(accounts.ADMIN.email).toBe('admin@healthflow.com')
  })

  it('returns healthflow seeded accounts in real mode', () => {
    const accounts = getDemoAccounts(false)

    expect(accounts.PATIENT.email).toBe('patient.1@healthflow.vn')
    expect(accounts.DOCTOR.email).toBe('doctor.1@healthflow.vn')
    expect(accounts.ADMIN.email).toBe('admin.1@healthflow.vn')
    expect(accounts.PATIENT.fallbacks[0].email).toBe('patient1@clinic.com')
    expect(accounts.DOCTOR.fallbacks[0].email).toBe('dr.sarah@clinic.com')
    expect(accounts.ADMIN.fallbacks[0].email).toBe('admin@clinic.com')
  })

  it('returns quick login list ordered by patient, doctor, admin', () => {
    const mockQuickLogins = getQuickDemoLogins(true)
    const realQuickLogins = getQuickDemoLogins(false)

    expect(mockQuickLogins.map((item) => item.role)).toEqual(['PATIENT', 'DOCTOR', 'ADMIN'])
    expect(realQuickLogins.map((item) => item.role)).toEqual(['PATIENT', 'DOCTOR', 'ADMIN'])
  })
})
