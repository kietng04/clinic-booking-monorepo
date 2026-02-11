import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { DEMO_ACCOUNTS } from '@/config/demoAccounts'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()
const mockShowToast = vi.fn()

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    isLoading: false,
  }),
}))

vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    showToast: mockShowToast,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage quick demo', () => {
  beforeEach(() => {
    mockLogin.mockReset()
    mockNavigate.mockReset()
    mockShowToast.mockReset()
    mockLogin.mockResolvedValue({})
  })

  it('uses mock patient credentials for quick demo login', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Bệnh nhân' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(DEMO_ACCOUNTS.PATIENT.email, DEMO_ACCOUNTS.PATIENT.password)
    })
  })

  it('uses mock doctor credentials for quick demo login', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Bác sĩ' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(DEMO_ACCOUNTS.DOCTOR.email, DEMO_ACCOUNTS.DOCTOR.password)
    })
  })
})
