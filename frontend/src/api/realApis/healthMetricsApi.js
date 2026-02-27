import { createApiClient } from '../core/createApiClient'

/**
 * Health Metrics API - Real backend integration
 * Manages patient health metrics and vital signs tracking
 */

const healthMetricsServiceClient = createApiClient()

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
