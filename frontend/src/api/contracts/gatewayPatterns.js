/**
 * Source of truth from api-gateway application.yml Path predicates.
 * Keep synced when gateway routes change.
 */
export const gatewayPatterns = [
  '/api/auth/**',
  '/api/users/**',
  '/api/family-members/**',
  '/api/statistics/users/**',
  '/api/profile/**',
  '/api/permissions/**',
  '/api/password/**',
  '/api/verification/**',
  '/api/appointments',
  '/api/appointments/**',
  '/api/schedules/**',
  '/api/notifications/**',
  '/api/statistics/appointments/**',
  '/api/statistics/aggregate/**',
  '/api/clinics',
  '/api/clinics/**',
  '/api/rooms',
  '/api/rooms/**',
  '/api/services',
  '/api/services/**',
  '/api/reports/**',
  '/api/medical-records/**',
  '/api/prescriptions/**',
  '/api/medications/**',
  '/api/health-metrics/**',
  '/api/ai-analyses/**',
  '/api/files/**',
  '/api/statistics/medical/**',
  '/api/consultations/**',
  '/api/messages/**',
  '/api/payments/**',
  '/api/chatbot/**',
]

export default gatewayPatterns
