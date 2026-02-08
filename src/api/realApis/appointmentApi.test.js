import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPost = vi.hoisted(() => vi.fn())

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: mockPost,
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    post: vi.fn(),
  },
}))

import { appointmentApi } from './appointmentApi'

describe('appointmentApi create payload', () => {
  beforeEach(() => {
    mockPost.mockReset()
  })

  it('sends clinic/service/room fields when creating appointment', async () => {
    mockPost.mockResolvedValue({ data: { id: 1 } })

    await appointmentApi.createAppointment({
      patientId: 10,
      doctorId: 20,
      date: '2026-02-12',
      time: '09:00',
      clinicId: 1,
      serviceId: 2,
      roomId: 3,
      reason: 'Checkup',
    })

    expect(mockPost).toHaveBeenCalledWith('/api/appointments', expect.objectContaining({
      clinicId: 1,
      serviceId: 2,
      roomId: 3,
    }))
  })
})
