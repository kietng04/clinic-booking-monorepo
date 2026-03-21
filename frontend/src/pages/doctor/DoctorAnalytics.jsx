import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Users, Calendar, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { statsApi } from '@/api/realApis/statsApi'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'
import { withRetry } from '@/utils/apiRetry'
import { vi } from '@/lib/translations'

const DATE_RANGE_OPTIONS = [
  { value: '3months', label: '3 tháng gần nhất' },
  { value: '6months', label: '6 tháng gần nhất' },
]

const COLORS = ['#5d7a60', '#bfa094', '#f4c430', '#82ca9d']

const APPOINTMENT_TYPE_LABELS = {
  IN_PERSON: 'Khám trực tiếp',
  ONLINE: 'Tư vấn trực tuyến',
  FOLLOW_UP: 'Tái khám',
  EMERGENCY: 'Khẩn cấp',
}

const STAT_STYLES = {
  sage: {
    container: 'bg-sage-100',
    icon: 'text-sage-600',
  },
  terra: {
    container: 'bg-terra-100',
    icon: 'text-terra-600',
  },
  green: {
    container: 'bg-green-100',
    icon: 'text-green-600',
  },
  yellow: {
    container: 'bg-yellow-100',
    icon: 'text-yellow-600',
  },
}

const normalizeDoctorAnalytics = (data = {}) => ({
  appointments: Array.isArray(data?.appointments)
    ? data.appointments.map((item) => ({
        month: item?.month ?? '',
        count: Number(item?.count ?? 0),
        completed: Number(item?.completed ?? 0),
        revenue: Number(item?.revenue ?? 0),
      }))
    : [],
  appointmentTypes: Array.isArray(data?.appointmentTypes)
    ? data.appointmentTypes.map((item) => ({
        name: APPOINTMENT_TYPE_LABELS[item?.name] ?? item?.name ?? 'Khác',
        value: Number(item?.value ?? item?.count ?? 0),
      }))
    : [],
  timeSlots: Array.isArray(data?.timeSlots)
    ? data.timeSlots.map((item) => ({
        time: item?.time ?? 'N/A',
        bookings: Number(item?.bookings ?? 0),
      }))
    : [],
  patientDemographics: {
    ageDistribution: Array.isArray(data?.patientDemographics?.ageDistribution)
      ? data.patientDemographics.ageDistribution.map((item) => ({
          range: item?.range ?? 'N/A',
          count: Number(item?.count ?? 0),
        }))
      : [],
    genderRatio: Array.isArray(data?.patientDemographics?.genderRatio)
      ? data.patientDemographics.genderRatio.map((item) => ({
          name: item?.name ?? item?.gender ?? 'Khác',
          value: Number(item?.value ?? item?.percentage ?? item?.count ?? 0),
          count: Number(item?.count ?? 0),
        }))
      : [],
  },
})

const transformDataByDateRange = (data, range) => {
  if (!data) return null
  if (range === '3months') {
    return {
      ...data,
      appointments: data.appointments?.slice(-3) || [],
    }
  }
  return data
}

const hasItems = (items, key) =>
  Array.isArray(items) &&
  items.length > 0 &&
  (key ? items.some((item) => Number(item?.[key] ?? 0) > 0) : true)

const hasAnalyticsData = (analytics) =>
  Boolean(
    analytics &&
      (
        hasItems(analytics.appointments, 'count') ||
        hasItems(analytics.appointmentTypes, 'value') ||
        hasItems(analytics.timeSlots, 'bookings') ||
        hasItems(analytics.patientDemographics?.ageDistribution, 'count') ||
        hasItems(analytics.patientDemographics?.genderRatio, 'value')
      )
  )

const EmptyChartState = ({ message, height = 300 }) => (
  <div
    className="flex items-center justify-center rounded-xl border border-dashed border-sage-200 bg-sage-50/70 text-sm text-sage-500 text-center px-6"
    style={{ height }}
  >
    {message}
  </div>
)

