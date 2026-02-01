import { useState, useEffect } from 'react'
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
import { TrendingUp, Users, Calendar, DollarSign, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { statsApi } from '@/api/realApis/statsApi'
import { mockDoctorAnalytics } from '@/api/mockData'
import { vi } from '@/lib/translations'

const DoctorAnalytics = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [dateRange, setDateRange] = useState('6months')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user?.id, dateRange])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [statsData, analyticsData] = await Promise.all([
        statsApi.getDoctorStats(user.id),
        statsApi.getDoctorAnalyticsDashboard(user.id),
      ])
      setStats(statsData)
      setAnalytics(transformDataByDateRange(analyticsData, dateRange))
    } catch (error) {
      console.error('Failed to load doctor analytics:', error)
      showToast({ type: 'error', message: 'Không thể tải dữ liệu phân tích' })
      setAnalytics(mockDoctorAnalytics)
    } finally {
      setIsLoading(false)
    }
  }

  const transformDataByDateRange = (data, range) => {
    if (range === '3months') {
      return {
        ...data,
        appointments: data.appointments?.slice(-3) || [],
      }
    }
    return data
  }

  const COLORS = ['#5d7a60', '#bfa094', '#f4c430', '#82ca9d']

  const overviewStats = [
    {
      label: vi.doctor.analytics.totalPatients,
      value: stats?.totalPatients || 0,
      icon: Users,
      color: 'sage',
    },
    {
      label: vi.doctor.analytics.totalAppointments,
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      color: 'terra',
    },
    {
      label: vi.doctor.analytics.completionRate,
      value: stats?.completionRate ? `${stats.completionRate}%` : '0%',
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

  if (!analytics) {
    return <div className="text-center py-12 text-sage-600">No data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
          {vi.doctor.analytics.title}
        </h1>
        <p className="text-sage-600">Theo dõi hiệu suất và xu hướng của bạn</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <p className="text-sm font-medium text-sage-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-sage-900">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Appointments & Revenue Trend */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{vi.doctor.analytics.appointmentsTrend}</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{vi.doctor.analytics.revenue}</CardTitle>
          </CardHeader>
          <CardContent>
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
                  formatter={(value) => [`${value.toLocaleString()} VND`, 'Doanh thu']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="revenue" fill="#5d7a60" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Types & Time Slots */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{vi.doctor.analytics.appointmentTypes}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.appointmentTypes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                >
                  {analytics.appointmentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{vi.doctor.analytics.popularTimeSlots}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.timeSlots} layout="horizontal">
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
          </CardContent>
        </Card>
      </div>

      {/* Patient Demographics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{vi.doctor.analytics.ageDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.patientDemographics.ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#5d7a60" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{vi.doctor.analytics.genderRatio}</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <Cell fill="#5d7a60" />
                  <Cell fill="#bfa094" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DoctorAnalytics
