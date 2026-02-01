import { userApi as realUserApi } from './realApis/userApi'
import { userApi as mockUserApi } from './mockApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

const api = USE_MOCK_BACKEND ? mockUserApi : realUserApi

export const userApi = USE_MOCK_BACKEND
  ? {
      createUser: (data) => api.createUser(data),
      getUser: (id) => api.getUser(id),
      getUsers: (params = {}) => api.getAllUsers(params),
      getUsersByRole: (role) => api.getAllUsers({ role }),
      getDoctors: (params = {}) => api.getDoctors(params),
      updateUser: (id, data) => api.updateUser(id, data),
      deleteUser: (id) => api.deleteUser(id),
      getCurrentUser: async () => {
        const authStorage = localStorage.getItem('auth-storage')
        if (!authStorage) {
          throw new Error('Not authenticated')
        }
        const { state } = JSON.parse(authStorage)
        const userId = state?.user?.id
        if (!userId) {
          throw new Error('User ID not found')
        }
        return api.getProfile(userId)
      },
    }
  : api

console.log(
  `👤 User Backend: ${USE_MOCK_BACKEND ? 'MOCK (Demo Mode)' : 'REAL (Production)'}`
)

export default userApi
