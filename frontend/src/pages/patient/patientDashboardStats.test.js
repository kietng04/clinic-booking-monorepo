import { buildPatientDashboardStats, deriveUpcomingAppointments } from './patientDashboardStats'

describe('patientDashboardStats', () => {
  it('maps backend patient stats fields to the dashboard shape', () => {
    const result = buildPatientDashboardStats({
      statsData: {
        patientId: 953,
        upcomingAppointments: 3,
        completedAppointments: 9,
        totalPrescriptions: 6,
        totalMedicalRecords: 4,
        healthMetricsLogged: 11,
      },
      appointmentsData: [],
      recordsData: [],
      metricsData: [],
    })

    expect(result).toMatchObject({
      patientId: 953,
      upcomingAppointments: 3,
      completedAppointments: 9,
      totalMedicalRecords: 4,
      totalPrescriptions: 6,
      activePrescriptions: 6,
      healthMetricsLogged: 11,
    })
  })

  it('derives fallback values when aggregate stats are unavailable', () => {
    const appointments = [
      { date: '2099-03-10', status: 'PENDING' },
      { date: '2099-03-11', status: 'CONFIRMED' },
      { date: '2020-01-01', status: 'COMPLETED' },
      { date: '2020-01-02', status: 'CANCELLED' },
    ]
    const records = [
      { prescriptions: [{ id: 1 }, { id: 2 }] },
      { prescriptions: [{ id: 3 }] },
    ]
    const metrics = [{ id: 1 }, { id: 2 }, { id: 3 }]

    const result = buildPatientDashboardStats({
      appointmentsData: appointments,
      recordsData: records,
      metricsData: metrics,
    })

    expect(result).toMatchObject({
      totalAppointments: 4,
      completedAppointments: 1,
      upcomingAppointments: 2,
      cancelledAppointments: 1,
      totalMedicalRecords: 2,
      totalPrescriptions: 3,
      activePrescriptions: 3,
      healthMetricsLogged: 3,
    })
  })

  it('derives upcoming appointments from future non-cancelled entries', () => {
    const result = deriveUpcomingAppointments([
      { date: '2099-04-01', status: 'PENDING' },
      { date: '2099-04-02', status: 'CONFIRMED' },
      { date: '2099-04-03', status: 'CANCELLED' },
      { date: '2020-04-03', status: 'PENDING' },
    ])

    expect(result).toHaveLength(2)
  })
})
