import { describe, expect, it } from 'vitest'

import { mockAdminApi } from './adminApiWrapper'

describe('adminApiWrapper mock reports', () => {
  it('returns appointment report data instead of throwing in mock mode', async () => {
    const result = await mockAdminApi.getAppointmentReport({ dateRange: '3months', groupBy: 'month' })

    expect(result.totalAppointments).toBeGreaterThan(0)
    expect(result.monthlyTrend).toHaveLength(3)
    expect(result.monthlyTrend[0]).toMatchObject({
      month: expect.any(String),
      total: expect.any(Number),
      confirmed: expect.any(Number),
      completed: expect.any(Number),
      cancelled: expect.any(Number),
    })
  })

  it('returns revenue and patient reports with normalized numeric fields', async () => {
    const revenue = await mockAdminApi.getRevenueReport({ dateRange: '6months', groupBy: 'month' })
    const patients = await mockAdminApi.getPatientReport({ dateRange: '30days', groupBy: 'week' })

    expect(revenue.totalRevenue).toBeGreaterThan(0)
    expect(revenue.monthlyTrend.length).toBeGreaterThan(0)
    expect(revenue.monthlyTrend[0].online + revenue.monthlyTrend[0].cash).toBe(revenue.monthlyTrend[0].revenue)

    expect(patients.totalPatients).toBeGreaterThan(0)
    expect(patients.activePatients).toBeGreaterThan(patients.newPatients)
  })
})
