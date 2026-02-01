import axios from 'axios'
import { appointmentApi } from './appointmentApi'

/**
 * Doctor Schedule API - Real backend integration
 * Routes through API Gateway (port 8080) for centralized request handling
 * (Schedules are part of appointment-service)
 */

// Create dedicated axios client for API Gateway (port 8080)
const appointmentServiceClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
appointmentServiceClient.interceptors.request.use(
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
appointmentServiceClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            'http://localhost:8080/api/auth/refresh',
            null,
            { params: { refreshToken } }
          )

          const { token, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', token)
          localStorage.setItem('refreshToken', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${token}`
          return appointmentServiceClient(originalRequest)
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
   * @returns {Promise} Schedule for that day
   */
  getDoctorScheduleByDay: async (doctorId, dayOfWeek) => {
    const response = await appointmentServiceClient.get(`/api/schedules/doctor/${doctorId}/day/${dayOfWeek}`)
    return response.data
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
      const schedule = await scheduleApi.getDoctorScheduleByDay(doctorId, dayOfWeek)

      if (!schedule || !schedule.isAvailable) {
        return [] // Doctor not available on this day
      }

      // Generate time slots from schedule
      const slots = generateTimeSlots(schedule.startTime, schedule.endTime, 30) // 30-minute slots

      // Get doctor's appointments for the specific date to filter out booked slots
      try {
        const appointments = await appointmentApi.getAppointments({
          doctorId,
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
          .map(apt => apt.appointmentTime || apt.time)
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

  // Parse start time
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

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

export default scheduleApi
