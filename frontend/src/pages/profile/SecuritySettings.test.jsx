import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import SecuritySettings from './SecuritySettings'

const {
  mockShowToast,
  mockChangePassword,
  mockPost,
} = vi.hoisted(() => ({
  mockShowToast: vi.fn(),
  mockChangePassword: vi.fn(),
  mockPost: vi.fn(),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial: _initial, animate: _animate, transition: _transition, whileHover: _whileHover, whileTap: _whileTap, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, initial: _initial, animate: _animate, transition: _transition, whileHover: _whileHover, whileTap: _whileTap, ...props }) => <button {...props}>{children}</button>,
  },
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: {
      email: 'kiet@example.com',
      emailVerified: false,
      phoneVerified: false,
    },
  }),
}))

vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    showToast: mockShowToast,
  }),
}))

vi.mock('@/api/profileApiWrapper', () => ({
  profileApi: {
    changePassword: mockChangePassword,
  },
}))

vi.mock('@/api/authApi', () => ({
  default: {
    post: mockPost,
  },
}))

describe('SecuritySettings', () => {
  beforeEach(() => {
    mockShowToast.mockReset()
    mockChangePassword.mockReset()
    mockPost.mockReset()
  })

  it('sends verification email when user requests it', async () => {
    mockPost.mockResolvedValue({})

    render(<SecuritySettings />)

    await userEvent.click(screen.getByRole('button', { name: 'Xác minh ngay' }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/auth/send-email-verification')
    })
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      message: 'Email xác minh đã được gửi!',
    })
  })

  it('blocks password change when confirmation does not match', async () => {
    render(<SecuritySettings />)

    const passwordFields = screen.getAllByPlaceholderText('••••••••')
    await userEvent.type(passwordFields[0], 'current-pass')
    await userEvent.type(passwordFields[1], 'NewPass123!')
    await userEvent.type(passwordFields[2], 'Different123!')
    await userEvent.click(screen.getByRole('button', { name: 'Cập nhật mật khẩu' }))

    expect(mockChangePassword).not.toHaveBeenCalled()
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Mật khẩu không khớp',
    })
  })
})
