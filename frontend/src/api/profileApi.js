import apiClient from './authApi'

export const profileApi = {
  getProfile: async () => {
    const response = await apiClient.get('/api/profile')
    return response.data
  },

  getNotifications: async () => {
    const response = await apiClient.get('/api/profile/notifications')
    return response.data
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/api/profile', data)
    return response.data
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.put('/api/profile/password', {
      currentPassword,
      newPassword,
    })
    return response.data
  },

  uploadAvatar: async (avatarUrl) => {
    const response = await apiClient.post('/api/profile/avatar', { avatarUrl })
    return response.data
  },

  uploadAvatarFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/api/profile/avatar/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  updateNotifications: async (preferences) => {
    const response = await apiClient.put('/api/profile/notifications', preferences)
    return response.data
  },
}

export default profileApi
