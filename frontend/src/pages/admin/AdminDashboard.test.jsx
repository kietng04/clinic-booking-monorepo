import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import AdminDashboard from './AdminDashboard'

const {
  mockShowToast,
  mockGetAdminStats,
  mockGetAdminAnalyticsDashboard,
} = vi.hoisted(() => ({
  mockShowToast: vi.fn(),
  mockGetAdminStats: vi.fn(),
  mockGetAdminAnalyticsDashboard: vi.fn(),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial: _initial, animate: _animate, transition: _transition, whileHover: _whileHover, whileTap: _whileTap, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, initial: _initial, animate: _animate, transition: _transition, whileHover: _whileHover, whileTap: _whileTap, ...props }) => <button {...props}>{children}</button>,
  },
}))

vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    showToast: mockShowToast,
  }),
}))

vi.mock('@/api/statsApiWrapper', () => ({
  statsApi: {
    getAdminStats: mockGetAdminStats,
    getAdminAnalyticsDashboard: mockGetAdminAnalyticsDashboard,
  },
}))

vi.mock('@/utils/apiRetry', () => ({
  withRetry: (fn) => fn(),
}))

describe('AdminDashboard', () => {
  beforeEach(() => {
    mockShowToast.mockReset()
    mockGetAdminStats.mockReset()
    mockGetAdminAnalyticsDashboard.mockReset()
  })

  it('renders normalized dashboard stats', async () => {
    mockGetAdminStats.mockResolvedValue({
      userStatistics: {
        totalUsers: 120,
        totalDoctors: 18,
        activeUsers: 77,
      },
      appointmentStatistics: {
        appointmentsToday: 14,
        totalAppointments: 950,
      },
      systemHealth: {
        pendingActionsCount: 5,
      },
    })
    mockGetAdminAnalyticsDashboard.mockResolvedValue({
      revenue: [{ thisYear: 25000000 }],
    })

    render(<AdminDashboard />)

    expect(await screen.findByText('120')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('14')).toBeInTheDocument()
    expect(screen.getByText('25.0M VND')).toBeInTheDocument()
    expect(screen.getByText('950')).toBeInTheDocument()
  })
})
