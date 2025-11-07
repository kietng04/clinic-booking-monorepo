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
  })

  it('returns quick login list ordered by patient, doctor, admin', () => {
    const mockQuickLogins = getQuickDemoLogins(true)
    const realQuickLogins = getQuickDemoLogins(false)

    expect(mockQuickLogins.map((item) => item.role)).toEqual(['PATIENT', 'DOCTOR', 'ADMIN'])
    expect(realQuickLogins.map((item) => item.role)).toEqual(['PATIENT', 'DOCTOR', 'ADMIN'])
  })
})
