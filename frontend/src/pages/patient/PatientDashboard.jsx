import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  FileText,
  Heart,
  Plus,
  Clock,
  Video,
  MapPin,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { statsApi } from '@/api/statsApiWrapper'
import { healthMetricsApi } from '@/api/healthMetricsApiWrapper'
import { medicalRecordApi } from '@/api/medicalRecordApiWrapper'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Loading'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatDate, getStatusColor, translateStatus } from '@/lib/utils'
import { buildPatientDashboardStats, deriveUpcomingAppointments } from './patientDashboardStats'

export function PatientDashboard() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [recentRecords, setRecentRecords] = useState([])
  const [healthMetrics, setHealthMetrics] = useState([])

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id])

  const patientDisplayName = (user?.name || user?.fullName || '').trim()
  const patientFirstName = patientDisplayName ? patientDisplayName.split(' ')[0] : 'Bạn'

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResult, appointmentsResult, recordsResult, metricsResult] = await Promise.allSettled([
        statsApi.getPatientStats(user.id),
        appointmentApi.getAppointments({ patientId: user.id }),
        medicalRecordApi.getRecords(user.id),
        healthMetricsApi.getMetrics(user.id),
      ])

      const statsData = statsResult.status === 'fulfilled' ? statsResult.value : null
      const appointmentsData = appointmentsResult.status === 'fulfilled' ? appointmentsResult.value : []
      const recordsData = recordsResult.status === 'fulfilled' ? recordsResult.value : []
      const metricsData = metricsResult.status === 'fulfilled' ? metricsResult.value : []

      setStats(buildPatientDashboardStats({
        statsData,
        appointmentsData,
        recordsData,
        metricsData,
      }))
      setUpcomingAppointments(deriveUpcomingAppointments(appointmentsData).slice(0, 3))
      setRecentRecords(recordsData.slice(0, 3))
      setHealthMetrics(metricsData.slice(0, 4))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Lịch hẹn sắp tới',
      value: stats?.upcomingAppointments || 0,
      icon: Calendar,
      iconClassName: 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300',
      link: '/appointments',
    },
    {
      label: 'Đã hoàn thành',
      value: stats?.completedAppointments || 0,
      icon: FileText,
      iconClassName: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
      link: '/appointments',
    },
    {
      label: 'Đơn thuốc hoạt động',
      value: stats?.activePrescriptions || 0,
      icon: Heart,
      iconClassName: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
      link: '/medical-records',
    },
    {
      label: 'Chỉ số đã ghi',
      value: stats?.healthMetricsLogged || 0,
      icon: TrendingUp,
      iconClassName: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      link: '/health-metrics',
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title={`Chào mừng trở lại, ${patientFirstName}`}
          description="Theo dõi nhanh lịch hẹn, hồ sơ bệnh án và chỉ số sức khỏe trong một màn hình tổng quan rõ ràng."
          action={(
            <Link to="/appointments/book">
              <Button size="lg" leftIcon={<Plus className="w-5 h-5" />}>
                Đặt lịch khám
              </Button>
            </Link>
          )}
        />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={stat.link}>
                <Card hover className="h-full">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClassName}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lịch hẹn sắp tới</CardTitle>
                  <CardDescription>Các cuộc tư vấn đã lên lịch</CardDescription>
                </div>
                <Link to="/appointments">
                  <Button variant="ghost" size="sm">Xem tất cả</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => (
                    <Link
                      key={apt.id}
                      to={`/appointments/${apt.id}`}
                      className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={apt.doctorAvatar || `https://i.pravatar.cc/150?u=doctor-${apt.doctorId || apt.id}`}
                          name={apt.doctorName}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {apt.doctorName}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {apt.doctorSpecialization}
                              </p>
                            </div>
                            <Badge className={getStatusColor(apt.status)}>
                              {translateStatus(apt.status)}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(apt.date)} at {apt.time}
                            </div>
                            <div className="flex items-center gap-1">
                              {apt.type === 'ONLINE' ? (
                                <>
                                  <Video className="w-4 h-4" />
                                  Trực tuyến
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-4 h-4" />
                                  Trực tiếp
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-700" />
                  <p className="mb-4 text-slate-600 dark:text-slate-400">
                    Không có lịch hẹn sắp tới
                  </p>
                  <Link to="/appointments/book">
                    <Button size="sm">Đặt lịch ngay</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Medical Records */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hồ sơ bệnh án</CardTitle>
                  <CardDescription>Tư vấn và chẩn đoán gần đây</CardDescription>
                </div>
                <Link to="/medical-records">
                  <Button variant="ghost" size="sm">Xem tất cả</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentRecords.length > 0 ? (
                <div className="space-y-4">
                  {recentRecords.map((record) => (
                    <Link
                      key={record.id}
                      to={`/medical-records/${record.id}`}
                      className="block rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {record.diagnosis}
                        </p>
                        <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(record.date)}
                        </span>
                      </div>
                      <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                        Dr. {record.doctorName}
                      </p>
                      {record.vitalSigns && (
                        <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span>BP: {record.vitalSigns.bloodPressure}</span>
                          <span>HR: {record.vitalSigns.heartRate} bpm</span>
                          <span>Weight: {record.vitalSigns.weight} lbs</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-700" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Chưa có hồ sơ bệnh án
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Health Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Chỉ số sức khỏe gần đây</CardTitle>
                <CardDescription>Theo dõi các chỉ số sinh tồn theo thời gian</CardDescription>
              </div>
              <Link to="/health-metrics">
                <Button variant="ghost" size="sm">Xem tất cả</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {healthMetrics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {healthMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Activity className="h-5 w-5 text-brand-600 dark:text-brand-300" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(metric.date || metric.measuredAt || metric.recordedAt)}
                      </span>
                    </div>
                    <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
                      {String(metric.type || metric.metricType || 'N/A').replaceAll('_', ' ')}
                    </p>
                    <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                      {metric.value}
                      <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">
                        {metric.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-center py-8">
                  <Heart className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-700" />
                  <p className="mb-4 text-slate-600 dark:text-slate-400">
                    Bắt đầu theo dõi chỉ số sức khỏe của bạn
                  </p>
                <Link to="/health-metrics">
                  <Button size="sm">Thêm chỉ số</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
