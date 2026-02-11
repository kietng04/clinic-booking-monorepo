import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@/test/utils'
import DoctorAnalytics from './DoctorAnalytics'

const {
  mockGetDoctorStatsFromWrapper,
  mockGetDoctorAnalyticsFromWrapper,
  mockGetDoctorStatsFromReal,
  mockGetDoctorAnalyticsFromReal,
  mockShowToast,
} = vi.hoisted(() => ({
  mockGetDoctorStatsFromWrapper: vi.fn(),
  mockGetDoctorAnalyticsFromWrapper: vi.fn(),
  mockGetDoctorStatsFromReal: vi.fn(),
  mockGetDoctorAnalyticsFromReal: vi.fn(),
  mockShowToast: vi.fn(),
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', role: 'DOCTOR', name: 'Dr. Sarah Mitchell' },
  }),
}))

vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    showToast: mockShowToast,
  }),
}))

vi.mock('@/api/statsApiWrapper', () => ({
  statsApi: {
    getDoctorStats: mockGetDoctorStatsFromWrapper,
    getDoctorAnalyticsDashboard: mockGetDoctorAnalyticsFromWrapper,
  },
}))

vi.mock('@/api/realApis/statsApi', () => ({
  statsApi: {
    getDoctorStats: mockGetDoctorStatsFromReal,
    getDoctorAnalyticsDashboard: mockGetDoctorAnalyticsFromReal,
  },
}))

describe('DoctorAnalytics backend selection', () => {
  beforeEach(() => {
    mockShowToast.mockReset()

    mockGetDoctorStatsFromWrapper.mockReset()
    mockGetDoctorAnalyticsFromWrapper.mockReset()
    mockGetDoctorStatsFromReal.mockReset()
    mockGetDoctorAnalyticsFromReal.mockReset()

    mockGetDoctorStatsFromWrapper.mockResolvedValue({
      totalPatients: 10,
      totalAppointments: 20,
      completionRate: 80,
      avgRating: 4.6,
    })

    mockGetDoctorAnalyticsFromWrapper.mockResolvedValue({
      appointments: [{ month: 'Jan', count: 5, completed: 4, revenue: 1000000 }],
      appointmentTypes: [{ name: 'Khám trực tiếp', value: 60 }],
      timeSlots: [{ time: '09:00', bookings: 5 }],
      patientDemographics: {
        ageDistribution: [{ range: '20-30', count: 4 }],
        genderRatio: [{ name: 'Nam', value: 40 }, { name: 'Nữ', value: 60 }],
      },
    })
  })

  it('uses statsApi wrapper for doctor analytics data', async () => {
    render(<DoctorAnalytics />)

    await waitFor(() => {
      expect(mockGetDoctorStatsFromWrapper).toHaveBeenCalledWith('1')
      expect(mockGetDoctorAnalyticsFromWrapper).toHaveBeenCalledWith('1')
    })

    expect(mockGetDoctorStatsFromReal).not.toHaveBeenCalled()
    expect(mockGetDoctorAnalyticsFromReal).not.toHaveBeenCalled()
  })
})
