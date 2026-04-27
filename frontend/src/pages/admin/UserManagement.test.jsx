import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import UserManagement from './UserManagement'

const {
  mockShowToast,
  mockGetUsers,
} = vi.hoisted(() => ({
  mockShowToast: vi.fn(),
  mockGetUsers: vi.fn(),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, whileHover: _whileHover, whileTap: _whileTap, ...props }) => <button {...props}>{children}</button>,
  },
}))

vi.mock('@/components/ui/Modal', () => ({
  Modal: ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null),
}))

vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    showToast: mockShowToast,
  }),
}))

vi.mock('@/api/userApiWrapper', () => ({
  userApi: {
    getUsers: mockGetUsers,
    updateUser: vi.fn(),
    createUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}))

describe('UserManagement', () => {
  beforeEach(() => {
    mockShowToast.mockReset()
    mockGetUsers.mockReset()
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('loads users and filters by search text', async () => {
    mockGetUsers.mockResolvedValue([
      { id: 1, fullName: 'Nguyen Van A', email: 'patient@example.com', role: 'PATIENT' },
      { id: 2, fullName: 'Dr. Tran B', email: 'doctor@example.com', role: 'DOCTOR' },
    ])

    render(<UserManagement />)

    expect(await screen.findByRole('heading', { name: 'Quản lý Người dùng' })).toBeInTheDocument()
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    expect(screen.getByText('Dr. Tran B')).toBeInTheDocument()

    await userEvent.type(screen.getByPlaceholderText('Tìm theo tên hoặc email...'), 'doctor')

    await waitFor(() => {
      expect(screen.queryByText('Nguyen Van A')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Dr. Tran B')).toBeInTheDocument()
  })

  it('shows an error toast when loading users fails', async () => {
    mockGetUsers.mockRejectedValue(new Error('boom'))

    render(<UserManagement />)

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Không thể tải danh sách người dùng',
      })
    })
  })
})
