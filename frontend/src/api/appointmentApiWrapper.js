import { appointmentApi as realAppointmentApi } from './realApis/appointmentApi'
import { appointmentApi as mockAppointmentApi } from './mockApi'
import { devLog } from '../utils/devLogger'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

const selectedApi = USE_MOCK_BACKEND ? mockAppointmentApi : realAppointmentApi

export const appointmentApi = {
  ...selectedApi,
  linkPaymentToAppointment:
    selectedApi.linkPaymentToAppointment ||
    (async (appointmentId) => selectedApi.getAppointment(appointmentId)),
}

devLog(
  `🗓️  Appointment Backend: ${USE_MOCK_BACKEND ? 'MOCK (Demo Mode)' : 'REAL (Production)'}`
)

export default appointmentApi
