import { createApiClient } from '../core/createApiClient'

const adminServiceClient = createApiClient()

const ROOM_TYPE_TO_BACKEND = {
  Consultation: 'CONSULTATION',
  Lab: 'LAB',
  Imaging: 'IMAGING',
  Procedure: 'PROCEDURE',
}

const ROOM_TYPE_TO_FRONTEND = {
  CONSULTATION: 'Consultation',
  LAB: 'Lab',
  IMAGING: 'Imaging',
  PROCEDURE: 'Procedure',
}

const mapRoomTypeToBackend = (type) => {
  if (!type) return type
  return ROOM_TYPE_TO_BACKEND[type] || type
}

const mapRoomTypeToFrontend = (type) => {
  if (!type) return type
  return ROOM_TYPE_TO_FRONTEND[type] || type
}

const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const normalizeRoomPayload = (data = {}) => {
  const payload = { ...data }

  if (Object.prototype.hasOwnProperty.call(payload, 'clinicId')) {
    payload.clinicId = toNullableNumber(payload.clinicId)
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'type')) {
    payload.type = mapRoomTypeToBackend(payload.type)
  }

  return payload
}

const normalizeAppointmentReport = (data = {}) => ({
  totalAppointments: Number(data?.totalAppointments ?? 0),
  confirmed: Number(data?.confirmed ?? 0),
  completed: Number(data?.completed ?? 0),
  cancelled: Number(data?.cancelled ?? 0),
  monthlyTrend: Array.isArray(data?.monthlyTrend)
    ? data.monthlyTrend.map((item) => ({
        month: item?.month ?? '',
        name: item?.month ?? '',
        total: Number(item?.total ?? 0),
        confirmed: Number(item?.confirmed ?? 0),
        completed: Number(item?.completed ?? 0),
        cancelled: Number(item?.cancelled ?? 0),
      }))
    : [],
})

const normalizeRevenueReport = (data = {}) => ({
  totalRevenue: Number(data?.totalRevenue ?? 0),
  onlinePayment: Number(data?.onlinePayment ?? 0),
  cashPayment: Number(data?.cashPayment ?? 0),
  monthlyTrend: Array.isArray(data?.monthlyTrend)
    ? data.monthlyTrend.map((item) => ({
        month: item?.month ?? '',
        name: item?.month ?? '',
        revenue: Number(item?.revenue ?? 0),
        online: Number(item?.online ?? 0),
        cash: Number(item?.cash ?? 0),
      }))
    : [],
})

const normalizePatientReport = (data = {}) => ({
  totalPatients: Number(data?.totalPatients ?? 0),
  newPatients: Number(data?.newPatients ?? 0),
  activePatients: Number(data?.activePatients ?? 0),
})

export const adminApi = {
  // Clinics
  getClinics: async (filters = {}) => {
    // Use search endpoint if pagination or search text is present
    const useSearch = filters.page !== undefined || filters.search || filters.name
    const url = useSearch ? '/api/clinics/search' : '/api/clinics'

    // Map 'search' to 'name' for backend
    const params = { ...filters }
    if (filters.search) {
      params.name = filters.search
      delete params.search
    }

    const response = await adminServiceClient.get(url, { params })
    return response.data.content || response.data
  },
  createClinic: async (data) => {
    const response = await adminServiceClient.post('/api/clinics', data)
    return response.data
  },
  updateClinic: async (id, data) => {
    const response = await adminServiceClient.put(`/api/clinics/${id}`, data)
    return response.data
  },
  toggleClinic: async (id) => {
    const response = await adminServiceClient.patch(`/api/clinics/${id}/toggle`)
    return response.data
  },

  // Services
  getServices: async (filters = {}) => {
    const response = await adminServiceClient.get('/api/services', { params: filters })
    return response.data.content || response.data
  },
  createService: async (data) => {
    const response = await adminServiceClient.post('/api/services', data)
    return response.data
  },
  updateService: async (id, data) => {
    const response = await adminServiceClient.put(`/api/services/${id}`, data)
    return response.data
  },

  // Rooms
  getAllRooms: async (filters = {}) => {
    const response = await adminServiceClient.get('/api/rooms', { params: filters })
    const rooms = response.data.content || response.data
    return rooms.map(room => ({
      ...room,
      type: mapRoomTypeToFrontend(room.type),
    }))
  },
  getRooms: async (clinicId) => {
    const response = await adminServiceClient.get(`/api/rooms/clinic/${clinicId}`)
    const rooms = response.data.content || response.data
    return rooms.map(room => ({
      ...room,
      type: mapRoomTypeToFrontend(room.type),
    }))
  },
  createRoom: async (data) => {
    const response = await adminServiceClient.post('/api/rooms', normalizeRoomPayload(data))
    return response.data
  },
  updateRoom: async (id, data) => {
    const response = await adminServiceClient.put(`/api/rooms/${id}`, normalizeRoomPayload(data))
    return response.data
  },

  // Reports
  getAppointmentReport: async (params = {}) => {
    const response = await adminServiceClient.get('/api/reports/appointments', { params })
    return normalizeAppointmentReport(response.data)
  },
  getRevenueReport: async (params = {}) => {
    const response = await adminServiceClient.get('/api/reports/revenue', { params })
    return normalizeRevenueReport(response.data)
  },
  getPatientReport: async (params = {}) => {
    const response = await adminServiceClient.get('/api/reports/patients', { params })
    return normalizePatientReport(response.data)
  },
  exportReport: async (format = 'pdf', params = {}) => {
    if (format !== 'pdf') {
      throw new Error('Backend currently supports PDF report export only')
    }
    const response = await adminServiceClient.get('/api/reports/export/pdf', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}

export default adminApi
