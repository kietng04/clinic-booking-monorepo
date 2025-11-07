import { createApiClient } from '../core/createApiClient'

/**
 * Appointment API - Real backend integration
 * Routes through API Gateway (port 8080) for centralized request handling
 */

const normalizeAppointment = (appointment) => {
  if (!appointment || typeof appointment !== 'object') return appointment

  const appointmentDate = appointment.appointmentDate || appointment.date || null
  const appointmentTime = appointment.appointmentTime || appointment.time || null
  const doctorProfile = appointment.doctor || {}
  const patientProfile = appointment.patient || {}

  return {
    ...appointment,
    appointmentDate: appointment.appointmentDate || appointment.date || null,
    appointmentTime: appointment.appointmentTime || appointment.time || null,
    date: appointmentDate,
    time: appointmentTime,
    reason: appointment.reason || appointment.symptoms || appointment.notes || '',
    doctorName: appointment.doctorName || doctorProfile.fullName || doctorProfile.name || appointment.doctorId,
    doctorSpecialization: appointment.doctorSpecialization || doctorProfile.specialization || '',
    patientName: appointment.patientName || patientProfile.fullName || patientProfile.name || appointment.patientId,
  }
}

const normalizeAppointmentList = (data) =>
  Array.isArray(data) ? data.map(normalizeAppointment) : data

