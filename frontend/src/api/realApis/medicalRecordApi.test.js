import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGet = vi.hoisted(() => vi.fn())

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}))

import { medicalRecordApi } from './medicalRecordApi'

describe('medicalRecordApi compatibility', () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  it('supports getRecords alias for patient dashboards', async () => {
    mockGet.mockResolvedValue({ data: { content: [] } })

    await medicalRecordApi.getRecords('123')

    expect(mockGet).toHaveBeenCalledWith('/api/medical-records/patient/123', {
      params: { page: 0, size: 20 },
    })
  })
})
