import { createApiClient } from '../core/createApiClient'

/**
 * Notifications API - Real backend integration
 * Manages user notifications and alerts
 */

const notificationServiceClient = createApiClient()

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
