import { prescriptionApi as realPrescriptionApi } from './realApis/prescriptionApi'
import { devLog } from '../utils/devLogger'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

// Demo/mock mode still uses the real prescription API because prescriptions are
// tied to persisted medical records.
export const prescriptionApi = realPrescriptionApi

devLog(
  `💊 Prescription Backend: ${USE_MOCK_BACKEND ? 'REAL (Mock not implemented)' : 'REAL (Production)'}`
)

export default prescriptionApi
