/**
 * Authentication API Wrapper
 * Allows switching between mock and real backend
 */

import { authApi as realAuthApi } from './authApi'
import { authApi as mockAuthApi } from './mockApi'
import { devLog } from '../utils/devLogger'

// Check if we should use mock backend
// Set VITE_USE_MOCK_BACKEND=true in .env for demo/testing
const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

// Export the appropriate API based on environment
export const authApi = USE_MOCK_BACKEND ? mockAuthApi : realAuthApi

devLog(`🔌 Auth Backend: ${USE_MOCK_BACKEND ? 'MOCK (Demo Mode)' : 'REAL (Production)'}`)

export default authApi
