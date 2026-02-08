import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPost = vi.hoisted(() => vi.fn())
const mockGet = vi.hoisted(() => vi.fn())

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: mockPost,
      get: mockGet,
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}))

import { paymentApi, normalizePaymentMethod } from './paymentApi'

describe('paymentApi', () => {
  beforeEach(() => {
    mockPost.mockReset()
    mockGet.mockReset()
  })

  it('maps frontend method values to backend enums', () => {
    expect(normalizePaymentMethod('momo')).toBe('MOMO_WALLET')
    expect(normalizePaymentMethod('cash')).toBe('CASH')
    expect(normalizePaymentMethod('MOMO_WALLET')).toBe('MOMO_WALLET')
  })

  it('posts to create payment endpoint with mapped method', async () => {
    mockPost.mockResolvedValue({ data: { ok: true } })

    await paymentApi.createPayment({ appointmentId: 1, amount: 100000, method: 'momo' })

    expect(mockPost).toHaveBeenCalledWith('/api/payments', {
      appointmentId: 1,
      amount: 100000,
      paymentMethod: 'MOMO_WALLET',
    })
  })

  it('fetches payment history from my-payments endpoint', async () => {
    mockGet.mockResolvedValue({ data: { content: [] } })

    await paymentApi.getPaymentHistory('123', { page: 1, size: 10 })

    expect(mockGet).toHaveBeenCalledWith('/api/payments/my-payments', {
      params: { page: 1, size: 10 },
    })
  })

  it('exports payment history from my-payments export endpoint', async () => {
    mockGet.mockResolvedValue({ data: new Blob(['csv']) })

    await paymentApi.exportHistory('123', { from: '2024-01-01', to: '2024-01-31' })

    expect(mockGet).toHaveBeenCalledWith('/api/payments/my-payments/export', {
      params: { from: '2024-01-01', to: '2024-01-31' },
      responseType: 'blob',
    })
  })
})