// Create dedicated axios client for API Gateway (port 8080)
const appointmentServiceClient = createApiClient()
export const appointmentApi = {
  /**
   * Get appointments with filters
   * @param {Object} params - { patientId?, doctorId?, status?, fromDate?, toDate?, page?, size? }
   * @returns {Promise} Paginated appointments or array
   */
  getAppointments: async (params = {}) => {
    const { page = 0, size = 20, includeUnpaid = false, ...filters } = params
    const response = await appointmentServiceClient.get('/api/appointments/search', {
      params: { page, size, includeUnpaid, ...filters },
    })

    // If backend returns Page<Appointment>, extract content
    // Otherwise return data as-is
    return normalizeAppointmentList(response.data.content || response.data)
  },

  /**
   * Get patient's appointments
   * @param {string} patientId - Patient ID
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Paginated appointments
   */
  getPatientAppointments: async (patientId, params = {}) => {
    const { page = 0, size = 20 } = params
    const response = await appointmentServiceClient.get(`/api/appointments/patient/${patientId}`, {
      params: { page, size },
    })
    return normalizeAppointmentList(response.data.content || response.data)
  },

  /**
   * Get doctor's appointments
   * @param {string} doctorId - Doctor ID
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Paginated appointments
   */
  getDoctorAppointments: async (doctorId, params = {}) => {
    const { page = 0, size = 20 } = params
    const response = await appointmentServiceClient.get(`/api/appointments/doctor/${doctorId}`, {
      params: { page, size },
    })
    return normalizeAppointmentList(response.data.content || response.data)
  },

  /**
   * Get appointment by ID
   * @param {string} id - Appointment ID
   * @returns {Promise} Appointment details
   */
  getAppointment: async (id) => {
    const response = await appointmentServiceClient.get(`/api/appointments/${id}`)
    return normalizeAppointment(response.data)
  },

  /**
   * Create new appointment
   * @param {Object} data - Appointment data
   * @returns {Promise} Created appointment
   */
  createAppointment: async (data) => {
    // Map frontend fields to backend format
    const appointmentData = {
      patientId: data.patientId,
      doctorId: data.doctorId,
      familyMemberId: data.familyMemberId || null,
      clinicId: data.clinicId ?? null,
      serviceId: data.serviceId ?? null,
      roomId: data.roomId ?? null,
      serviceFee: data.serviceFee ?? null,
      appointmentDate: data.date, // YYYY-MM-DD
      appointmentTime: data.time, // HH:MM
      durationMinutes: data.durationMinutes || 30,
      type: data.type || 'IN_PERSON', // IN_PERSON | ONLINE
      symptoms: data.reason || data.symptoms, // Frontend uses 'reason', backend uses 'symptoms'
      notes: data.notes || '',
      priority: data.priority || 'NORMAL', // NORMAL | URGENT
    }

    const response = await appointmentServiceClient.post('/api/appointments', appointmentData)
    return normalizeAppointment(response.data)
  },

  /**
   * Link a generated payment order to an existing appointment.
   * @param {string|number} appointmentId
   * @param {Object} data - { paymentOrderId, paymentMethod, paymentExpiresAt }
   * @returns {Promise} Updated appointment
   */
  linkPaymentToAppointment: async (appointmentId, data) => {
    const response = await appointmentServiceClient.patch(`/api/appointments/${appointmentId}/payment-link`, {
      paymentOrderId: data?.paymentOrderId,
      paymentMethod: data?.paymentMethod,
      paymentExpiresAt: data?.paymentExpiresAt,
    })
    return normalizeAppointment(response.data)
  },

  /**
   * Update appointment
   * @param {string} id - Appointment ID
   * @param {Object} data - Updated fields
   * @returns {Promise} Updated appointment
   */
  updateAppointment: async (id, data) => {
    const response = await appointmentServiceClient.put(`/api/appointments/${id}`, data)
    return normalizeAppointment(response.data)
  },

  /**
   * Confirm appointment
   * @param {string} id - Appointment ID
   * @returns {Promise} Updated appointment with status CONFIRMED
   */
  confirmAppointment: async (id) => {
    const response = await appointmentServiceClient.put(`/api/appointments/${id}/confirm`)
    return normalizeAppointment(response.data)
  },

  /**
   * Cancel appointment
   * @param {string} id - Appointment ID
   * @param {string} reason - Cancellation reason (optional)
   * @returns {Promise} Updated appointment with status CANCELLED
   */
  cancelAppointment: async (id, reason = '') => {
    const response = await appointmentServiceClient.put(`/api/appointments/${id}/cancel`, null, {
      params: { reason },
    })
    return normalizeAppointment(response.data)
  },

  /**
   * Complete appointment
   * @param {string} id - Appointment ID
   * @returns {Promise} Updated appointment with status COMPLETED
   */
  completeAppointment: async (id) => {
    const response = await appointmentServiceClient.put(`/api/appointments/${id}/complete`)
    return response.data
  },

  /**
   * Submit feedback for completed appointment
   * @param {string|number} id - Appointment ID
   * @param {Object} data - { rating, review? }
   * @returns {Promise} Updated appointment with feedback
   */
  submitFeedback: async (id, data) => {
    const payload = {
      rating: data?.rating,
      review: data?.review ?? '',
    }
    const response = await appointmentServiceClient.put(`/api/appointments/${id}/feedback`, payload)
    return normalizeAppointment(response.data)
  },

  /**
   * Delete appointment
   * @param {string} id - Appointment ID
   * @returns {Promise} Deletion confirmation
   */
  deleteAppointment: async (id) => {
    const response = await appointmentServiceClient.delete(`/api/appointments/${id}`)
    return response.data
  },

  /**
   * Reschedule appointment
   * @param {string} id - Appointment ID
   * @param {Object} data - { newDate, newTime, reason? }
   * @returns {Promise} New appointment details
   */
  rescheduleAppointment: async (id, data) => {
    const response = await appointmentServiceClient.post(`/api/appointments/${id}/reschedule`, {
      newDate: data.newDate,
      newTime: data.newTime,
      reason: data.reason || '',
    })
    return normalizeAppointment(response.data)
  },

  /**
   * Check in for appointment
   * @param {string} id - Appointment ID
   * @returns {Promise} Updated appointment with CHECKED_IN status
   */
  checkInAppointment: async (id) => {
    const response = await appointmentServiceClient.post(`/api/appointments/${id}/check-in`)
    return normalizeAppointment(response.data)
  },

  /**
   * Download appointment as calendar file (.ics)
   * @param {string} id - Appointment ID
   * @returns {Promise} Blob for .ics file download
   */
  downloadCalendar: async (id) => {
    const response = await appointmentServiceClient.get(`/api/appointments/${id}/calendar.ics`, {
      responseType: 'blob',
    })
    return response.data
  },
}

export default appointmentApi
