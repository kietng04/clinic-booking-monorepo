import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import DoctorAnalytics from './DoctorAnalytics'

const {
  mockGetDoctorStats,
  mockGetDoctorAnalytics,
  mockShowToast,
} = vi.hoisted(() => ({
  mockGetDoctorStats: vi.fn(),
  mockGetDoctorAnalytics: vi.fn(),
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

vi.mock('@/api/realApis/statsApi', () => ({
  statsApi: {
    getDoctorStats: mockGetDoctorStats,
    getDoctorAnalyticsDashboard: mockGetDoctorAnalytics,
  },
}))

describe('DoctorAnalytics', () => {
  beforeEach(() => {
    mockShowToast.mockReset()
    mockGetDoctorStats.mockReset()
    mockGetDoctorAnalytics.mockReset()

    mockGetDoctorStats.mockResolvedValue({
      totalPatients: 10,
      totalAppointments: 20,
      completionRate: 80,
      avgRating: 4.6,
    })

    mockGetDoctorAnalytics.mockResolvedValue({
      appointments: [{ month: 'Jan', count: 5, completed: 4, revenue: 1000000 }],
      appointmentTypes: [{ name: 'Khám trực tiếp', value: 60 }],
      timeSlots: [{ time: '09:00', bookings: 5 }],
      patientDemographics: {
        ageDistribution: [{ range: '20-30', count: 4 }],
        genderRatio: [{ gender: 'Nam', percentage: 40, count: 4 }],
      },
    })
  })

  it('loads doctor analytics directly from the real stats API client', async () => {
    render(<DoctorAnalytics />)

    await waitFor(() => {
      expect(mockGetDoctorStats).toHaveBeenCalledWith('1')
      expect(mockGetDoctorAnalytics).toHaveBeenCalledWith('1')
    })
  })

  it('shows truthful empty chart state instead of mock analytics fallback', async () => {
    mockGetDoctorAnalytics.mockResolvedValue({
      appointments: [],
      appointmentTypes: [],
      timeSlots: [],
      patientDemographics: {
        ageDistribution: [],
        genderRatio: [],
      },
    })

    render(<DoctorAnalytics />)

    expect(
      await screen.findByText(/Chưa có dữ liệu biểu đồ phân tích cho giai đoạn này/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Chưa có dữ liệu lịch hẹn theo tháng từ backend/i)
    ).toBeInTheDocument()
  })
})
