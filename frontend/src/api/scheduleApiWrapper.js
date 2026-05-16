import { scheduleApi as realScheduleApi } from './realApis/scheduleApi'
import { scheduleApi as mockScheduleApi } from './mockApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

export const scheduleApi = USE_MOCK_BACKEND ? mockScheduleApi : realScheduleApi

console.log(
  `📅 Schedule Backend: ${USE_MOCK_BACKEND ? 'MOCK (Demo Mode)' : 'REAL (Production)'}`
)

export default scheduleApi
