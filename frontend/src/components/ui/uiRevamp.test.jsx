import { describe, expect, it } from 'vitest'
import { render, screen } from '@/test/utils'
import { Button } from './Button'
import { Card, CardTitle } from './Card'
import { Input } from './Input'
import { Badge } from './Badge'

describe('Clinical SaaS UI primitives', () => {
  it('renders primary actions with a restrained clinical style', () => {
    render(<Button>Tiếp tục</Button>)

    const button = screen.getByRole('button', { name: 'Tiếp tục' })
    expect(button.className).toContain('rounded-xl')
    expect(button.className).toContain('bg-brand-600')
    expect(button.className).toContain('shadow-soft')
    expect(button.className).not.toContain('rounded-soft')
  })

  it('renders surfaces and inputs with neutral product tokens', () => {
    render(
      <div>
        <Card>
          <CardTitle>Tổng quan</CardTitle>
        </Card>
        <Input label="Email" placeholder="name@example.com" />
      </div>
    )

    const heading = screen.getByRole('heading', { name: 'Tổng quan' })
    const input = screen.getByLabelText('Email')

    expect(heading.className).toContain('font-semibold')
    expect(heading.className).not.toContain('font-display')
    expect(input.className).toContain('rounded-xl')
    expect(input.className).toContain('border-sage-200')
    expect(input.className).not.toContain('rounded-soft')
  })

  it('renders badges as compact status labels instead of decorative pills', () => {
    render(<Badge variant="success">Đã xác nhận</Badge>)

    const badge = screen.getByText('Đã xác nhận')
    expect(badge.className).toContain('rounded-md')
    expect(badge.className).toContain('bg-emerald-50')
    expect(badge.className).not.toContain('rounded-full')
  })
})
