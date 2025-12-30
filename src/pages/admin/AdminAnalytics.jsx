import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Users, Calendar, DollarSign, TrendingUp, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { mockAdminAnalytics } from '@/api/mockData'
import { vi } from '@/lib/translations'

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState('12months')
  const analytics = mockAdminAnalytics

  const COLORS = ['#5d7a60', '#bfa094', '#f4c430', '#dc2626']

  const kpiCards = [
    {
      label: vi.admin.analytics.totalRevenue,
      value: '1.65 tỷ VND',
      change: '+22.5%',
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Tổng Lịch hẹn',
      value: '3,421',
      change: '+15.2%',
      icon: Calendar,
      color: 'sage',
    },
    {
      label: vi.admin.analytics.activeUsers,
      value: '895',
      change: '+8.1%',
      icon: Users,
      color: 'terra',
    },
    {
      label: 'Tỷ lệ Hài lòng',
      value: '4.8/5.0',
      change: '+0.2',
      icon: TrendingUp,
      color: 'yellow',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
            {vi.admin.analytics.title}
          </h1>
          <p className="text-sage-600">Phân tích toàn diện hoạt động hệ thống</p>
        </div>
        <div className="flex gap-3">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: '6months', label: '6 tháng qua' },
              { value: '12months', label: '12 tháng qua' },
            ]}
          />
          <Button variant="outline" leftIcon={<Download />}>
            {vi.analytics.exportData}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-${kpi.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${kpi.color}-600`} />
                    </div>
                    <span className="text-sm font-medium text-green-600">{kpi.change}</span>
                  </div>
                  <p className="text-sm font-medium text-sage-600 mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-sage-900">{kpi.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Revenue Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>{vi.admin.analytics.revenueChart} - {vi.admin.analytics.comparison}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analytics.revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={(value) => [`${(value / 1000000).toFixed(1)}M VND`, '']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="thisYear"
                stroke="#5d7a60"
                strokeWidth={2}
                name={vi.admin.analytics.thisYear}
                dot={{ fill: '#5d7a60', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="lastYear"
                stroke="#bfa094"
                strokeWidth={2}
                strokeDasharray="5 5"
                name={vi.admin.analytics.lastYear}
                dot={{ fill: '#bfa094', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Growth */}
      <Card>
        <CardHeader>
          <CardTitle>{vi.admin.analytics.userGrowthChart}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={analytics.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="patients"
                stackId="1"
                stroke="#5d7a60"
                fill="#5d7a60"
                fillOpacity={0.6}
                name="Bệnh nhân"
              />
              <Area
                type="monotone"
                dataKey="doctors"
                stackId="1"
                stroke="#bfa094"
                fill="#bfa094"
                fillOpacity={0.6}
                name="Bác sĩ"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Appointment Trends & Status Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{vi.admin.analytics.appointmentTrends}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analytics.appointmentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#5d7a60" name="Tổng" radius={[8, 8, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#bfa094"
                  strokeWidth={2}
                  name="Hoàn thành"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bố Trạng thái Lịch hẹn</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.appointmentStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {analytics.appointmentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Specialization Distribution & Top Doctors */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{vi.admin.analytics.specializationDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.specializationDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="specialization" stroke="#6b7280" style={{ fontSize: '11px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#5d7a60" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{vi.admin.analytics.topDoctors}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topDoctors.slice(0, 5).map((doctor, index) => (
                <div key={doctor.id} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sage-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sage-900">{doctor.name}</p>
                      <p className="text-sm text-sage-600">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sage-900">{doctor.appointments}</p>
                    <p className="text-xs text-sage-600">lịch hẹn</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminAnalytics
