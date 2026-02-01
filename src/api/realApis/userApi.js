import axios from 'axios'

/**
 * User API - Real backend integration
 * Routes through API Gateway (port 8080) for centralized request handling
 */

// Create dedicated axios client for API Gateway (port 8080)
const userServiceClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
userServiceClient.interceptors.request.use(
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
userServiceClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          // Refresh via gateway (auth endpoint works)
          const response = await axios.post(
            'http://localhost:8080/api/auth/refresh',
            null,
            { params: { refreshToken } }
          )

          const { token, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', token)
          localStorage.setItem('refreshToken', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${token}`
          return userServiceClient(originalRequest)
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

export const userApi = {
  /**
   * Create a new user
   * @param {Object} userData - User information
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password (min 8 characters)
   * @param {string} userData.fullName - Full name
   * @param {string} userData.phone - Phone number
   * @param {string} userData.dateOfBirth - Date of birth (optional)
   * @param {string} userData.gender - Gender (MALE | FEMALE | OTHER) (optional)
   * @param {string} userData.role - User role (PATIENT | DOCTOR | ADMIN)
   * @param {string} userData.avatarUrl - Avatar URL (optional)
   * @param {string} userData.specialization - Doctor specialization (required for DOCTOR role)
   * @param {string} userData.licenseNumber - Medical license number (required for DOCTOR role)
   * @param {string} userData.workplace - Workplace (optional for DOCTOR)
   * @param {number} userData.experienceYears - Years of experience (optional for DOCTOR)
   * @param {number} userData.consultationFee - Consultation fee (optional for DOCTOR)
   * @returns {Promise} Created user
   */
  createUser: async (userData) => {
    const response = await userServiceClient.post('/api/users', userData)
    return response.data
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise} User details
   */
  getUser: async (id) => {
    const response = await userServiceClient.get(`/api/users/${id}`)
    return response.data
  },

  /**
   * Get all users (paginated)
   * @param {Object} params - { page?, size?, sort? }
   * @returns {Promise} Paginated users
   */
  getUsers: async (params = {}) => {
    const { page = 0, size = 20, sort = 'createdAt,desc' } = params
    const response = await userServiceClient.get('/api/users', {
      params: { page, size, sort },
    })
    return response.data.content || response.data
  },

  /**
   * Get users by role
   * @param {string} role - User role (PATIENT | DOCTOR | ADMIN)
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Paginated users
   */
  getUsersByRole: async (role, params = {}) => {
    const { page = 0, size = 20 } = params
    const response = await userServiceClient.get(`/api/users/role/${role}`, {
      params: { page, size },
    })
    return response.data.content || response.data
  },

  /**
   * Get all doctors
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Array of doctors
   */
  getDoctors: async (params = {}) => {
    return userApi.getUsersByRole('DOCTOR', params)
  },

  /**
   * Update user profile
   * @param {string} id - User ID
   * @param {Object} data - Updated fields
   * @returns {Promise} Updated user
   */
  updateUser: async (id, data) => {
    const response = await userServiceClient.put(`/api/users/${id}`, data)
    return response.data
  },

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise} Success response
   */
  deleteUser: async (id) => {
    const response = await userServiceClient.delete(`/api/users/${id}`)
    return response.data
  },

  /**
   * Get current user profile
   * Uses the user ID from JWT token
   * @returns {Promise} Current user details
   */
  getCurrentUser: async () => {
    // Extract user ID from stored auth state
    const authStorage = localStorage.getItem('auth-storage')
    if (!authStorage) {
      throw new Error('Not authenticated')
    }

    const { state } = JSON.parse(authStorage)
    const userId = state?.user?.id

    if (!userId) {
      throw new Error('User ID not found')
    }

    return userApi.getUser(userId)
  },
}

export default userApi
