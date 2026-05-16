const STORAGE_PREFIX = 'appointment-payment-summary:'

const getStorageKey = (orderId) => `${STORAGE_PREFIX}${orderId}`

export const savePaymentBookingSummary = (orderId, summary) => {
  if (typeof window === 'undefined' || !orderId || !summary) return

  try {
    const payload = {
      createdAt: summary.createdAt || new Date().toISOString(),
      ...summary,
    }
    window.sessionStorage.setItem(getStorageKey(orderId), JSON.stringify(payload))
  } catch (error) {
    console.warn('Failed to persist payment booking summary', error)
  }
}

export const loadPaymentBookingSummary = (orderId) => {
  if (typeof window === 'undefined' || !orderId) return null

  try {
    const raw = window.sessionStorage.getItem(getStorageKey(orderId))
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn('Failed to read payment booking summary', error)
    return null
  }
}

export const loadAllPaymentBookingSummaries = () => {
  if (typeof window === 'undefined') return []

  try {
    const summaries = []

    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index)
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue

      const raw = window.sessionStorage.getItem(key)
      if (!raw) continue

      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        summaries.push(parsed)
      }
    }

    return summaries
  } catch (error) {
    console.warn('Failed to read all payment booking summaries', error)
    return []
  }
}

export const loadPaymentBookingSummaryByAppointmentId = (appointmentId) => {
  if (typeof window === 'undefined' || !appointmentId) return null

  try {
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index)
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue

      const raw = window.sessionStorage.getItem(key)
      if (!raw) continue

      const parsed = JSON.parse(raw)
      if (String(parsed?.appointmentId) === String(appointmentId)) {
        return parsed
      }
    }

    return null
  } catch (error) {
    console.warn('Failed to find payment booking summary by appointmentId', error)
    return null
  }
}

export const loadPaymentBookingSummaryByConsultationId = (consultationId) => {
  if (typeof window === 'undefined' || !consultationId) return null

  try {
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index)
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue

      const raw = window.sessionStorage.getItem(key)
      if (!raw) continue

      const parsed = JSON.parse(raw)
      if (String(parsed?.consultationId) === String(consultationId)) {
        return parsed
      }
    }

    return null
  } catch (error) {
    console.warn('Failed to find payment booking summary by consultationId', error)
    return null
  }
}

export const clearPaymentBookingSummary = (orderId) => {
  if (typeof window === 'undefined' || !orderId) return

  try {
    window.sessionStorage.removeItem(getStorageKey(orderId))
  } catch (error) {
    console.warn('Failed to clear payment booking summary', error)
  }
}
