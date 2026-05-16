const STORAGE_PREFIX = 'appointment-booking-summary:'

const getStorageKey = (appointmentId) => `${STORAGE_PREFIX}${appointmentId}`

export const saveAppointmentBookingSummary = (appointmentId, summary) => {
  if (typeof window === 'undefined' || !appointmentId || !summary) return

  try {
    window.sessionStorage.setItem(getStorageKey(appointmentId), JSON.stringify(summary))
  } catch (error) {
    console.warn('Failed to persist appointment booking summary', error)
  }
}

export const loadAppointmentBookingSummary = (appointmentId) => {
  if (typeof window === 'undefined' || !appointmentId) return null

  try {
    const raw = window.sessionStorage.getItem(getStorageKey(appointmentId))
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn('Failed to read appointment booking summary', error)
    return null
  }
}
