import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGet = vi.hoisted(() => vi.fn())
const mockAppointmentSearch = vi.hoisted(() => vi.fn())

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
    post: vi.fn(),
  },
}))

vi.mock('./appointmentApi', () => ({
  appointmentApi: {
    getAppointments: mockAppointmentSearch,
  },
}))

import { scheduleApi } from './scheduleApi'

describe('scheduleApi.getAvailableSlots', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockAppointmentSearch.mockReset()
  })

  it('builds slots when schedule endpoint returns array payload', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          doctorId: 27,
          dayOfWeek: 1,
          startTime: '08:00:00',
          endTime: '09:00:00',
          isAvailable: true,
        },
      ],
    })
    mockAppointmentSearch.mockResolvedValueOnce([])

    const slots = await scheduleApi.getAvailableSlots(27, '2026-02-09')

    expect(mockGet).toHaveBeenCalledWith('/api/schedules/doctor/27/day/1')
    expect(slots.map((slot) => slot.time)).toEqual(['08:00', '08:30'])
    expect(slots.every((slot) => slot.available)).toBe(true)
  })

  it('marks booked slot unavailable when appointment time includes seconds', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          doctorId: 27,
          dayOfWeek: 1,
          startTime: '08:00:00',
          endTime: '09:00:00',
          isAvailable: true,
        },
      ],
    })
    mockAppointmentSearch.mockResolvedValueOnce([
      {
        id: 99,
        status: 'CONFIRMED',
        appointmentTime: '08:30:00',
      },
    ])

    const slots = await scheduleApi.getAvailableSlots(27, '2026-02-09')

    const slot0830 = slots.find((slot) => slot.time === '08:30')
    expect(slot0830).toBeTruthy()
    expect(slot0830.available).toBe(false)
  })
})
