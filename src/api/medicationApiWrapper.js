import { medicationApi as realMedicationApi } from './realApis/medicationApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

// For now, always use real API since mock doesn't have medications yet
// TODO: Add mock medication API if needed for demo mode
export const medicationApi = realMedicationApi

console.log(
  `💉 Medication Backend: ${USE_MOCK_BACKEND ? 'REAL (Mock not implemented)' : 'REAL (Production)'}`
)

export default medicationApi
