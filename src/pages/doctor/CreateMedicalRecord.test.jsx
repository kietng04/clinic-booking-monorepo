import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import CreateMedicalRecord from '@/pages/doctor/CreateMedicalRecord'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { medicalRecordApi } from '@/api/medicalRecordApiWrapper'
import { medicationApi } from '@/api/medicationApiWrapper'

const mockNavigate = vi.fn()
const mockSearchParams = new URLSearchParams('?appointmentId=1')

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
  BrowserRouter: ({ children }) => children
}))

// Mock the stores
const mockUser = { id: 1, fullName: 'Dr. Test' }
const mockShowToast = vi.fn()

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: mockUser
  })
}))

vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    showToast: mockShowToast
  })
}))

// Mock the APIs
vi.mock('@/api/appointmentApiWrapper', () => ({
  appointmentApi: {
    getAppointment: vi.fn(),
    completeAppointment: vi.fn()
  }
}))

vi.mock('@/api/medicalRecordApiWrapper', () => ({
  medicalRecordApi: {
    create: vi.fn()
  }
}))

vi.mock('@/api/prescriptionApiWrapper', () => ({
  prescriptionApi: {
    create: vi.fn()
  }
}))

vi.mock('@/api/medicationApiWrapper', () => ({
  medicationApi: {
    getActiveMedications: vi.fn()
  }
}))

describe('CreateMedicalRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock medication API
    medicationApi.getActiveMedications.mockResolvedValue([])
  })

  it('disable save for non-confirmed appointment', async () => {
    // Mock appointment with PENDING status
    appointmentApi.getAppointment.mockResolvedValue({
      id: 1,
      patientId: 1,
      patientName: 'Test Patient',
      appointmentDate: '2026-02-01',
      appointmentTime: '10:00',
      status: 'PENDING'
    })

    render(<CreateMedicalRecord />)

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Tạo hồ sơ bệnh án')).toBeInTheDocument()
    })

    // Find the save button
    const saveButton = screen.getByRole('button', { name: /lưu hồ sơ/i })
    
    // Verify button is disabled
    expect(saveButton).toBeDisabled()
  })

  it('blocks submit when appointment is not confirmed', async () => {
    appointmentApi.getAppointment.mockResolvedValue({
      id: 1,
      patientId: 1,
      patientName: 'Test Patient',
      appointmentDate: '2026-02-01',
      appointmentTime: '10:00',
      status: 'PENDING'
    })

    const { container } = render(<CreateMedicalRecord />)

    await waitFor(() => {
      expect(screen.getByText('Tạo hồ sơ bệnh án')).toBeInTheDocument()
    })

    const form = container.querySelector('form')
    fireEvent.submit(form)

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Chỉ có thể tạo hồ sơ cho lịch hẹn đã xác nhận'
    })
    expect(medicalRecordApi.create).not.toHaveBeenCalled()
  })
})
