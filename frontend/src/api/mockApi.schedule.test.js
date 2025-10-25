import { describe, it, expect } from 'vitest'
import { scheduleApi } from './mockApi'

describe('mock scheduleApi', () => {
  it('exposes getAvailableSlots and returns slot objects', async () => {
    expect(typeof scheduleApi.getAvailableSlots).toBe('function')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]

    const slots = await scheduleApi.getAvailableSlots('1', dateStr)

    expect(Array.isArray(slots)).toBe(true)
    expect(slots.length).toBeGreaterThan(0)
    expect(slots[0]).toEqual(
      expect.objectContaining({
        time: expect.any(String),
        available: expect.any(Boolean),
      })
    )
  })
})
