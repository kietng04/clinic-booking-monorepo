import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const adminServiceClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

adminServiceClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

adminServiceClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            null,
            { params: { refreshToken } }
          )
          const { token, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', token)
          localStorage.setItem('refreshToken', newRefreshToken)
          originalRequest.headers.Authorization = `Bearer ${token}`
          return adminServiceClient(originalRequest)
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

export const adminApi = {
  // Clinics
  getClinics: async (filters = {}) => {
    const response = await adminServiceClient.get('/api/clinics', { params: filters })
    return response.data.content || response.data
  },
  createClinic: async (data) => {
    const response = await adminServiceClient.post('/api/clinics', data)
    return response.data
  },
  updateClinic: async (id, data) => {
    const response = await adminServiceClient.put(`/api/clinics/${id}`, data)
    return response.data
  },
  toggleClinic: async (id) => {
    const response = await adminServiceClient.patch(`/api/clinics/${id}/toggle`)
    return response.data
  },

  // Services
  getServices: async (filters = {}) => {
    const response = await adminServiceClient.get('/api/services', { params: filters })
    return response.data.content || response.data
  },
  createService: async (data) => {
    const response = await adminServiceClient.post('/api/services', data)
    return response.data
  },
  updateService: async (id, data) => {
    const response = await adminServiceClient.put(`/api/services/${id}`, data)
    return response.data
  },

  // Rooms
  getAllRooms: async (filters = {}) => {
    const response = await adminServiceClient.get('/api/rooms', { params: filters })
    return response.data.content || response.data
  },
  getRooms: async (clinicId) => {
    const response = await adminServiceClient.get(`/api/clinics/${clinicId}/rooms`)
    return response.data.content || response.data
  },
  createRoom: async (data) => {
    const response = await adminServiceClient.post('/api/rooms', data)
    return response.data
  },
  updateRoom: async (id, data) => {
    const response = await adminServiceClient.put(`/api/rooms/${id}`, data)
    return response.data
  },

  // Reports
  getAppointmentReport: async (params = {}) => {
    const response = await adminServiceClient.get('/api/reports/appointments', { params })
    return response.data
  },
  getRevenueReport: async (params = {}) => {
    const response = await adminServiceClient.get('/api/reports/revenue', { params })
    return response.data
  },
  getPatientReport: async (params = {}) => {
    const response = await adminServiceClient.get('/api/reports/patients', { params })
    return response.data
  },
  exportReport: async (type, params = {}) => {
    const response = await adminServiceClient.get(`/api/reports/${type}/export`, {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  // Vouchers
  getVouchers: async (filters = {}) => {
    const response = await adminServiceClient.get('/api/vouchers', { params: filters })
    return response.data.content || response.data
  },
  createVoucher: async (data) => {
    const response = await adminServiceClient.post('/api/vouchers', data)
    return response.data
  },
  updateVoucher: async (id, data) => {
    const response = await adminServiceClient.put(`/api/vouchers/${id}`, data)
    return response.data
  },
  getVoucherStats: async (id) => {
    const response = await adminServiceClient.get(`/api/vouchers/${id}/stats`)
    return response.data
  },
}

export default adminApi
