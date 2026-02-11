import { createApiClient } from '../core/createApiClient'

/**
 * Medical Record API - Real backend integration
 * Medical Service on port 8083
 */

const medicalServiceClient = createApiClient()

export const medicalRecordApi = {
  /**
   * Get medical records by patient ID
   * @param {string} patientId - Patient ID
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Paginated medical records
   */
  getByPatientId: async (patientId, params = {}) => {
    const { page = 0, size = 20 } = params
    const response = await medicalServiceClient.get(
      `/api/medical-records/patient/${patientId}`,
      { params: { page, size } }
    )
    return response.data.content || response.data
  },

  /**
   * Backward-compatible alias used by dashboards
   * @param {string} patientId - Patient ID
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Medical records array/page content
   */
  getRecords: async (patientId, params = {}) => {
    return medicalRecordApi.getByPatientId(patientId, params)
  },

  /**
   * Get medical records by doctor ID
   * @param {string} doctorId - Doctor ID
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Paginated medical records
   */
  getByDoctorId: async (doctorId, params = {}) => {
    const { page = 0, size = 20 } = params
    const response = await medicalServiceClient.get(
      `/api/medical-records/doctor/${doctorId}`,
      { params: { page, size } }
    )
    return response.data.content || response.data
  },

  /**
   * Get single medical record by ID
   * @param {string} id - Medical record ID
   * @returns {Promise} Medical record details
   */
  getById: async (id) => {
    const response = await medicalServiceClient.get(`/api/medical-records/${id}`)
    return response.data
  },

  /**
   * Create new medical record (Doctor only)
   * @param {Object} data - Medical record data
   * @returns {Promise} Created medical record
   */
  create: async (data) => {
    const response = await medicalServiceClient.post('/api/medical-records', data)
    return response.data
  },

  /**
   * Update medical record
   * @param {string} id - Medical record ID
   * @param {Object} data - Updated fields
   * @returns {Promise} Updated medical record
   */
  update: async (id, data) => {
    const response = await medicalServiceClient.put(`/api/medical-records/${id}`, data)
    return response.data
  },

  /**
   * Delete medical record
   * @param {string} id - Medical record ID
   * @returns {Promise} Success message
   */
  delete: async (id) => {
    const response = await medicalServiceClient.delete(`/api/medical-records/${id}`)
    return response.data
  },

  /**
   * Alias for getByPatientId - used by DoctorPatients component
   * @param {string} patientId - Patient ID
   * @returns {Promise} Medical records array
   */
  getRecordsByPatient: async (patientId) => {
    try {
      const { page = 0, size = 50 } = {}
      const response = await medicalServiceClient.get(
        `/api/medical-records/patient/${patientId}`,
        { params: { page, size } }
      )
      return response.data.content || response.data || []
    } catch (error) {
      console.warn('No medical records found for patient:', patientId)
      return []
    }
  },
}

export default medicalRecordApi
