import axios from 'axios'

/**
 * Statistics API - Real backend integration
 * Provides patient, doctor, and admin statistics endpoints
 */

// API base URL - Gateway URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Create axios instance for statistics service
const statsServiceClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
statsServiceClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Auto token refresh on 401
statsServiceClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          // Refresh via gateway
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            null,
            { params: { refreshToken } }
          )

          const { token, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', token)
          localStorage.setItem('refreshToken', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${token}`
          return statsServiceClient(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const statsApi = {
  /**
   * Get patient statistics
   * @param {string} patientId - Patient ID
   * @returns {Promise} Patient statistics data
   */
  getPatientStats: async (patientId) => {
    const response = await statsServiceClient.get(`/api/statistics/aggregate/patient/${patientId}`)
    return response.data
  },

  /**
   * Get doctor statistics
   * @param {string} doctorId - Doctor ID
   * @returns {Promise} Doctor statistics data
   */
  getDoctorStats: async (doctorId) => {
    const response = await statsServiceClient.get(`/api/statistics/aggregate/doctor/${doctorId}`)
    return response.data
  },

  /**
   * Get admin statistics (dashboard overview)
   * @returns {Promise} Admin statistics and dashboard data
   */
  getAdminStats: async () => {
    const response = await statsServiceClient.get('/api/statistics/aggregate/dashboard')
    return response.data
  },

  /**
   * Get admin analytics dashboard with time-series data
   * @returns {Promise} Admin analytics dashboard with 12-month trends, top doctors, recent activities
   */
  getAdminAnalyticsDashboard: async () => {
    const response = await statsServiceClient.get('/api/statistics/analytics/admin/dashboard')
    return response.data
  },

  /**
   * Get doctor analytics dashboard with time-series data
   * @param {string} doctorId - Doctor ID
   * @returns {Promise} Doctor analytics dashboard with 6-month trends, appointment types, time slots
   */
  getDoctorAnalyticsDashboard: async (doctorId) => {
    const response = await statsServiceClient.get(`/api/statistics/analytics/doctor/${doctorId}/dashboard`)
    return response.data
  },
}

export default statsApi
