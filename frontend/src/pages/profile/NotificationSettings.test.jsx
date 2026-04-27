import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import NotificationSettings from './NotificationSettings'

const {
  mockShowToast,
  mockGetNotifications,
  mockUpdateNotifications,
} = vi.hoisted(() => ({
  mockShowToast: vi.fn(),
  mockGetNotifications: vi.fn(),
  mockUpdateNotifications: vi.fn(),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
}))

vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    showToast: mockShowToast,
  }),
}))

vi.mock('@/api/profileApiWrapper', () => ({
  profileApi: {
    getNotifications: mockGetNotifications,
    updateNotifications: mockUpdateNotifications,
  },
}))

describe('NotificationSettings', () => {
  beforeEach(() => {
    mockShowToast.mockReset()
    mockGetNotifications.mockReset()
    mockUpdateNotifications.mockReset()
  })

  it('loads notification settings and saves updates', async () => {
    mockGetNotifications.mockResolvedValue({
      emailReminders: true,
      emailPrescription: false,
      emailLabResults: true,
      emailMarketing: false,
      smsReminders: true,
      smsUrgent: false,
      pushAll: true,
      reminderTiming: '2_HOURS',
    })
    mockUpdateNotifications.mockResolvedValue({
      emailReminders: false,
      emailPrescription: false,
      emailLabResults: true,
      emailMarketing: false,
      smsReminders: true,
      smsUrgent: false,
      pushAll: true,
      reminderTiming: '2_DAYS',
    })

    render(<NotificationSettings />)

    expect(await screen.findByRole('heading', { name: 'Cài đặt thông báo' })).toBeInTheDocument()

    const toggles = await screen.findAllByRole('button', { pressed: true })
    await userEvent.click(toggles[0])
    await userEvent.selectOptions(screen.getByRole('combobox'), '2_DAYS')
    await userEvent.click(screen.getByRole('button', { name: 'Lưu cài đặt' }))

    await waitFor(() => {
      expect(mockUpdateNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          emailReminders: false,
          reminderTiming: '2_DAYS',
        })
      )
    })

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      message: 'Cài đặt thông báo đã được lưu!',
    })
  })

  it('shows retry state when loading notifications fails', async () => {
    mockGetNotifications.mockRejectedValue(new Error('network'))

    render(<NotificationSettings />)

    expect(await screen.findByText('Không thể tải cài đặt thông báo từ máy chủ.')).toBeInTheDocument()
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Không thể tải cài đặt thông báo',
    })
  })
})
