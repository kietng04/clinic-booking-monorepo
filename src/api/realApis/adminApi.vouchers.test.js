import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPost = vi.hoisted(() => vi.fn())
const mockPut = vi.hoisted(() => vi.fn())

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: mockPost,
      put: mockPut,
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}))

import { adminApi } from './adminApi'

describe('adminApi voucher datetime mapping', () => {
  beforeEach(() => {
    mockPost.mockReset()
    mockPut.mockReset()
  })

  it('converts date-only values to local datetime on create', async () => {
    mockPost.mockResolvedValue({ data: { id: 1 } })

    await adminApi.createVoucher({
      code: 'PROMO10',
      value: 10,
      validFrom: '2026-02-08',
      validTo: '2026-02-09',
    })

    expect(mockPost).toHaveBeenCalledWith('/api/vouchers', expect.objectContaining({
      validFrom: '2026-02-08T00:00:00',
      validTo: '2026-02-09T23:59:59',
    }))
  })

  it('converts date-only values to local datetime on update', async () => {
    mockPut.mockResolvedValue({ data: { id: 1 } })

    await adminApi.updateVoucher(1, {
      value: 10,
      validFrom: '2026-03-01',
      validTo: '2026-03-15',
    })

    expect(mockPut).toHaveBeenCalledWith('/api/vouchers/1', expect.objectContaining({
      validFrom: '2026-03-01T00:00:00',
      validTo: '2026-03-15T23:59:59',
    }))
  })
})
