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

  /**
   * Get patients for a specific doctor
   * Fetches appointments for the doctor and extracts unique patients
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} Array of patient objects
   */
  getDoctorPatients: async (doctorId) => {
    // Get all completed and confirmed appointments for this doctor
    const response = await userServiceClient.get(`/api/appointments/doctor/${doctorId}`, {
      params: { page: 0, size: 1000 }
    })

    const appointments = response.data.content || response.data || []

    // Extract unique patients from appointments
    const patientMap = new Map()
    appointments.forEach(apt => {
      if (apt.patientId && !patientMap.has(apt.patientId)) {
        patientMap.set(apt.patientId, {
          id: apt.patientId,
          name: apt.patientName || `Bệnh nhân #${apt.patientId}`,
          phone: apt.patientPhone || null,
          email: apt.patientEmail || null,
          avatar: apt.patientAvatar || null,
          lastVisit: apt.appointmentDate,
          appointmentCount: 1
        })
      } else if (apt.patientId) {
        const existing = patientMap.get(apt.patientId)
        existing.appointmentCount++
        // Update lastVisit if this appointment is more recent
        if (apt.appointmentDate > existing.lastVisit) {
          existing.lastVisit = apt.appointmentDate
        }
      }
    })

    // Fetch additional user details (age, etc.) for each patient
    const patients = Array.from(patientMap.values())
    const enhancedPatients = await Promise.all(
      patients.map(async (patient) => {
        try {
          const userDetails = await userServiceClient.get(`/api/users/${patient.id}`)
          const userData = userDetails.data

          // Calculate age from dateOfBirth
          let age = null
          if (userData.dateOfBirth) {
            const birthDate = new Date(userData.dateOfBirth)
            const today = new Date()
            age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--
            }
          }

          return {
            ...patient,
            name: userData.fullName || patient.name,
            phone: userData.phone || patient.phone,
            email: userData.email || patient.email,
            avatar: userData.avatarUrl || patient.avatar,
            age: age,
            gender: userData.gender,
            dateOfBirth: userData.dateOfBirth
          }
        } catch (error) {
          console.warn(`Could not fetch details for patient ${patient.id}`)
          return patient
        }
      })
    )

    return enhancedPatients
  },
}

export default userApi
