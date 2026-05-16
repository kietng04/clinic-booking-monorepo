import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import DoctorAnalytics from './DoctorAnalytics'

const {
  mockGetDoctorAppointments,
  mockShowToast,
} = vi.hoisted(() => ({
  mockGetDoctorAppointments: vi.fn(),
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

vi.mock('@/api/appointmentApiWrapper', () => ({
  appointmentApi: {
    getDoctorAppointments: mockGetDoctorAppointments,
  },
}))

describe('DoctorAnalytics', () => {
  beforeEach(() => {
    mockShowToast.mockReset()
    mockGetDoctorAppointments.mockReset()

    mockGetDoctorAppointments.mockResolvedValue([
      {
        id: 1,
        patientId: 10,
        appointmentDate: new Date().toISOString().slice(0, 10),
        appointmentTime: '09:00',
        status: 'COMPLETED',
        type: 'IN_PERSON',
        serviceFee: 500000,
      },
    ])
  })

  it('loads doctor analytics from doctor appointments', async () => {
    render(<DoctorAnalytics />)

    await waitFor(() => {
      expect(mockGetDoctorAppointments).toHaveBeenCalledWith('1', { size: 500 })
    })

    expect(await screen.findByText('Tổng lịch hẹn')).toBeInTheDocument()
    expect(screen.getByText('Doanh thu khám trực tiếp')).toBeInTheDocument()
  })

  it('shows truthful empty revenue state instead of mock analytics fallback', async () => {
    mockGetDoctorAppointments.mockResolvedValue([])

    render(<DoctorAnalytics />)

    expect(await screen.findByText('Tổng lịch hẹn')).toBeInTheDocument()
    expect(
      screen.getByText(/Chưa có dữ liệu doanh thu hoặc chưa áp dụng phí khám/i)
    ).toBeInTheDocument()
  })
})
