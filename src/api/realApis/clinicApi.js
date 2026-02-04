import axios from 'axios'

/**
 * Clinic API - Real backend integration
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const clinicServiceClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
clinicServiceClient.interceptors.request.use(
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
clinicServiceClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            null,
            { params: { refreshToken } }
          )

          const { token, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', token)
          localStorage.setItem('refreshToken', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${token}`
          return clinicServiceClient(originalRequest)
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

export const clinicApi = {
  /**
   * Get all clinics with optional filters
   * @param {Object} filters - { active?, search? }
   * @returns {Promise} List of clinics
   */
  getClinics: async (filters = {}) => {
    const response = await clinicServiceClient.get('/api/clinics', { params: filters })
    return response.data
  },

  /**
   * Get clinic by ID
   * @param {string} id - Clinic ID
   * @returns {Promise} Clinic details
   */
  getClinicById: async (id) => {
    const response = await clinicServiceClient.get(`/api/clinics/${id}`)
    return response.data
  },

  /**
   * Get services offered by a clinic
   * @param {string} clinicId - Clinic ID
   * @param {Object} filters - { category?, active? }
   * @returns {Promise} List of services
   */
  getClinicServices: async (clinicId, filters = {}) => {
    // Backend endpoint is /api/services/clinic/{clinicId}
    const response = await clinicServiceClient.get(`/api/services/clinic/${clinicId}`, {
      params: filters,
    })
    return response.data
  },

  /**
   * Get rooms in a clinic
   * @param {string} clinicId - Clinic ID
   * @returns {Promise} List of rooms
   */
  getClinicRooms: async (clinicId) => {
    // Backend endpoint is /api/rooms/clinic/{clinicId}
    const response = await clinicServiceClient.get(`/api/rooms/clinic/${clinicId}`)
    return response.data
  },
}

export default clinicApi
