const isPendingAppointment = (appointment) =>
  appointment?.status === 'PENDING' || appointment?.status === 'CONFIRMED'

export const deriveUpcomingAppointments = (appointments = []) =>
  appointments.filter(
    (appointment) =>
      appointment?.date &&
      new Date(appointment.date) >= new Date() &&
      appointment?.status !== 'CANCELLED'
  )

export const buildPatientDashboardStats = ({
  statsData,
  appointmentsData = [],
  recordsData = [],
  metricsData = [],
} = {}) => {
  const totalAppointments = appointmentsData.length
  const completedAppointments = appointmentsData.filter(
    (appointment) => appointment?.status === 'COMPLETED'
  ).length
  const upcomingAppointments = deriveUpcomingAppointments(appointmentsData).length
  const cancelledAppointments = appointmentsData.filter(
    (appointment) => appointment?.status === 'CANCELLED'
  ).length
  const activePrescriptions = recordsData.reduce((count, record) => {
    if (!Array.isArray(record?.prescriptions)) return count
    return count + record.prescriptions.length
  }, 0)
  const normalizedStats = statsData && typeof statsData === 'object' ? statsData : {}

  return {
    patientId: normalizedStats.patientId ?? null,
    totalAppointments: normalizedStats.totalAppointments ?? totalAppointments,
    completedAppointments: normalizedStats.completedAppointments ?? completedAppointments,
    upcomingAppointments: normalizedStats.upcomingAppointments ?? upcomingAppointments,
    cancelledAppointments: normalizedStats.cancelledAppointments ?? cancelledAppointments,
    totalMedicalRecords: normalizedStats.totalMedicalRecords ?? recordsData.length,
    totalPrescriptions:
      normalizedStats.totalPrescriptions ?? normalizedStats.activePrescriptions ?? activePrescriptions,
    activePrescriptions:
      normalizedStats.activePrescriptions ?? normalizedStats.totalPrescriptions ?? activePrescriptions,
    healthMetricsLogged: normalizedStats.healthMetricsLogged ?? metricsData.length,
    completionRate:
      normalizedStats.completionRate ??
      (totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 10000) / 100 : 0),
    avgAppointmentsPerMonth: normalizedStats.avgAppointmentsPerMonth ?? 0,
    frequentDoctorId: normalizedStats.frequentDoctorId ?? null,
    lastAppointmentDate: normalizedStats.lastAppointmentDate ?? null,
    pendingAppointments:
      normalizedStats.pendingAppointments ??
      appointmentsData.filter(isPendingAppointment).length,
  }
}

export default buildPatientDashboardStats
