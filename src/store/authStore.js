import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api/authApiWrapper'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { user, token, refreshToken } = await authApi.login({ email, password })

          // Map backend response to frontend user object
          const mappedUser = {
            id: user.userId,
            email: user.email,
            name: user.fullName,
            role: user.role,
            avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
          }

          set({
            user: mappedUser,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
          return { user: mappedUser, token, refreshToken }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const { user, token, refreshToken } = await authApi.register(userData)

          // Map backend response to frontend user object
          const mappedUser = {
            id: user.userId,
            email: user.email,
            name: user.fullName,
            role: user.role,
            avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
          }

          set({
            user: mappedUser,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
          return { user: mappedUser, token, refreshToken }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          authApi.logout()
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
