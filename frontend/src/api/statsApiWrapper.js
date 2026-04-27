import { statsApi as realStatsApi } from './realApis/statsApi'
import { statsApi as mockStatsApi } from './mockApi'
import { devLog } from '../utils/devLogger'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

export const statsApi = USE_MOCK_BACKEND ? mockStatsApi : realStatsApi

devLog(
  `📊 Stats Backend: ${USE_MOCK_BACKEND ? 'MOCK (Demo Mode)' : 'REAL (Production)'}`
)

export default statsApi
