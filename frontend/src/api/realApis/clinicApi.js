import { createApiClient } from '../core/createApiClient'

/**
 * Clinic API - Real backend integration
 */

const clinicServiceClient = createApiClient()

export const clinicApi = {
  /**
   * Get all clinics with optional filters
   * @param {Object} filters - { active?, search? }
   * @returns {Promise} List of clinics
   */
  getClinics: async (filters = {}) => {
    const response = await clinicServiceClient.get('/api/clinics', { params: filters })
    return response.data
  },

  /**
   * Get clinic by ID
   * @param {string} id - Clinic ID
   * @returns {Promise} Clinic details
   */
  getClinicById: async (id) => {
    const response = await clinicServiceClient.get(`/api/clinics/${id}`)
    return response.data
  },

  /**
   * Get services offered by a clinic
   * @param {string} clinicId - Clinic ID
   * @param {Object} filters - { category?, active? }
   * @returns {Promise} List of services
   */
  getClinicServices: async (clinicId, filters = {}) => {
    // Backend endpoint is /api/services/clinic/{clinicId}
    const response = await clinicServiceClient.get(`/api/services/clinic/${clinicId}`, {
      params: filters,
    })
    return response.data
  },

  /**
   * Get rooms in a clinic
   * @param {string} clinicId - Clinic ID
   * @returns {Promise} List of rooms
   */
  getClinicRooms: async (clinicId) => {
    // Backend endpoint is /api/rooms/clinic/{clinicId}
    const response = await clinicServiceClient.get(`/api/rooms/clinic/${clinicId}`)
    return response.data
  },
}

export default clinicApi
