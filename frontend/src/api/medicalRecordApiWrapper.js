import { medicalRecordApi as realMedicalRecordApi } from './realApis/medicalRecordApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

// For now, always use real API since mock doesn't have medical records yet
// TODO: Add mock medical record API if needed for demo mode
export const medicalRecordApi = realMedicalRecordApi

console.log(
  `🏥 Medical Record Backend: ${USE_MOCK_BACKEND ? 'REAL (Mock not implemented)' : 'REAL (Production)'}`
)

export default medicalRecordApi
