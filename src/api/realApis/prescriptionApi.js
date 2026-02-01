import axios from 'axios'

/**
 * Prescription API - Real backend integration
 * Medical Service on port 8083
 */

// Create dedicated axios client for API Gateway (port 8080)
const medicalServiceClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
medicalServiceClient.interceptors.request.use(
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
medicalServiceClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            'http://localhost:8080/api/auth/refresh',
            null,
            { params: { refreshToken } }
          )

          const { token, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', token)
          localStorage.setItem('refreshToken', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${token}`
          return medicalServiceClient(originalRequest)
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

export const prescriptionApi = {
  /**
   * Get prescriptions by medical record ID
   * @param {string} recordId - Medical record ID
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Prescriptions for the medical record
   */
  getByMedicalRecordId: async (recordId, params = {}) => {
    const { page = 0, size = 20 } = params
    const response = await medicalServiceClient.get(
      `/api/prescriptions/medical-record/${recordId}`,
      { params: { page, size } }
    )
    return response.data.content || response.data
  },

  /**
   * Get single prescription by ID
   * @param {string} id - Prescription ID
   * @returns {Promise} Prescription details
   */
  getById: async (id) => {
    const response = await medicalServiceClient.get(`/api/prescriptions/${id}`)
    return response.data
  },

  /**
   * Add prescription to medical record
   * @param {string} recordId - Medical record ID
   * @param {Object} data - Prescription data
   * @returns {Promise} Created prescription
   */
  create: async (recordId, data) => {
    const response = await medicalServiceClient.post(
      `/api/prescriptions/medical-record/${recordId}`,
      data
    )
    return response.data
  },

  /**
   * Update prescription
   * @param {string} id - Prescription ID
   * @param {Object} data - Updated fields
   * @returns {Promise} Updated prescription
   */
  update: async (id, data) => {
    const response = await medicalServiceClient.put(`/api/prescriptions/${id}`, data)
    return response.data
  },

  /**
   * Delete prescription
   * @param {string} id - Prescription ID
   * @returns {Promise} Success message
   */
  delete: async (id) => {
    const response = await medicalServiceClient.delete(`/api/prescriptions/${id}`)
    return response.data
  },
}

export default prescriptionApi
