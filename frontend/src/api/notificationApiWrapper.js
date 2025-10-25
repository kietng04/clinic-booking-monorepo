import { notificationApi as realNotificationApi } from './realApis/notificationApi'
import { notificationApi as mockNotificationApi } from './mockApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

const api = USE_MOCK_BACKEND ? mockNotificationApi : realNotificationApi

export const notificationApi = USE_MOCK_BACKEND
  ? {
    getNotifications: (userId, params = {}) => api.getNotifications(userId, params),
    getUnreadCount: (userId) => api.getUnreadCount?.(userId) || Promise.resolve(0),
    markAsRead: (notificationId) => api.markAsRead(notificationId),
    markAllAsRead: (userId) => api.markAllAsRead(userId),
    deleteNotification: (notificationId) => api.deleteNotification(notificationId),
  }
  : {
    getNotifications: (userId, params = {}) => api.getNotifications(userId, params),
    getUnreadCount: (userId) => api.getUnreadCount(userId),
    markAsRead: (notificationId) => api.markAsRead(notificationId),
    markAllAsRead: (userId) => api.markAllAsRead(userId),
    deleteNotification: (notificationId) => api.deleteNotification(notificationId),
  }

console.log(
  `🔔 Notification Backend: ${USE_MOCK_BACKEND ? 'MOCK (Demo Mode)' : 'REAL (Production)'}`
)

export default notificationApi
