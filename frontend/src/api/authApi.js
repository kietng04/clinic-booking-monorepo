import axios from 'axios'
import { clearStoredAuth, setStoredTokens } from './core/authStorage'

// API base URL - Gateway URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            { refreshToken }
          )

          const { token, refreshToken: newRefreshToken } = response.data

          // Save new tokens
          setStoredTokens(token, newRefreshToken)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearStoredAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Response with user data and tokens
   */
  login: async (credentials) => {
    const response = await apiClient.post('/api/auth/login', credentials)
    const { token, refreshToken, ...userData } = response.data

    // Save tokens to localStorage
    setStoredTokens(token, refreshToken)

    return {
      user: userData,
      token,
      refreshToken,
    }
  },

  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @returns {Promise} Response with user data and tokens
   */
  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData)
    const { token, refreshToken, ...user } = response.data

    // Save tokens to localStorage
    setStoredTokens(token, refreshToken)

    return {
      user,
      token,
      refreshToken,
    }
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} Response with new tokens
   */
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/api/auth/refresh', { refreshToken })

    const { token, refreshToken: newRefreshToken } = response.data

    // Save new tokens
    setStoredTokens(token, newRefreshToken)

    return {
      token,
      refreshToken: newRefreshToken,
    }
  },

  /**
   * Logout user (client-side only, backend is stateless)
   */
  logout: () => {
    clearStoredAuth()
  },
  forgotPassword: async (email) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email })
    return response.data
  },

  validateResetToken: async (token) => {
    const response = await apiClient.get('/api/auth/validate-reset-token', { params: { token } })
    return response.data
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/api/auth/reset-password', { token, newPassword })
    return response.data
  },

  verifyEmail: async (token) => {
    const response = await apiClient.get('/api/auth/verify-email', { params: { token } })
    return response.data
  },

  sendEmailVerification: async () => {
    const response = await apiClient.post('/api/auth/send-email-verification')
    return response.data
  },

  sendSmsVerification: async (phone) => {
    const response = await apiClient.post('/api/auth/send-sms-verification', { phone })
    return response.data
  },

  verifySms: async (code) => {
    const response = await apiClient.post('/api/auth/verify-sms', { code })
    return response.data
  },
}

export default apiClient
