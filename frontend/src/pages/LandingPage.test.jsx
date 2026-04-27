import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, within } from '@/test/utils'
import { LandingPage } from './LandingPage'

describe('LandingPage content depth', () => {
  it('includes market-standard conversion sections beyond the hero', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /chuyên khoa nổi bật/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /bác sĩ được bệnh nhân tin tưởng/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /giải đáp nhanh trước khi đặt lịch/i })).toBeInTheDocument()
  })

  it('supports booking intent flows like healthcare marketplaces', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /đặt khám theo nhu cầu/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /bệnh viện và phòng khám nổi bật/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /đặt khám theo nhu cầu/i })).toHaveTextContent(/đặt khám theo nhu cầu/i)
    expect(screen.getByText(/^đặt khám bác sĩ$/i)).toBeInTheDocument()
    expect(screen.getByText(/^đặt khám bệnh viện$/i)).toBeInTheDocument()
    expect(screen.getByText(/^đặt khám phòng khám$/i)).toBeInTheDocument()
  })

  it('includes real visual anchors for hero, doctors, and facilities', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('img', { name: /trần quang nam/i })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /bệnh viện chợ rẫy/i }).length).toBeGreaterThan(0)
  })

  it('surfaces healthcare trust and compliance messaging', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/nhắc lịch tự động/i)).toBeInTheDocument()
    expect(screen.getByText(/hồ sơ bệnh án tập trung/i)).toBeInTheDocument()
    expect(screen.getByText(/bảo mật dữ liệu/i)).toBeInTheDocument()
  })

  it('repeats a strong conversion CTA near the end of the page', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /sẵn sàng đặt lịch lần khám tiếp theo/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /xem bác sĩ và khung giờ/i })).toBeInTheDocument()
  })

  it('uses distinct color treatments in the hero fold instead of a single neutral tone', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('hero-stat-card-1').className).toContain('from-sky-200')
    expect(screen.getByTestId('hero-stat-card-2').className).toContain('from-brand-200')
    expect(screen.getByTestId('hero-stat-card-3').className).toContain('from-sky-100')
    expect(screen.getByTestId('hero-booking-panel').className).toContain('bg-brand-700')
  })

  it('shows a Vietnamese booking preview inside the hero panel', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    const panel = screen.getByTestId('hero-booking-panel')
    expect(within(panel).getByRole('img', { name: /bệnh viện chợ rẫy/i })).toBeInTheDocument()
    expect(within(panel).getByText(/xem phiếu khám/i)).toBeInTheDocument()
  })
})
