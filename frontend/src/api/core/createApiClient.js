import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const clearAuthState = () => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('auth-storage')
}

const redirectToLogin = () => {
  if (typeof window === 'undefined') return
  window.location.href = '/login'
}

export const createApiClient = (options = {}) => {
  const { baseURL = API_BASE_URL } = options

  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  client.interceptors.request.use(
    (config) => {
      if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error?.config
      const status = error?.response?.status
      const isRefreshRequest = (originalRequest?.url || '').includes('/api/auth/refresh')

      if (status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
        originalRequest._retry = true

        try {
          const refreshToken =
            typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null

          if (refreshToken) {
            const response = await axios.post(
              `${baseURL}/api/auth/refresh`,
              null,
              { params: { refreshToken } }
            )

            const { token, refreshToken: newRefreshToken } = response.data || {}
            if (token && typeof localStorage !== 'undefined') {
              localStorage.setItem('accessToken', token)
            }
            if (newRefreshToken && typeof localStorage !== 'undefined') {
              localStorage.setItem('refreshToken', newRefreshToken)
            }

            originalRequest.headers = originalRequest.headers || {}
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return client(originalRequest)
          }
        } catch (refreshError) {
          clearAuthState()
          redirectToLogin()
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    }
  )

  return client
}

export default createApiClient
