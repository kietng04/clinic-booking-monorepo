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
import { Loading, SkeletonCard } from '@/components/ui/Loading'
import { formatDate, formatTime, getStatusColor, translateStatus, translateAppointmentType } from '@/lib/utils'

export function PatientDashboard() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [recentRecords, setRecentRecords] = useState([])
  const [healthMetrics, setHealthMetrics] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const patientDisplayName = (user?.name || user?.fullName || '').trim()
  const patientFirstName = patientDisplayName ? patientDisplayName.split(' ')[0] : 'Bạn'

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, appointmentsData, recordsData, metricsData] = await Promise.all([
        statsApi.getPatientStats(user.id),
        appointmentApi.getAppointments({ patientId: user.id }),
        medicalRecordApi.getRecords(user.id),
        healthMetricsApi.getMetrics(user.id),
      ])

      setStats(statsData)
      // Filter upcoming appointments
      const upcoming = appointmentsData.filter(
        (apt) => new Date(apt.date) >= new Date() && apt.status !== 'CANCELLED'
      ).slice(0, 3)
      setUpcomingAppointments(upcoming)
      setRecentRecords(recordsData.slice(0, 3))
      setHealthMetrics(metricsData.slice(0, 4))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-soft p-8 border border-sage-100 dark:border-sage-800 bg-gradient-to-br from-sage-50 to-terra-50 dark:from-sage-900/50 dark:to-terra-900/50"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-sage-900 dark:text-cream-100 mb-2">
              Chào mừng trở lại, {patientFirstName}! 👋
            </h1>
            <p className="text-sage-600 dark:text-sage-400">
              Tổng quan sức khỏe của bạn hôm nay
            </p>
          </div>
          <Link to="/appointments/book">
            <Button size="lg" leftIcon={<Plus className="w-5 h-5" />}>
              Đặt lịch khám
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Sắp tới',
            value: stats?.upcomingAppointments || 0,
            icon: Calendar,
            color: 'from-sage-500 to-sage-600',
            link: '/appointments',
          },
          {
            label: 'Đã hoàn thành',
            value: stats?.completedAppointments || 0,
            icon: FileText,
            color: 'from-terra-400 to-terra-500',
            link: '/appointments',
          },
          {
            label: 'Đơn thuốc',
            value: stats?.activePrescriptions || 0,
            icon: Heart,
            color: 'from-red-400 to-red-500',
            link: '/medical-records',
          },
          {
            label: 'Nhật ký',
            value: stats?.healthMetricsLogged || 0,
            icon: TrendingUp,
            color: 'from-blue-400 to-blue-500',
            link: '/health-metrics',
          },
        ].map((stat, index) => {
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
                      <p className="text-sm text-sage-600 dark:text-sage-400 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-display font-bold text-sage-900 dark:text-cream-100">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-soft bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      className="block p-4 rounded-soft bg-sage-50 dark:bg-sage-900/50 hover:bg-sage-100 dark:hover:bg-sage-800/50 transition-colors border border-sage-100 dark:border-sage-800"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={`https://i.pravatar.cc/150?img=${apt.doctorId}`}
                          name={apt.doctorName}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sage-900 dark:text-cream-100">
                                {apt.doctorName}
                              </p>
                              <p className="text-sm text-sage-600 dark:text-sage-400">
                                {apt.doctorSpecialization}
                              </p>
                            </div>
                            <Badge className={getStatusColor(apt.status)}>
                              {translateStatus(apt.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-sage-600 dark:text-sage-400">
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
                  <Calendar className="w-12 h-12 text-sage-300 dark:text-sage-700 mx-auto mb-3" />
                  <p className="text-sage-600 dark:text-sage-400 mb-4">
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
                      className="block p-4 rounded-soft bg-terra-50 dark:bg-terra-900/20 hover:bg-terra-100 dark:hover:bg-terra-900/30 transition-colors border border-terra-100 dark:border-terra-800"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-semibold text-sage-900 dark:text-cream-100">
                          {record.diagnosis}
                        </p>
                        <span className="text-xs text-sage-500 dark:text-sage-400 whitespace-nowrap">
                          {formatDate(record.date)}
                        </span>
                      </div>
                      <p className="text-sm text-sage-600 dark:text-sage-400 mb-2">
                        Dr. {record.doctorName}
                      </p>
                      {record.vitalSigns && (
                        <div className="flex gap-4 text-xs text-sage-500 dark:text-sage-400">
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
                  <FileText className="w-12 h-12 text-sage-300 dark:text-sage-700 mx-auto mb-3" />
                  <p className="text-sage-600 dark:text-sage-400">
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
                    className="p-4 rounded-soft bg-gradient-to-br from-sage-50 to-cream-100 dark:from-sage-900/30 dark:to-sage-800/30 border border-sage-100 dark:border-sage-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Activity className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                      <span className="text-xs text-sage-500 dark:text-sage-400">
                        {formatDate(metric.date || metric.measuredAt || metric.recordedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-sage-600 dark:text-sage-400 mb-1">
                      {String(metric.type || metric.metricType || 'N/A').replaceAll('_', ' ')}
                    </p>
                    <p className="text-2xl font-display font-bold text-sage-900 dark:text-cream-100">
                      {metric.value}
                      <span className="text-sm font-normal text-sage-500 dark:text-sage-400 ml-1">
                        {metric.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-sage-300 dark:text-sage-700 mx-auto mb-3" />
                <p className="text-sage-600 dark:text-sage-400 mb-4">
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
