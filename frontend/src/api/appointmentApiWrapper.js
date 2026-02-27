import { appointmentApi as realAppointmentApi } from './realApis/appointmentApi'
import { appointmentApi as mockAppointmentApi } from './mockApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

export const appointmentApi = USE_MOCK_BACKEND ? mockAppointmentApi : realAppointmentApi

console.log(
  `🗓️  Appointment Backend: ${USE_MOCK_BACKEND ? 'MOCK (Demo Mode)' : 'REAL (Production)'}`
)

export default appointmentApi
