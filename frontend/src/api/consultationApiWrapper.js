import { consultationApi as realConsultationApi } from './realApis/consultationApi'
import { consultationApi as mockConsultationApi } from './mockApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

const selectedApi = USE_MOCK_BACKEND ? mockConsultationApi : realConsultationApi

export const consultationApi = {
  getConsultationsByPatient: async (patientId, page = 0, size = 20) => {
    if (USE_MOCK_BACKEND) {
      const items = await selectedApi.getConsultations(patientId, 'PATIENT')
      return {
        content: Array.isArray(items) ? items : [],
        page,
        size,
      }
    }

    return selectedApi.getConsultationsByPatient(patientId, page, size)
  },

  getConsultationById: async (consultationId) => {
    if (USE_MOCK_BACKEND) {
      return selectedApi.getConsultation(consultationId)
    }

    return selectedApi.getConsultationById(consultationId)
  },

  cancelConsultation: async (consultationId) => {
    if (USE_MOCK_BACKEND) {
      throw new Error('Cancel consultation is not supported in mock mode')
    }

    return selectedApi.cancelConsultation(consultationId)
  },
}

export default consultationApi
