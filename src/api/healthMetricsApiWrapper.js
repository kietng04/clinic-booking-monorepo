import { healthMetricsApi as realHealthMetricsApi } from './realApis/healthMetricsApi'
import { healthMetricsApi as mockHealthMetricsApi } from './mockApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

const api = USE_MOCK_BACKEND ? mockHealthMetricsApi : realHealthMetricsApi

export const healthMetricsApi = USE_MOCK_BACKEND
  ? {
      getMetricsByPatient: (patientId) => api.getMetricsByPatient(patientId),
      getMetricsByType: (patientId, type, params = {}) =>
        api.getMetrics(patientId, { type, ...params }),
      logMetric: (metricData) => api.logMetric(metricData),
      updateMetric: (metricId, updateData) => api.updateMetric(metricId, updateData),
      deleteMetric: (metricId) => api.deleteMetric(metricId),
    }
  : {
      getMetricsByPatient: (patientId, params = {}) => api.getMetrics(patientId, params),
      getMetricsByType: (patientId, type, params = {}) => api.getMetricsByType(patientId, type, params),
      logMetric: (metricData) => api.logMetric(metricData),
      updateMetric: (metricId, updateData) => api.updateMetric(metricId, updateData),
      deleteMetric: (metricId) => api.deleteMetric(metricId),
    }

console.log(
  `❤️  Health Metrics Backend: ${USE_MOCK_BACKEND ? 'MOCK (Demo Mode)' : 'REAL (Production)'}`
)

export default healthMetricsApi
