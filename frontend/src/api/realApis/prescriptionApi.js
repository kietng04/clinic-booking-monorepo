import { createApiClient } from '../core/createApiClient'

/**
 * Prescription API - Real backend integration
 * Medical Service on port 8083
 */

const medicalServiceClient = createApiClient()

export const prescriptionApi = {
  /**
   * Get prescriptions by medical record ID
   * @param {string} recordId - Medical record ID
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Prescriptions for the medical record
   */
  getByMedicalRecordId: async (recordId, params = {}) => {
    const { page = 0, size = 20 } = params
    const response = await medicalServiceClient.get(
      `/api/prescriptions/medical-record/${recordId}`,
      { params: { page, size } }
    )
    return response.data.content || response.data
  },

  /**
   * Get single prescription by ID
   * @param {string} id - Prescription ID
   * @returns {Promise} Prescription details
   */
  getById: async (id) => {
    const response = await medicalServiceClient.get(`/api/prescriptions/${id}`)
    return response.data
  },

  /**
   * Add prescription to medical record
   * @param {string} recordId - Medical record ID
   * @param {Object} data - Prescription data
   * @returns {Promise} Created prescription
   */
  create: async (recordId, data) => {
    const response = await medicalServiceClient.post(
      `/api/prescriptions/medical-record/${recordId}`,
      data
    )
    return response.data
  },

  /**
   * Update prescription
   * @param {string} id - Prescription ID
   * @param {Object} data - Updated fields
   * @returns {Promise} Updated prescription
   */
  update: async (id, data) => {
    const response = await medicalServiceClient.put(`/api/prescriptions/${id}`, data)
    return response.data
  },

  /**
   * Delete prescription
   * @param {string} id - Prescription ID
   * @returns {Promise} Success message
   */
  delete: async (id) => {
    const response = await medicalServiceClient.delete(`/api/prescriptions/${id}`)
    return response.data
  },
}

export default prescriptionApi
