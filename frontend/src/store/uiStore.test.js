import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUIStore } from './uiStore'

const resetStore = () => {
  useUIStore.setState({
    theme: 'light',
    sidebarOpen: false,
    modalOpen: false,
    modalContent: null,
    toast: null,
  })
  document.documentElement.classList.remove('dark')
}

describe('useUIStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetStore()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('toggles theme and updates the document class list', () => {
    useUIStore.getState().toggleTheme()
    expect(useUIStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    useUIStore.getState().toggleTheme()
    expect(useUIStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('sets theme explicitly', () => {
    useUIStore.getState().setTheme('dark')
    expect(useUIStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    useUIStore.getState().setTheme('light')
    expect(useUIStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('opens and closes modal state', () => {
    useUIStore.getState().openModal({ title: 'Inspect appointment' })
    expect(useUIStore.getState()).toMatchObject({
      modalOpen: true,
      modalContent: { title: 'Inspect appointment' },
    })

    useUIStore.getState().closeModal()
    expect(useUIStore.getState()).toMatchObject({
      modalOpen: false,
      modalContent: null,
    })
  })

  it('toggles sidebar visibility', () => {
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)

    useUIStore.getState().setSidebarOpen(false)
    expect(useUIStore.getState().sidebarOpen).toBe(false)
  })

  it('shows toast for string payloads and auto-hides after timeout', () => {
    vi.spyOn(Date, 'now').mockReturnValue(123456)

    useUIStore.getState().showToast('Saved successfully', 'success')

    expect(useUIStore.getState().toast).toEqual({
      id: 123456,
      message: 'Saved successfully',
      type: 'success',
    })

    vi.advanceTimersByTime(5000)
    expect(useUIStore.getState().toast).toBeNull()
  })

  it('normalizes object toast payloads and supports manual hide', () => {
    useUIStore.getState().showToast({ message: 'Retrying API', type: 'warning' })

    expect(useUIStore.getState().toast).toMatchObject({
      message: 'Retrying API',
      type: 'warning',
    })

    useUIStore.getState().hideToast()
    expect(useUIStore.getState().toast).toBeNull()
  })
})
