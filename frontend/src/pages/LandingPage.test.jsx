import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@/test/utils'
import { LandingPage } from './LandingPage'

describe('LandingPage report design', () => {
  beforeAll(() => {
    vi.stubGlobal('IntersectionObserver', vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })))
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  const renderLanding = () => render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  )

  it('matches the report hero content and CTAs', () => {
    renderLanding()

    expect(screen.getByText(/được tin dùng bởi 50,000\+ bệnh nhân/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /hệ thống đặt lịch\s*khám bệnh/i })).toBeInTheDocument()
    expect(screen.getByText(/kết nối bệnh nhân với bác sĩ/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /bắt đầu đặt lịch/i })).toHaveAttribute('href', '/register')
    expect(screen.getByRole('link', { name: /đăng nhập/i })).toHaveAttribute('href', '/login')
  })

  it('keeps the report visual anchors in the hero fold', () => {
    renderLanding()

    expect(screen.getByRole('img', { name: /bác sĩ việt nam/i })).toBeInTheDocument()
    expect(screen.getByText(/lịch hẹn đã xác nhận/i)).toBeInTheDocument()
    expect(screen.getByText(/bs\. nguyễn minh anh/i)).toBeInTheDocument()
    expect(screen.getByText(/chuyên khoa nội tổng quát/i)).toBeInTheDocument()
  })

  it('shows the original trust indicators', () => {
    renderLanding()

    expect(screen.getByText('200+')).toBeInTheDocument()
    expect(screen.getByText('Bác sĩ chuyên khoa')).toBeInTheDocument()
    expect(screen.getByText('98%')).toBeInTheDocument()
    expect(screen.getByText(/tỷ lệ hài lòng/i)).toBeInTheDocument()
    expect(screen.getByText(/đánh giá 4\.9\/5/i)).toBeInTheDocument()
  })

  it('keeps the report feature and testimonial sections', () => {
    renderLanding()

    expect(screen.getByRole('heading', { name: /mọi công cụ cần thiết cho việc chăm sóc sức khỏe/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /được bệnh nhân và bác sĩ tin tưởng/i })).toBeInTheDocument()
    expect(screen.getByText(/đặt lịch dễ dàng/i)).toBeInTheDocument()
    expect(screen.getByText(/bảo mật dữ liệu/i)).toBeInTheDocument()
    expect(screen.getByText(/theo dõi sức khỏe/i)).toBeInTheDocument()
    expect(screen.getByText(/nguyễn thị lan/i)).toBeInTheDocument()
    expect(screen.getByText(/bs\. trần minh quân/i)).toBeInTheDocument()
  })

  it('retains the report final CTA and footer', () => {
    renderLanding()

    expect(screen.getByRole('heading', { name: /sẵn sàng chủ động chăm sóc sức khỏe/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /bắt đầu miễn phí/i })).toHaveAttribute('href', '/register')
    expect(screen.getByText(/nền tảng đặt lịch khám bệnh trực tuyến dành cho bệnh nhân và bác sĩ/i)).toBeInTheDocument()
    expect(screen.getByText(/© 2025 lịch khám\. đã đăng ký bản quyền\./i)).toBeInTheDocument()
  })
})
