import axios from 'axios'

/**
 * Notifications API - Real backend integration
 * Manages user notifications and alerts
 */

// API base URL - Gateway URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Create axios instance for notifications service
const notificationServiceClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
notificationServiceClient.interceptors.request.use(
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
notificationServiceClient.interceptors.response.use(
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
          return notificationServiceClient(originalRequest)
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

export const notificationApi = {
  /**
   * Get user notifications
   * @param {string} userId - User ID
   * @param {Object} params - Filter options { page?, size?, unreadOnly?, type? }
   * @returns {Promise} Paginated notifications or array
   */
  getNotifications: async (userId, params = {}) => {
    const { page = 0, size = 20, unreadOnly, ...filters } = params

    // Use dedicated endpoint if unreadOnly is requested
    if (unreadOnly) {
      const response = await notificationServiceClient.get(
        `/api/notifications/user/${userId}/status/false`,
        {
          params: { page, size, ...filters },
        }
      )
      return response.data.content || response.data
    }

    const response = await notificationServiceClient.get(`/api/notifications/user/${userId}`, {
      params: { page, size, ...filters },
    })
    return response.data.content || response.data
  },

  /**
   * Get count of unread notifications
   * @param {string} userId - User ID
   * @returns {Promise<number>} Count of unread notifications
   */
  getUnreadCount: async (userId) => {
    const response = await notificationServiceClient.get(
      `/api/notifications/user/${userId}/unread/count`
    )
    return response.data.unreadCount || 0
  },

  /**
   * Mark a single notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Updated notification
   */
  markAsRead: async (notificationId) => {
    const response = await notificationServiceClient.put(
      `/api/notifications/${notificationId}/read`
    )
    return response.data
  },

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise} Success response with count of updated notifications
   */
  markAllAsRead: async (userId) => {
    const response = await notificationServiceClient.put(
      `/api/notifications/user/${userId}/read-all`
    )
    return response.data
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Success response
   */
  deleteNotification: async (notificationId) => {
    const response = await notificationServiceClient.delete(`/api/notifications/${notificationId}`)
    return response.data
  },
}

export default notificationApi
