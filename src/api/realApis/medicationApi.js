import axios from 'axios'

/**
 * Medication API - Real backend integration
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
    console.log('[medicationApi] Token check:', { hasToken: !!token, url: config.url })
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[medicationApi] Authorization header added')
    } else {
      console.warn('[medicationApi] No token found in localStorage')
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
          return axios(originalRequest)
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

export const medicationApi = {
  /**
   * Get all active medications (for dropdown selection)
   * @returns {Promise} List of active medications
   */
  getActiveMedications: async () => {
    const response = await medicalServiceClient.get('/api/medications/active')
    return response.data
  },

  /**
   * Get medications with filters and pagination
   * @param {Object} params - { search?, category?, isActive?, page?, size? }
   * @returns {Promise} Paginated medications
   */
  getMedications: async (params = {}) => {
    const { page = 0, size = 20, ...filters } = params
    const response = await medicalServiceClient.get('/api/medications', {
      params: { page, size, ...filters },
    })
    return response.data.content || response.data
  },

  /**
   * Search medications by name or generic name
   * @param {string} query - Search query
   * @returns {Promise} List of matching medications
   */
  searchMedications: async (query) => {
    const response = await medicalServiceClient.get('/api/medications/search', {
      params: { q: query },
    })
    return response.data
  },

  /**
   * Get medications by category
   * @param {string} category - Medication category
   * @returns {Promise} List of medications in category
   */
  getByCategory: async (category) => {
    const response = await medicalServiceClient.get(`/api/medications/category/${category}`)
    return response.data
  },

  /**
   * Get all medication categories
   * @returns {Promise} List of unique categories
   */
  getCategories: async () => {
    const response = await medicalServiceClient.get('/api/medications/categories')
    return response.data
  },

  /**
   * Get single medication by ID
   * @param {string} id - Medication ID
   * @returns {Promise} Medication details
   */
  getById: async (id) => {
    const response = await medicalServiceClient.get(`/api/medications/${id}`)
    return response.data
  },

  /**
   * Create new medication (Admin only)
   * @param {Object} data - Medication data
   * @returns {Promise} Created medication
   */
  create: async (data) => {
    const response = await medicalServiceClient.post('/api/medications', data)
    return response.data
  },

  /**
   * Update medication (Admin only)
   * @param {string} id - Medication ID
   * @param {Object} data - Updated fields
   * @returns {Promise} Updated medication
   */
  update: async (id, data) => {
    const response = await medicalServiceClient.put(`/api/medications/${id}`, data)
    return response.data
  },

  /**
   * Delete medication - soft delete (Admin only)
   * @param {string} id - Medication ID
   * @returns {Promise} Success message
   */
  delete: async (id) => {
    const response = await medicalServiceClient.delete(`/api/medications/${id}`)
    return response.data
  },
}

export default medicationApi
