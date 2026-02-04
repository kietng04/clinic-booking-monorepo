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
    // Use search endpoint if pagination or search text is present
    const useSearch = filters.page !== undefined || filters.search || filters.name
    const url = useSearch ? '/api/clinics/search' : '/api/clinics'

    // Map 'search' to 'name' for backend
    const params = { ...filters }
    if (filters.search) {
      params.name = filters.search
      delete params.search
    }

    const response = await adminServiceClient.get(url, { params })
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
    // Ensure we return an array, not an error object
    return Array.isArray(response.data) ? response.data : (response.data.content || null)
  },
  getRevenueReport: async (params = {}) => {
    const response = await adminServiceClient.get('/api/reports/revenue', { params })
    return Array.isArray(response.data) ? response.data : (response.data.content || null)
  },
  getPatientReport: async (params = {}) => {
    const response = await adminServiceClient.get('/api/reports/patients', { params })
    return response.data && typeof response.data === 'object' ? response.data : null
  },
  exportReport: async (format = 'pdf', params = {}) => {
    const response = await adminServiceClient.get(`/api/reports/export/${format}`, {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  // Vouchers
  getVouchers: async (filters = {}) => {
    const response = await adminServiceClient.get('/api/vouchers', { params: filters })
    const vouchers = response.data.content || response.data

    // Transform backend fields to frontend expected format
    return vouchers.map(v => ({
      ...v,
      type: 'Percentage', // Backend only supports percentage discounts
      value: v.discountPercentage || 0,
      active: v.isActive ?? true,
      minOrderAmount: v.minPurchaseAmount || 0,
    }))
  },
  createVoucher: async (data) => {
    // Transform frontend format to backend expected format
    const backendData = {
      code: data.code,
      description: data.description,
      discountPercentage: data.value || data.discountPercentage,
      maxDiscount: data.maxDiscount || 0,
      minPurchaseAmount: data.minOrderAmount || data.minPurchaseAmount || 0,
      validFrom: data.validFrom,
      validTo: data.validTo,
      usageLimit: data.usageLimit || -1,
      isActive: data.active ?? data.isActive ?? true,
    }
    const response = await adminServiceClient.post('/api/vouchers', backendData)
    return response.data
  },
  updateVoucher: async (id, data) => {
    // Transform frontend format to backend expected format
    const backendData = {
      description: data.description,
      discountPercentage: data.value || data.discountPercentage,
      maxDiscount: data.maxDiscount,
      minPurchaseAmount: data.minOrderAmount || data.minPurchaseAmount,
      validFrom: data.validFrom,
      validTo: data.validTo,
      usageLimit: data.usageLimit,
      isActive: data.active ?? data.isActive,
    }
    const response = await adminServiceClient.put(`/api/vouchers/${id}`, backendData)
    return response.data
  },
  getVoucherStats: async (id) => {
    const response = await adminServiceClient.get(`/api/vouchers/${id}/stats`)
    return response.data
  },
}

export default adminApi
