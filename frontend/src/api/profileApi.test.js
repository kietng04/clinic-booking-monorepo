import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGet = vi.hoisted(() => vi.fn())
const mockPut = vi.hoisted(() => vi.fn())
const mockPost = vi.hoisted(() => vi.fn())

vi.mock('./authApi', () => ({
  default: {
    get: mockGet,
    put: mockPut,
    post: mockPost,
  },
}))

import { profileApi } from './profileApi'

describe('profileApi', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPut.mockReset()
    mockPost.mockReset()
  })

  it('loads notification settings from backend profile endpoint', async () => {
    mockGet.mockResolvedValue({
      data: { emailReminders: false, reminderTiming: '2_HOURS' },
    })

    const result = await profileApi.getNotifications()

    expect(mockGet).toHaveBeenCalledWith('/api/profile/notifications')
    expect(result).toEqual({
      emailReminders: false,
      reminderTiming: '2_HOURS',
    })
  })

  it('updates notification settings through backend profile endpoint', async () => {
    const payload = {
      emailReminders: false,
      smsUrgent: true,
      reminderTiming: '1_HOUR',
    }

    mockPut.mockResolvedValue({
      data: payload,
    })

    const result = await profileApi.updateNotifications(payload)

    expect(mockPut).toHaveBeenCalledWith('/api/profile/notifications', payload)
    expect(result).toEqual(payload)
  })

  it('uploads avatar file as multipart/form-data', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    mockPost.mockResolvedValue({
      data: { avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/a.png' },
    })

    await profileApi.uploadAvatarFile(file)

    expect(mockPost).toHaveBeenCalledWith(
      '/api/profile/avatar/upload',
      expect.any(FormData),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'multipart/form-data',
        }),
      })
    )
  })
})
