import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { DashboardLayout } from './DashboardLayout'

vi.mock('./Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}))

vi.mock('./Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}))

vi.mock('../chatbot/ChatbotWidget', () => ({
  ChatbotWidget: () => null,
}))

vi.mock('../ui/Toast', () => ({
  ToastContainer: () => null,
}))

vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    toast: null,
    hideToast: vi.fn(),
  }),
}))

describe('DashboardLayout', () => {
  it('uses a neutral application shell instead of the old wellness palette shell', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Page content</div>
      </DashboardLayout>
    )

    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(container.firstChild.className).toContain('bg-cream-100')
    expect(container.firstChild.className).not.toContain('bg-slate-50')
  })
})
