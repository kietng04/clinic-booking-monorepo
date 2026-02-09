import { createApiClient } from '../core/createApiClient'

/**
 * Payment API - Real backend integration
 */

const paymentServiceClient = createApiClient()

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


export const paymentApi = {
  /**
   * Create payment for an appointment
   * @param {Object} data - { appointmentId, amount, method }
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
