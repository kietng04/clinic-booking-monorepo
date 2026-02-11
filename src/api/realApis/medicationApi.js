import { createApiClient } from '../core/createApiClient'

/**
 * Medication API - Real backend integration
 * Medical Service on port 8083
 */

const medicalServiceClient = createApiClient()

export const medicationApi = {
  /**
   * Get all active medications (for dropdown selection)
   * @returns {Promise} List of active medications
   */
  getActiveMedications: async () => {
    const response = await medicalServiceClient.get('/api/medications/active')
    return response.data
  },

  /**
   * Get medications with filters and pagination
   * @param {Object} params - { search?, category?, isActive?, page?, size? }
   * @returns {Promise} Paginated medications
   */
  getMedications: async (params = {}) => {
    const { page = 0, size = 20, ...filters } = params
    const response = await medicalServiceClient.get('/api/medications', {
      params: { page, size, ...filters },
    })
    return response.data.content || response.data
  },

  /**
   * Search medications by name or generic name
   * @param {string} query - Search query
   * @returns {Promise} List of matching medications
   */
  searchMedications: async (query) => {
    const response = await medicalServiceClient.get('/api/medications/search', {
      params: { q: query },
    })
    return response.data
  },

  /**
   * Get medications by category
   * @param {string} category - Medication category
   * @returns {Promise} List of medications in category
   */
  getByCategory: async (category) => {
    const response = await medicalServiceClient.get(`/api/medications/category/${category}`)
    return response.data
  },

  /**
   * Get all medication categories
   * @returns {Promise} List of unique categories
   */
  getCategories: async () => {
    const response = await medicalServiceClient.get('/api/medications/categories')
    return response.data
  },

  /**
   * Get single medication by ID
   * @param {string} id - Medication ID
   * @returns {Promise} Medication details
   */
  getById: async (id) => {
    const response = await medicalServiceClient.get(`/api/medications/${id}`)
    return response.data
  },

  /**
   * Create new medication (Admin only)
   * @param {Object} data - Medication data
   * @returns {Promise} Created medication
   */
  create: async (data) => {
    const response = await medicalServiceClient.post('/api/medications', data)
    return response.data
  },

  /**
   * Update medication (Admin only)
   * @param {string} id - Medication ID
   * @param {Object} data - Updated fields
   * @returns {Promise} Updated medication
   */
  update: async (id, data) => {
    const response = await medicalServiceClient.put(`/api/medications/${id}`, data)
    return response.data
  },

  /**
   * Delete medication - soft delete (Admin only)
   * @param {string} id - Medication ID
   * @returns {Promise} Success message
   */
  delete: async (id) => {
    const response = await medicalServiceClient.delete(`/api/medications/${id}`)
    return response.data
  },
}

export default medicationApi
