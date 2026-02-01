import axios from 'axios'

/**
 * Health Metrics API - Real backend integration
 * Manages patient health metrics and vital signs tracking
 */

// API base URL - Gateway URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Create axios instance for health metrics service
const healthMetricsServiceClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
healthMetricsServiceClient.interceptors.request.use(
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
healthMetricsServiceClient.interceptors.response.use(
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
          return healthMetricsServiceClient(originalRequest)
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

export const healthMetricsApi = {
  /**
   * Get patient's health metrics with optional filters
   * @param {string} patientId - Patient ID
   * @param {Object} filters - Filter options { type?, fromDate?, toDate?, page?, size? }
   * @returns {Promise} Health metrics data (paginated or array)
   */
  getMetrics: async (patientId, filters = {}) => {
    const { page = 0, size = 20, ...otherFilters } = filters
    const response = await healthMetricsServiceClient.get(
      `/api/health-metrics/patient/${patientId}`,
      {
        params: { page, size, ...otherFilters },
      }
    )
    return response.data.content || response.data
  },

  /**
   * Get health metrics of specific type for a patient
   * @param {string} patientId - Patient ID
   * @param {string} type - Metric type (BLOOD_PRESSURE | HEART_RATE | TEMPERATURE | WEIGHT | HEIGHT | BLOOD_SUGAR | etc.)
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Metrics of specified type (paginated)
   */
  getMetricsByType: async (patientId, type, params = {}) => {
    const { page = 0, size = 20 } = params
    const response = await healthMetricsServiceClient.get(
      `/api/health-metrics/patient/${patientId}/type/${type}`,
      {
        params: { page, size },
      }
    )
    return response.data.content || response.data
  },

  /**
   * Get health metrics history for a patient
   * @param {string} patientId - Patient ID
   * @param {string} type - Metric type
   * @param {number} days - Number of days to retrieve (e.g., 7, 30, 90)
   * @returns {Promise} Historical metrics for the specified period
   */
  getMetricsHistory: async (patientId, type, days = 30) => {
    const response = await healthMetricsServiceClient.get(
      `/api/health-metrics/patient/${patientId}/history`,
      {
        params: { type, days },
      }
    )
    return response.data
  },

  /**
   * Log a new health metric
   * @param {Object} metricData - Metric information
   * @param {string} metricData.patientId - Patient ID
   * @param {string} metricData.type - Metric type (BLOOD_PRESSURE | HEART_RATE | TEMPERATURE | WEIGHT | HEIGHT | BLOOD_SUGAR | etc.)
   * @param {Object} metricData.values - Metric values (structure depends on type)
   *   - For BLOOD_PRESSURE: { systolic, diastolic }
   *   - For HEART_RATE: { rate }
   *   - For TEMPERATURE: { temperature }
   *   - For WEIGHT: { weight }
   *   - For HEIGHT: { height }
   *   - For BLOOD_SUGAR: { glucose }
   * @param {string} metricData.unit - Unit of measurement (optional, inferred from type)
   * @param {string} metricData.notes - Additional notes (optional)
   * @param {string} metricData.recordedAt - Timestamp of measurement (optional, defaults to now)
   * @returns {Promise} Created health metric
   */
  logMetric: async (metricData) => {
    const response = await healthMetricsServiceClient.post('/api/health-metrics', metricData)
    return response.data
  },

  /**
   * Update an existing health metric
   * @param {string} metricId - Health metric ID
   * @param {Object} updateData - Updated metric information
   * @param {Object} updateData.values - Updated metric values (structure depends on type)
   * @param {string} updateData.notes - Updated notes (optional)
   * @param {string} updateData.recordedAt - Updated timestamp (optional)
   * @returns {Promise} Updated health metric
   */
  updateMetric: async (metricId, updateData) => {
    const response = await healthMetricsServiceClient.put(
      `/api/health-metrics/${metricId}`,
      updateData
    )
    return response.data
  },

  /**
   * Delete a health metric
   * @param {string} metricId - Health metric ID
   * @returns {Promise} Deletion confirmation
   */
  deleteMetric: async (metricId) => {
    const response = await healthMetricsServiceClient.delete(`/api/health-metrics/${metricId}`)
    return response.data
  },
}

export default healthMetricsApi
