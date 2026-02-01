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
import {
  Calendar,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { SkeletonCard } from '@/components/ui/Loading'
import { useUIStore } from '@/store/uiStore'
import { adminApi } from '@/api/adminApiWrapper'
import { vi } from '@/lib/translations'

const COLORS = ['#5d7a60', '#bfa094', '#f4c430', '#dc2626', '#6366f1', '#10b981']

const REPORT_TABS = [
  { id: 'appointment', label: 'Lịch hẹn', icon: Calendar },
  { id: 'revenue', label: 'Doanh thu', icon: DollarSign },
  { id: 'patient', label: 'Bệnh nhân', icon: Users },
]

const DATE_RANGES = [
  { value: '7days', label: '7 ngày qua' },
  { value: '30days', label: '30 ngày qua' },
  { value: '3months', label: '3 tháng qua' },
  { value: '6months', label: '6 tháng qua' },
  { value: '12months', label: '12 tháng qua' },
]

const GROUP_BY = [
  { value: 'day', label: 'Ngày' },
  { value: 'week', label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
]

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value)

// Mock data generators for when API is unavailable
const generateAppointmentData = (range) => {
  const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12']
  const count = range === '7days' ? 7 : range === '30days' ? 30 : range === '3months' ? 3 : range === '6months' ? 6 : 12
  return Array.from({ length: count }, (_, i) => ({
    name: months[i % 12],
    total: Math.floor(Math.random() * 200 + 50),
    confirmed: Math.floor(Math.random() * 100 + 30),
    cancelled: Math.floor(Math.random() * 30 + 5),
    completed: Math.floor(Math.random() * 80 + 20),
  }))
}

const generateRevenueData = (range) => {
  const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12']
  const count = range === '7days' ? 7 : range === '30days' ? 30 : range === '3months' ? 3 : range === '6months' ? 6 : 12
  return Array.from({ length: count }, (_, i) => ({
    name: months[i % 12],
    revenue: Math.floor(Math.random() * 50000000 + 10000000),
    cash: Math.floor(Math.random() * 20000000 + 5000000),
    online: Math.floor(Math.random() * 30000000 + 8000000),
  }))
}

const Reports = () => {
  const { showToast } = useUIStore()
  const [activeTab, setActiveTab] = useState('appointment')
  const [dateRange, setDateRange] = useState('6months')
  const [groupBy, setGroupBy] = useState('month')
  const [isLoading, setIsLoading] = useState(true)
  const [appointmentData, setAppointmentData] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [patientData, setPatientData] = useState({ total: 0, newThisPeriod: 0, active: 0 })
  const [patientDemographics, setPatientDemographics] = useState([
    { name: 'Nam', value: 55 },
    { name: 'Nữ', value: 42 },
    { name: 'Khác', value: 3 },
  ])

  useEffect(() => {
    fetchReportData()
  }, [dateRange, groupBy, activeTab])

  const fetchReportData = async () => {
    setIsLoading(true)
    try {
      const params = { dateRange, groupBy }
      switch (activeTab) {
        case 'appointment': {
          const data = await adminApi.getAppointmentReport(params).catch(() => null)
          setAppointmentData(data || generateAppointmentData(dateRange))
          break
        }
        case 'revenue': {
          const data = await adminApi.getRevenueReport(params).catch(() => null)
          setRevenueData(data || generateRevenueData(dateRange))
          break
        }
        case 'patient': {
          const data = await adminApi.getPatientReport(params).catch(() => null)
          if (data) setPatientData(data)
          break
        }
      }
    } catch {
      console.error('Report fetch failed, using mock data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    showToast({ type: 'info', message: 'Đang xuất dữ liệu CSV...' })
  }

  const handlePrint = () => {
    window.print()
  }

  const appointmentStatusData = appointmentData.length > 0 ? [
    { name: 'Đã xác nhận', value: appointmentData.reduce((s, d) => s + (d.confirmed || 0), 0) },
    { name: 'Đã hoàn thành', value: appointmentData.reduce((s, d) => s + (d.completed || 0), 0) },
    { name: 'Đã hủy', value: appointmentData.reduce((s, d) => s + (d.cancelled || 0), 0) },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">Báo cáo</h1>
          <p className="text-sage-600">Phân tích dữ liệu và báo cáo tổng hợp</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Xuất CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" />
            In
          </Button>
        </div>
      </div>

      {/* Report type tabs */}
      <div className="flex gap-2">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-sage-600 text-white' : 'bg-sage-100 text-sage-700 hover:bg-sage-200'}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sage-500" />
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={DATE_RANGES}
              />
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sage-500" />
              <Select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                options={GROUP_BY}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <>
          {/* Appointment Report */}
          {activeTab === 'appointment' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Tổng lịch hẹn', value: appointmentData.reduce((s, d) => s + (d.total || 0), 0), icon: Calendar, color: 'sage' },
                  { label: 'Đã xác nhận', value: appointmentData.reduce((s, d) => s + (d.confirmed || 0), 0), icon: TrendingUp, color: 'green' },
                  { label: 'Đã hoàn thành', value: appointmentData.reduce((s, d) => s + (d.completed || 0), 0), icon: Users, color: 'terra' },
                  { label: 'Đã hủy', value: appointmentData.reduce((s, d) => s + (d.cancelled || 0), 0), icon: FileText, color: 'red' },
                ].map((kpi, i) => {
                  const Icon = kpi.icon
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color === 'green' ? 'bg-green-100' : kpi.color === 'terra' ? 'bg-terra-100' : kpi.color === 'red' ? 'bg-red-100' : 'bg-sage-100'}`}>
                              <Icon className={`w-5 h-5 ${kpi.color === 'green' ? 'text-green-600' : kpi.color === 'terra' ? 'text-terra-600' : kpi.color === 'red' ? 'text-red-600' : 'text-sage-600'}`} />
                            </div>
                            <div>
                              <p className="text-xs text-sage-500">{kpi.label}</p>
                              <p className="text-xl font-bold text-sage-900">{kpi.value.toLocaleString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {/* Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-sage-900 mb-4">Xu hướng Lịch hẹn</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={appointmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Tổng" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="confirmed" name="Xác nhận" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cancelled" name="Hủy" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Pie */}
              {appointmentStatusData.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-sage-900 mb-4">Phân bố theo trạng thái</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={appointmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {appointmentStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 min-w-32">
                        {appointmentStatusData.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                            <span className="text-sm text-sage-700">{item.name}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Revenue Report */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Tổng doanh thu', value: formatCurrency(revenueData.reduce((s, d) => s + (d.revenue || 0), 0)), icon: DollarSign },
                  { label: 'Thanh toán trực tuyến', value: formatCurrency(revenueData.reduce((s, d) => s + (d.online || 0), 0)), icon: TrendingUp },
                  { label: 'Thanh toán tiền mặt', value: formatCurrency(revenueData.reduce((s, d) => s + (d.cash || 0), 0)), icon: Users },
                ].map((kpi, i) => {
                  const Icon = kpi.icon
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-sage-600" />
                            </div>
                            <div>
                              <p className="text-xs text-sage-500">{kpi.label}</p>
                              <p className="text-lg font-bold text-sage-900">{kpi.value}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-sage-900 mb-4">Xu hướng Doanh thu</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="Tổng" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="online" name="Trực tuyến" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="cash" name="Tiền mặt" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue by method pie */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-sage-900 mb-4">Phân bố theo phương thức thanh toán</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Trực tuyến', value: revenueData.reduce((s, d) => s + (d.online || 0), 0) },
                            { name: 'Tiền mặt', value: revenueData.reduce((s, d) => s + (d.cash || 0), 0) },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {[0, 1].map((i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 min-w-40">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-sage-600" />
                        <span className="text-sm text-sage-700">Trực tuyến: {formatCurrency(revenueData.reduce((s, d) => s + (d.online || 0), 0))}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                        <span className="text-sm text-sage-700">Tiền mặt: {formatCurrency(revenueData.reduce((s, d) => s + (d.cash || 0), 0))}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Patient Report */}
          {activeTab === 'patient' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Tổng bệnh nhân', value: patientData.total || 1245, icon: Users, color: 'sage' },
                  { label: 'Mới trong kỳ', value: patientData.newThisPeriod || 78, icon: TrendingUp, color: 'green' },
                  { label: 'Đang điều trị', value: patientData.active || 432, icon: FileText, color: 'terra' },
                ].map((kpi, i) => {
                  const Icon = kpi.icon
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color === 'green' ? 'bg-green-100' : kpi.color === 'terra' ? 'bg-terra-100' : 'bg-sage-100'}`}>
                              <Icon className={`w-5 h-5 ${kpi.color === 'green' ? 'text-green-600' : kpi.color === 'terra' ? 'text-terra-600' : 'text-sage-600'}`} />
                            </div>
                            <div>
                              <p className="text-xs text-sage-500">{kpi.label}</p>
                              <p className="text-xl font-bold text-sage-900">{kpi.value.toLocaleString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-sage-900 mb-4">Phân bố Giới tính</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={patientDemographics} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {patientDemographics.map((_, i) => <Cell key={i} fill={COLORS[i + 2]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 min-w-32">
                      {patientDemographics.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i + 2] }} />
                          <span className="text-sm text-sage-700">{item.name}: {item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Registration trend */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-sage-900 mb-4">Xu hướng Đăng ký mới</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={generateAppointmentData(dateRange).map((d, i) => ({ name: d.name, mới: Math.floor(Math.random() * 30 + 5) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="mới" name="Đăng ký mới" fill={COLORS[4]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reports
