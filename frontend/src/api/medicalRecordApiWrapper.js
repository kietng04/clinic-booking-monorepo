import { medicalRecordApi as realMedicalRecordApi } from './realApis/medicalRecordApi'
import { devLog } from '../utils/devLogger'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

// Demo/mock mode still uses the real medical-record API because this domain
// depends on persisted appointment and prescription data.
export const medicalRecordApi = realMedicalRecordApi

devLog(
  `🏥 Medical Record Backend: ${USE_MOCK_BACKEND ? 'REAL (Mock not implemented)' : 'REAL (Production)'}`
)

export default medicalRecordApi
