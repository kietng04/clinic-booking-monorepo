import { createApiClient } from '../core/createApiClient'

/**
 * Statistics API - Real backend integration
 * Provides patient, doctor, and admin statistics endpoints
 */

const statsServiceClient = createApiClient()

export const statsApi = {
  /**
   * Get patient statistics
   * @param {string} patientId - Patient ID
   * @returns {Promise} Patient statistics data
   */
  getPatientStats: async (patientId) => {
    const response = await statsServiceClient.get(`/api/statistics/aggregate/patient/${patientId}`)
    return response.data
  },

  /**
   * Get doctor statistics
   * @param {string} doctorId - Doctor ID
   * @returns {Promise} Doctor statistics data
   */
  getDoctorStats: async (doctorId) => {
    const response = await statsServiceClient.get(`/api/statistics/aggregate/doctor/${doctorId}`)
    return response.data
  },

  /**
   * Get admin statistics (dashboard overview)
   * @returns {Promise} Admin statistics and dashboard data
   */
  getAdminStats: async () => {
    const response = await statsServiceClient.get('/api/statistics/aggregate/dashboard')
    return response.data
  },

  /**
   * Get admin analytics dashboard with time-series data
   * @returns {Promise} Admin analytics dashboard with 12-month trends, top doctors, recent activities
   */
  getAdminAnalyticsDashboard: async () => {
    const response = await statsServiceClient.get('/api/statistics/aggregate/analytics/admin/dashboard')
    return response.data
  },

  /**
   * Get doctor analytics dashboard with time-series data
   * @param {string} doctorId - Doctor ID
   * @returns {Promise} Doctor analytics dashboard with 6-month trends, appointment types, time slots
   */
  getDoctorAnalyticsDashboard: async (doctorId) => {
    const response = await statsServiceClient.get(`/api/statistics/aggregate/analytics/doctor/${doctorId}/dashboard`)
    return response.data
  },
}

export default statsApi