const DoctorAnalytics = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [dateRange, setDateRange] = useState('6months')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user?.id, dateRange])

  const fetchData = async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const [statsResult, analyticsResult] = await Promise.allSettled([
        withRetry(
          () => statsApi.getDoctorStats(user.id),
          { maxRetries: 2, initialDelay: 500 }
        ),
        withRetry(
          () => statsApi.getDoctorAnalyticsDashboard(user.id),
          { maxRetries: 3, initialDelay: 800, backoffMultiplier: 2 }
        ),
      ])

      const statsData = statsResult.status === 'fulfilled' ? statsResult.value : null
      const analyticsData =
        analyticsResult.status === 'fulfilled'
          ? transformDataByDateRange(normalizeDoctorAnalytics(analyticsResult.value), dateRange)
          : null

      setStats(statsData)
      setAnalytics(analyticsData)

      if (statsResult.status === 'rejected' && analyticsResult.status === 'rejected') {
        const message = extractApiErrorMessage(
          analyticsResult.reason || statsResult.reason,
          'Không thể tải dữ liệu phân tích'
        )
        setLoadError(message)
        showToast({ type: 'error', message })
      } else if (analyticsResult.status === 'rejected') {
        setLoadError(
          extractApiErrorMessage(
            analyticsResult.reason,
            'Không thể tải dữ liệu biểu đồ phân tích'
          )
        )
      } else if (!hasAnalyticsData(analyticsData)) {
        setLoadError('Chưa có dữ liệu biểu đồ phân tích cho giai đoạn này.')
      }
    } catch (error) {
      const message = extractApiErrorMessage(error, 'Không thể tải dữ liệu phân tích')
      setStats(null)
      setAnalytics(null)
      setLoadError(message)
      showToast({ type: 'error', message })
    } finally {
      setIsLoading(false)
    }
  }

  const overviewStats = [
    {
      label: vi.doctor.analytics.totalPatients,
      value: stats?.totalPatients ?? stats?.uniquePatients ?? 0,
      icon: Users,
      color: 'sage',
    },
    {
      label: vi.doctor.analytics.totalAppointments,
      value: stats?.totalAppointments ?? 0,
      icon: Calendar,
      color: 'terra',
    },
    {
      label: vi.doctor.analytics.completionRate,
      value: `${stats?.completionRate ?? 0}%`,
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: vi.doctor.analytics.avgRating,
      value: stats?.avgRating ? stats.avgRating.toFixed(1) : '0.0',
      icon: Star,
      color: 'yellow',
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  const noStatsAndNoAnalytics = !stats && !hasAnalyticsData(analytics)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
            {vi.doctor.analytics.title}
          </h1>
          <p className="text-sage-600">Theo dõi hiệu suất và xu hướng của bạn</p>
        </div>
        <div className="w-full md:w-60">
          <Select
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value)}
            options={DATE_RANGE_OPTIONS}
          />
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      ) : null}

      {noStatsAndNoAnalytics ? (
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <p className="text-sage-700">Không có dữ liệu phân tích để hiển thị.</p>
            <Button onClick={fetchData}>Tải lại</Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = STAT_STYLES[stat.color] || STAT_STYLES.sage

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses.container}`}>
                    <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                  </div>
                  <p className="text-sm font-medium text-sage-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-sage-900">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{vi.doctor.analytics.appointmentsTrend}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasItems(analytics?.appointments, 'count') ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.appointments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#5d7a60"
                    strokeWidth={2}
                    name="Lịch hẹn"
                    dot={{ fill: '#5d7a60', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#bfa094"
                    strokeWidth={2}
                    name="Hoàn thành"
                    dot={{ fill: '#bfa094', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Chưa có dữ liệu lịch hẹn theo tháng từ backend." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{vi.doctor.analytics.revenue}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasItems(analytics?.appointments, 'revenue') ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.appointments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value) => [`${Number(value || 0).toLocaleString()} VND`, 'Doanh thu']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#5d7a60" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Chưa có dữ liệu doanh thu theo tháng từ backend." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{vi.doctor.analytics.appointmentTypes}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasItems(analytics?.appointmentTypes, 'value') ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.appointmentTypes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {analytics.appointmentTypes.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Chưa có dữ liệu phân loại lịch hẹn từ backend." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{vi.doctor.analytics.popularTimeSlots}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasItems(analytics?.timeSlots, 'bookings') ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.timeSlots} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis
                    type="category"
                    dataKey="time"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="bookings" fill="#bfa094" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Chưa có dữ liệu khung giờ phổ biến từ backend." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{vi.doctor.analytics.ageDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasItems(analytics?.patientDemographics?.ageDistribution, 'count') ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.patientDemographics.ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="range" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#5d7a60" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState
                height={250}
                message="Chưa có dữ liệu phân bố độ tuổi bệnh nhân từ backend."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{vi.doctor.analytics.genderRatio}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasItems(analytics?.patientDemographics?.genderRatio, 'value') ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.patientDemographics.genderRatio}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                  >
                    {analytics.patientDemographics.genderRatio.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState
                height={250}
                message="Chưa có dữ liệu tỷ lệ giới tính bệnh nhân từ backend."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DoctorAnalytics
