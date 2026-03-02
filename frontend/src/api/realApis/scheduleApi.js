import { appointmentApi } from './appointmentApi'
import { createApiClient } from '../core/createApiClient'

/**
 * Doctor Schedule API - Real backend integration
 * Routes through API Gateway (port 8080) for centralized request handling
 * (Schedules are part of appointment-service)
 */

const appointmentServiceClient = createApiClient()
export const scheduleApi = {
  /**
   * Get schedule by ID
   * @param {string} id - Schedule ID
   * @returns {Promise} Schedule details
   */
  getScheduleById: async (id) => {
    const response = await appointmentServiceClient.get(`/api/schedules/${id}`)
    return response.data
  },

  /**
   * Get all schedules for a doctor
   * @param {string} doctorId - Doctor ID
   * @returns {Promise} Array of schedules
   */
  getDoctorSchedules: async (doctorId) => {
    const response = await appointmentServiceClient.get(`/api/schedules/doctor/${doctorId}`)
    return response.data
  },

  /**
   * Get schedule for specific doctor and day
   * @param {string} doctorId - Doctor ID
   * @param {number} dayOfWeek - Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
   * @returns {Promise} Array of schedule windows for that day
   */
  getDoctorScheduleByDay: async (doctorId, dayOfWeek) => {
    const response = await appointmentServiceClient.get(`/api/schedules/doctor/${doctorId}/day/${dayOfWeek}`)
    return normalizeScheduleList(response.data)
  },

  /**
   * Get available time slots for a doctor on a specific date
   * This is a frontend helper that combines schedule and appointment data
   * @param {string} doctorId - Doctor ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise} Array of available time slots
   */
  getAvailableSlots: async (doctorId, date) => {
    // Get day of week from date
    const dateObj = new Date(date)
    const dayOfWeek = dateObj.getDay()

    try {
      // Get doctor's schedule for this day
      const schedules = await scheduleApi.getDoctorScheduleByDay(doctorId, dayOfWeek)
      const availableSchedules = schedules.filter((schedule) => schedule?.isAvailable !== false)

      if (availableSchedules.length === 0) {
        return [] // Doctor not available on this day
      }

      // Generate unique time slots from all available schedule windows in that day.
      const slots = [...new Set(
        availableSchedules.flatMap((schedule) =>
          generateTimeSlots(schedule.startTime, schedule.endTime, 30)
        )
      )].sort()

      // Get doctor's appointments for the specific date to filter out booked slots
      try {
        const appointments = await appointmentApi.getAppointments({
          doctorId,
          includeUnpaid: true,
          fromDate: date,
          toDate: date,
          size: 100, // Get all appointments for the day
        })

        // Extract booked time slots from appointments
        const bookedTimes = appointments
          .filter(apt =>
            apt.status !== 'CANCELLED' &&
            apt.status !== 'COMPLETED'
          )
          .map(apt => normalizeTime(apt.appointmentTime || apt.time))
          .filter(Boolean)

        // Mark slots as available/unavailable based on bookings
        return slots.map((time) => ({
          time,
          available: !bookedTimes.includes(time),
        }))
      } catch (appointmentError) {
        // If appointment check fails, return all slots as available (fail-safe)
        console.error('Error checking appointments:', appointmentError)
        return slots.map((time) => ({
          time,
          available: true,
        }))
      }
    } catch (error) {
      // If no schedule found, return empty array
      console.error('Error fetching schedule:', error)
      return []
    }
  },

  /**
   * Create new schedule for doctor
   * @param {Object} data - { doctorId, dayOfWeek, startTime, endTime, isAvailable }
   * @returns {Promise} Created schedule
   */
  createSchedule: async (data) => {
    const response = await appointmentServiceClient.post('/api/schedules', data)
    return response.data
  },

  /**
   * Update schedule
   * @param {string} id - Schedule ID
   * @param {Object} data - { dayOfWeek?, startTime?, endTime?, isAvailable? }
   * @returns {Promise} Updated schedule
   */
  updateSchedule: async (id, data) => {
    const response = await appointmentServiceClient.put(`/api/schedules/${id}`, data)
    return response.data
  },

  /**
   * Delete schedule
   * @param {string} id - Schedule ID
   * @returns {Promise} Success response
   */
  deleteSchedule: async (id) => {
    const response = await appointmentServiceClient.delete(`/api/schedules/${id}`)
    return response.data
  },

  /**
   * Get all schedules (paginated)
   * @param {Object} params - { page?, size? }
   * @returns {Promise} Paginated schedules
   */
  getAllSchedules: async (params = {}) => {
    const { page = 0, size = 20 } = params
    const response = await appointmentServiceClient.get('/api/schedules', {
      params: { page, size },
    })
    return response.data.content || response.data
  },
}

/**
 * Helper function to generate time slots
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @param {number} intervalMinutes - Slot duration in minutes
 * @returns {Array} Array of time strings in HH:MM format
 */
function generateTimeSlots(startTime, endTime, intervalMinutes = 30) {
  const slots = []
  const normalizedStartTime = normalizeTime(startTime)
  const normalizedEndTime = normalizeTime(endTime)

  if (!normalizedStartTime || !normalizedEndTime) {
    return slots
  }

  // Parse start time
  const [startHour, startMinute] = normalizedStartTime.split(':').map(Number)
  const [endHour, endMinute] = normalizedEndTime.split(':').map(Number)

  let currentHour = startHour
  let currentMinute = startMinute

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    // Format time as HH:MM
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
    slots.push(timeStr)

    // Add interval
    currentMinute += intervalMinutes
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60)
      currentMinute = currentMinute % 60
    }
  }

  return slots
}

function normalizeScheduleList(data) {
  if (Array.isArray(data)) {
    return data
  }
  if (data && typeof data === 'object') {
    return [data]
  }
  return []
}

function normalizeTime(value) {
  if (!value || typeof value !== 'string') {
    return null
  }
  return value.length >= 5 ? value.slice(0, 5) : value
}

export default scheduleApi
