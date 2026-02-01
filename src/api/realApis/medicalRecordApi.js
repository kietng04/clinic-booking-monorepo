import axios from 'axios'

/**
 * Medical Record API - Real backend integration
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

export const medicalRecordApi = {
  /**
   * Get medical records by patient ID
   * @param {string} patientId - Patient ID
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Paginated medical records
   */
  getByPatientId: async (patientId, params = {}) => {
    const { page = 0, size = 20 } = params
    const response = await medicalServiceClient.get(
      `/api/medical-records/patient/${patientId}`,
      { params: { page, size } }
    )
    return response.data.content || response.data
  },

  /**
   * Get medical records by doctor ID
   * @param {string} doctorId - Doctor ID
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Paginated medical records
   */
  getByDoctorId: async (doctorId, params = {}) => {
    const { page = 0, size = 20 } = params
    const response = await medicalServiceClient.get(
      `/api/medical-records/doctor/${doctorId}`,
      { params: { page, size } }
    )
    return response.data.content || response.data
  },

  /**
   * Get single medical record by ID
   * @param {string} id - Medical record ID
   * @returns {Promise} Medical record details
   */
  getById: async (id) => {
    const response = await medicalServiceClient.get(`/api/medical-records/${id}`)
    return response.data
  },

  /**
   * Create new medical record (Doctor only)
   * @param {Object} data - Medical record data
   * @returns {Promise} Created medical record
   */
  create: async (data) => {
    const response = await medicalServiceClient.post('/api/medical-records', data)
    return response.data
  },

  /**
   * Update medical record
   * @param {string} id - Medical record ID
   * @param {Object} data - Updated fields
   * @returns {Promise} Updated medical record
   */
  update: async (id, data) => {
    const response = await medicalServiceClient.put(`/api/medical-records/${id}`, data)
    return response.data
  },

  /**
   * Delete medical record
   * @param {string} id - Medical record ID
   * @returns {Promise} Success message
   */
  delete: async (id) => {
    const response = await medicalServiceClient.delete(`/api/medical-records/${id}`)
    return response.data
  },
}

export default medicalRecordApi
