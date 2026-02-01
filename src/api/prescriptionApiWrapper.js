import { prescriptionApi as realPrescriptionApi } from './realApis/prescriptionApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

// For now, always use real API since mock doesn't have prescriptions yet
// TODO: Add mock prescription API if needed for demo mode
export const prescriptionApi = realPrescriptionApi

console.log(
  `💊 Prescription Backend: ${USE_MOCK_BACKEND ? 'REAL (Mock not implemented)' : 'REAL (Production)'}`
)

export default prescriptionApi
