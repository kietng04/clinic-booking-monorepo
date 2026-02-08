import axios from 'axios'

/**
 * Payment API - Real backend integration
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const paymentServiceClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const normalizePaymentMethod = (method) => {
  if (!method) {
    return undefined
  }

  const normalized = method.toString().trim().toUpperCase()
  const mapping = {
    MOMO: 'MOMO_WALLET',
    MOMO_WALLET: 'MOMO_WALLET',
    CASH: 'CASH',
    BANK_TRANSFER: 'BANK_TRANSFER',
    CARD_AT_COUNTER: 'CARD_AT_COUNTER',
  }

  return mapping[normalized] || normalized
}

// Add JWT token to requests
paymentServiceClient.interceptors.request.use(
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
paymentServiceClient.interceptors.response.use(
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
          return paymentServiceClient(originalRequest)
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

export const paymentApi = {
  /**
   * Create payment for an appointment
   * @param {Object} data - { appointmentId, amount, method, voucherCode? }
   * @returns {Promise} Payment details with redirect URL
   */
  createPayment: async (data) => {
    const { method, paymentMethod, ...rest } = data || {}
    const normalizedMethod = normalizePaymentMethod(paymentMethod || method)
    const payload = {
      ...rest,
      ...(normalizedMethod ? { paymentMethod: normalizedMethod } : {}),
    }
    const response = await paymentServiceClient.post('/api/payments', payload)
    return response.data
  },

  /**
   * Get payment history for a patient
   * @param {string} patientId - Patient ID
   * @param {Object} filters - { status?, method?, fromDate?, toDate?, page?, size? }
   * @returns {Promise} Paginated payment history
   */
  getPaymentHistory: async (patientId, filters = {}) => {
    const { page = 0, size = 20, ...params } = filters
    const response = await paymentServiceClient.get('/api/payments/my-payments', {
      params: { page, size, ...params },
    })
    return response.data.content || response.data
  },

  /**
   * Get payment result/details
   * @param {string} paymentId - Payment ID
   * @returns {Promise} Payment result
   */
  getPaymentResult: async (paymentId) => {
    const response = await paymentServiceClient.get(`/api/payments/${paymentId}`)
    return response.data
  },

  /**
   * Validate voucher code
   * @param {string} code - Voucher code
   * @param {number} amount - Order amount
   * @returns {Promise} Voucher validation result
   */
  validateVoucher: async (code, amount) => {
    const response = await paymentServiceClient.post('/api/vouchers/validate', {
      code,
      amount,
    })
    return response.data
  },

  /**
   * Apply voucher to order
   * @param {string} appointmentId - Appointment/Order ID
   * @param {string} code - Voucher code
   * @returns {Promise} Applied voucher details with discount
   */
  applyVoucher: async (appointmentId, code) => {
    const response = await paymentServiceClient.post('/api/vouchers/apply', {
      appointmentId,
      code,
    })
    return response.data
  },

  /**
   * Download receipt as PDF
   * @param {string} paymentId - Payment ID
   * @returns {Promise} Blob for PDF download
   */
  downloadReceipt: async (paymentId) => {
    const response = await paymentServiceClient.get(`/api/payments/${paymentId}/receipt`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Export payment history to CSV
   * @param {string} patientId - Patient ID
   * @param {Object} filters - Date range filters
   * @returns {Promise} Blob for CSV download
   */
  exportHistory: async (patientId, filters = {}) => {
    const response = await paymentServiceClient.get('/api/payments/my-payments/export', {
      params: filters,
      responseType: 'blob',
    })
    return response.data
  },
}

export default paymentApi
