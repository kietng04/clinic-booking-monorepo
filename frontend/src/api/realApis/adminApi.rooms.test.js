import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPost = vi.hoisted(() => vi.fn())
const mockPut = vi.hoisted(() => vi.fn())
const mockGet = vi.hoisted(() => vi.fn())

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: mockPost,
      put: mockPut,
      get: mockGet,
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}))

import { adminApi } from './adminApi'

describe('adminApi room payload mapping', () => {
  beforeEach(() => {
    mockPost.mockReset()
    mockPut.mockReset()
    mockGet.mockReset()
  })

  it('maps frontend room type and clinicId to backend contract on create', async () => {
    mockPost.mockResolvedValue({ data: { id: 1 } })

    await adminApi.createRoom({
      name: 'Room A',
      clinicId: '7',
      type: 'Consultation',
      capacity: 3,
    })

    expect(mockPost).toHaveBeenCalledWith('/api/rooms', {
      name: 'Room A',
      clinicId: 7,
      type: 'CONSULTATION',
      capacity: 3,
    })
  })

  it('maps backend enum room type to frontend label on list', async () => {
    mockGet.mockResolvedValue({
      data: [
        { id: 1, name: 'R1', type: 'CONSULTATION', clinicId: 1 },
      ],
    })

    const rooms = await adminApi.getAllRooms()

    expect(rooms[0].type).toBe('Consultation')
  })
})
