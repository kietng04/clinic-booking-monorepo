import axios from 'axios'

/**
 * Family Members API - Real backend integration
 * Manages family member records for patients
 */

// API base URL - Gateway URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Create axios instance for family members service
const familyMemberServiceClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
familyMemberServiceClient.interceptors.request.use(
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
familyMemberServiceClient.interceptors.response.use(
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
          return familyMemberServiceClient(originalRequest)
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

export const familyMemberApi = {
  /**
   * Get family members for a user
   * @param {string} userId - User ID (primary account holder)
   * @returns {Promise} Array of family members
   */
  getMembers: async (userId) => {
    const response = await familyMemberServiceClient.get(`/api/family-members/user/${userId}`)
    return response.data.content || response.data
  },

  /**
   * Add a new family member
   * @param {Object} memberData - Family member information
   * @param {string} memberData.userId - Primary user ID
   * @param {string} memberData.name - Member name
   * @param {string} memberData.relationship - Relationship to primary user (SPOUSE | CHILD | PARENT | SIBLING | OTHER)
   * @param {string} memberData.dateOfBirth - Date of birth (YYYY-MM-DD)
   * @param {string} memberData.gender - Gender (MALE | FEMALE | OTHER)
   * @param {string} memberData.email - Email address (optional)
   * @param {string} memberData.phoneNumber - Phone number (optional)
   * @returns {Promise} Created family member
   */
  addMember: async (memberData) => {
    const response = await familyMemberServiceClient.post('/api/family-members', memberData)
    return response.data
  },

  /**
   * Update family member information
   * @param {string} id - Family member ID
   * @param {Object} updates - Fields to update
   * @returns {Promise} Updated family member
   */
  updateMember: async (id, updates) => {
    const response = await familyMemberServiceClient.put(`/api/family-members/${id}`, updates)
    return response.data
  },

  /**
   * Delete a family member
   * @param {string} id - Family member ID
   * @returns {Promise} Success response
   */
  deleteMember: async (id) => {
    const response = await familyMemberServiceClient.delete(`/api/family-members/${id}`)
    return response.data
  },
}

export default familyMemberApi
