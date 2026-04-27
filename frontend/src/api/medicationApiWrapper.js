import { medicationApi as realMedicationApi } from './realApis/medicationApi'
import { devLog } from '../utils/devLogger'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

// Demo/mock mode still uses the real medication API so the catalog stays in
// sync with prescription creation.
export const medicationApi = realMedicationApi

devLog(
  `💉 Medication Backend: ${USE_MOCK_BACKEND ? 'REAL (Mock not implemented)' : 'REAL (Production)'}`
)

export default medicationApi
