import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authApiMock } = vi.hoisted(() => ({
  authApiMock: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}))

vi.mock('../api/authApiWrapper', () => ({
  authApi: authApiMock,
}))

import { useAuthStore } from './authStore'

let storageState = {}

const storage = {
  getItem: (key) => storageState[key] ?? null,
  setItem: (key, value) => {
    storageState[key] = value
  },
  removeItem: (key) => {
    delete storageState[key]
  },
}

const resetStore = () => {
  useAuthStore.setState({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })
  storageState = {}
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.persist.setOptions({ storage })
    resetStore()
    vi.clearAllMocks()
  })

  it('maps backend login response into frontend auth state', async () => {
    authApiMock.login.mockResolvedValue({
      user: {
        userId: 42,
        email: 'patient@example.com',
        fullName: 'Patient Demo',
        role: 'PATIENT',
        phoneNumber: '0909000000',
        emailVerified: true,
        phoneVerified: false,
      },
      token: 'access-token',
      refreshToken: 'refresh-token',
    })

    const result = await useAuthStore.getState().login('patient@example.com', 'secret')
    const state = useAuthStore.getState()

    expect(authApiMock.login).toHaveBeenCalledWith({
      email: 'patient@example.com',
      password: 'secret',
    })
    expect(result.user).toEqual({
      id: 42,
      email: 'patient@example.com',
      name: 'Patient Demo',
      role: 'PATIENT',
      phone: '0909000000',
      phoneNumber: '0909000000',
      avatar: 'https://i.pravatar.cc/150?u=patient@example.com',
      emailVerified: true,
      phoneVerified: false,
    })
    expect(state.isAuthenticated).toBe(true)
    expect(state.token).toBe('access-token')
    expect(state.refreshToken).toBe('refresh-token')
    expect(state.error).toBeNull()
    expect(state.isLoading).toBe(false)
  })

  it('persists a readable error when login fails', async () => {
    authApiMock.login.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    })

    await expect(useAuthStore.getState().login('bad@example.com', 'wrong')).rejects.toThrow(
      'Invalid credentials'
    )

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toBe('Invalid credentials')
    expect(state.isLoading).toBe(false)
  })

  it('maps register response and updates authenticated state', async () => {
    authApiMock.register.mockResolvedValue({
      user: {
        userId: 7,
        email: 'doctor@example.com',
        fullName: 'Doctor Demo',
        role: 'DOCTOR',
        phone: '0988111222',
        avatar: 'https://example.com/avatar.png',
        emailVerified: true,
        phoneVerified: true,
      },
      token: 'doctor-token',
      refreshToken: 'doctor-refresh',
    })

    const payload = {
      fullName: 'Doctor Demo',
      email: 'doctor@example.com',
      password: 'secret',
    }

    const result = await useAuthStore.getState().register(payload)

    expect(authApiMock.register).toHaveBeenCalledWith(payload)
    expect(result.user).toMatchObject({
      id: 7,
      email: 'doctor@example.com',
      name: 'Doctor Demo',
      role: 'DOCTOR',
      avatar: 'https://example.com/avatar.png',
    })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('logout clears the authenticated state', async () => {
    useAuthStore.setState({
      user: { id: 1, email: 'patient@example.com' },
      token: 'token',
      refreshToken: 'refresh',
      isAuthenticated: true,
      isLoading: false,
      error: 'stale',
    })

    await useAuthStore.getState().logout()

    expect(authApiMock.logout).toHaveBeenCalled()
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  })

  it('updateUser merges partial data and clearError resets error state', () => {
    useAuthStore.setState({
      user: { id: 1, name: 'Old Name', email: 'old@example.com' },
      error: 'Something went wrong',
    })

    useAuthStore.getState().updateUser({ name: 'New Name', phone: '0123' })
    useAuthStore.getState().clearError()

    expect(useAuthStore.getState().user).toEqual({
      id: 1,
      name: 'New Name',
      email: 'old@example.com',
      phone: '0123',
    })
    expect(useAuthStore.getState().error).toBeNull()
  })
})
