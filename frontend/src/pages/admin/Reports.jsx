import { useEffect, useMemo, useState } from 'react'
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
import { adminApi } from '@/api/realApis/adminApi'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'

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
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(Number(value ?? 0))

const normalizeAppointmentReport = (data) => {
  if (!data || typeof data !== 'object') return null

  return {
    totalAppointments: Number(data.totalAppointments ?? 0),
    confirmed: Number(data.confirmed ?? 0),
    completed: Number(data.completed ?? 0),
    cancelled: Number(data.cancelled ?? 0),
    monthlyTrend: Array.isArray(data.monthlyTrend)
      ? data.monthlyTrend.map((item) => ({
          name: item?.month ?? '',
          total: Number(item?.total ?? 0),
          confirmed: Number(item?.confirmed ?? 0),
          completed: Number(item?.completed ?? 0),
          cancelled: Number(item?.cancelled ?? 0),
        }))
      : [],
  }
}

const normalizeRevenueReport = (data) => {
  if (!data || typeof data !== 'object') return null

  return {
    totalRevenue: Number(data.totalRevenue ?? 0),
    onlinePayment: Number(data.onlinePayment ?? 0),
    cashPayment: Number(data.cashPayment ?? 0),
    monthlyTrend: Array.isArray(data.monthlyTrend)
      ? data.monthlyTrend.map((item) => ({
          name: item?.month ?? '',
          revenue: Number(item?.revenue ?? 0),
          online: Number(item?.online ?? 0),
          cash: Number(item?.cash ?? 0),
        }))
      : [],
  }
}

const normalizePatientReport = (data) => {
  if (!data || typeof data !== 'object') return null

  return {
    totalPatients: Number(data.totalPatients ?? 0),
    newPatients: Number(data.newPatients ?? 0),
    activePatients: Number(data.activePatients ?? 0),
  }
}

const hasSeriesData = (series, key) =>
  Array.isArray(series) &&
  series.length > 0 &&
  series.some((item) => Number(item?.[key] ?? 0) > 0)

const EmptyChartState = ({ title, message }) => (
  <Card>
    <CardContent className="p-6">
      <h3 className="font-semibold text-sage-900 mb-4">{title}</h3>
      <div className="flex h-[240px] items-center justify-center rounded-xl border border-dashed border-sage-200 bg-sage-50/70 px-6 text-center text-sm text-sage-500">
        {message}
      </div>
    </CardContent>
  </Card>
)

const Reports = () => {
  const { showToast } = useUIStore()
  const [activeTab, setActiveTab] = useState('appointment')
  const [dateRange, setDateRange] = useState('6months')
  const [groupBy, setGroupBy] = useState('month')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [appointmentReport, setAppointmentReport] = useState(null)
  const [revenueReport, setRevenueReport] = useState(null)
  const [patientReport, setPatientReport] = useState(null)

  useEffect(() => {
    fetchReportData()
  }, [dateRange, groupBy])

  const fetchReportData = async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const params = { dateRange, groupBy }
      const [appointmentResult, revenueResult, patientResult] = await Promise.allSettled([
        adminApi.getAppointmentReport(params),
        adminApi.getRevenueReport(params),
        adminApi.getPatientReport(params),
      ])

      setAppointmentReport(
        appointmentResult.status === 'fulfilled'
          ? normalizeAppointmentReport(appointmentResult.value)
          : null
      )
      setRevenueReport(
        revenueResult.status === 'fulfilled'
          ? normalizeRevenueReport(revenueResult.value)
          : null
      )
      setPatientReport(
        patientResult.status === 'fulfilled' ? normalizePatientReport(patientResult.value) : null
      )

      const failures = [appointmentResult, revenueResult, patientResult].filter(
        (result) => result.status === 'rejected'
      )

      if (failures.length === 3) {
        const message = extractApiErrorMessage(
          failures[0].reason,
          'Không thể tải dữ liệu báo cáo'
        )
        setLoadError(message)
        showToast({ type: 'error', message })
      } else if (failures.length > 0) {
        setLoadError('Một số phần báo cáo chưa tải được từ backend.')
      }
    } catch (error) {
      const message = extractApiErrorMessage(error, 'Không thể tải dữ liệu báo cáo')
      setAppointmentReport(null)
      setRevenueReport(null)
      setPatientReport(null)
      setLoadError(message)
      showToast({ type: 'error', message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPdf = async () => {
    try {
      showToast({ type: 'info', message: 'Đang xuất báo cáo PDF...' })
      const blob = await adminApi.exportReport('pdf', { dateRange, groupBy })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `bao-cao-tong-hop-${new Date().toISOString().slice(0, 10)}.pdf`
      link.style.display = 'none'
      document.body.appendChild(link)

      setTimeout(() => {
        link.click()
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 100)
      }, 0)

      showToast({ type: 'success', message: 'Xuất báo cáo thành công!' })
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể xuất báo cáo'),
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const appointmentStatusData = useMemo(() => {
    if (!appointmentReport) return []

    return [
      { name: 'Đã xác nhận', value: appointmentReport.confirmed },
      { name: 'Đã hoàn thành', value: appointmentReport.completed },
      { name: 'Đã hủy', value: appointmentReport.cancelled },
    ].filter((item) => item.value > 0)
  }, [appointmentReport])

  const paymentMethodData = useMemo(() => {
    if (!revenueReport) return []

    return [
      { name: 'Trực tuyến', value: revenueReport.onlinePayment },
      { name: 'Tiền mặt', value: revenueReport.cashPayment },
    ].filter((item) => item.value > 0)
  }, [revenueReport])

  const hasAppointmentTrend = hasSeriesData(appointmentReport?.monthlyTrend, 'total')
  const hasRevenueTrend = hasSeriesData(revenueReport?.monthlyTrend, 'revenue')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">Báo cáo</h1>
          <p className="text-sage-600">Phân tích dữ liệu và báo cáo tổng hợp</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <Download className="w-4 h-4 mr-1" />
            Xuất PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" />
            In
          </Button>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      ) : null}

      <div className="flex gap-2">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-sage-600 text-white' : 'bg-sage-100 text-sage-700 hover:bg-sage-200'}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sage-500" />
              <Select
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
                options={DATE_RANGES}
              />
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sage-500" />
              <Select
                value={groupBy}
                onChange={(event) => setGroupBy(event.target.value)}
                options={GROUP_BY}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          {activeTab === 'appointment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Tổng lịch hẹn',
                    value: appointmentReport?.totalAppointments ?? 0,
                    icon: Calendar,
                    color: 'sage',
                  },
                  {
                    label: 'Đã xác nhận',
                    value: appointmentReport?.confirmed ?? 0,
                    icon: TrendingUp,
                    color: 'green',
                  },
                  {
                    label: 'Đã hoàn thành',
                    value: appointmentReport?.completed ?? 0,
                    icon: Users,
                    color: 'terra',
                  },
                  {
                    label: 'Đã hủy',
                    value: appointmentReport?.cancelled ?? 0,
                    icon: FileText,
                    color: 'red',
                  },
                ].map((kpi, index) => {
                  const Icon = kpi.icon
                  return (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
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

              {hasAppointmentTrend ? (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-sage-900 mb-4">Xu hướng Lịch hẹn</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={appointmentReport.monthlyTrend}>
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
              ) : (
                <EmptyChartState
                  title="Xu hướng Lịch hẹn"
                  message="Backend chưa trả về dữ liệu xu hướng lịch hẹn cho bộ lọc hiện tại."
                />
              )}

              {appointmentStatusData.length > 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-sage-900 mb-4">Phân bố theo trạng thái</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={appointmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {appointmentStatusData.map((item, index) => (
                              <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 min-w-32">
                        {appointmentStatusData.map((item, index) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-sm text-sage-700">{item.name}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <EmptyChartState
                  title="Phân bố theo trạng thái"
                  message="Backend chưa có dữ liệu trạng thái lịch hẹn để hiển thị."
                />
              )}
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Tổng doanh thu',
                    value: formatCurrency(revenueReport?.totalRevenue ?? 0),
                    icon: DollarSign,
                  },
                  {
                    label: 'Thanh toán trực tuyến',
                    value: formatCurrency(revenueReport?.onlinePayment ?? 0),
                    icon: TrendingUp,
                  },
                  {
                    label: 'Thanh toán tiền mặt',
                    value: formatCurrency(revenueReport?.cashPayment ?? 0),
                    icon: Users,
                  },
                ].map((kpi, index) => {
                  const Icon = kpi.icon
                  return (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
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

              {hasRevenueTrend ? (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-sage-900 mb-4">Xu hướng Doanh thu</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueReport.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Tổng" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="online" name="Trực tuyến" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="cash" name="Tiền mặt" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <EmptyChartState
                  title="Xu hướng Doanh thu"
                  message="Backend chưa trả về dữ liệu xu hướng doanh thu cho bộ lọc hiện tại."
                />
              )}

              {paymentMethodData.length > 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-sage-900 mb-4">Phân bố theo phương thức thanh toán</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={paymentMethodData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {paymentMethodData.map((item, index) => (
                              <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 min-w-40">
                        {paymentMethodData.map((item, index) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-sm text-sage-700">{item.name}: {formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <EmptyChartState
                  title="Phân bố theo phương thức thanh toán"
                  message="Backend chưa cung cấp dữ liệu tách theo phương thức thanh toán."
                />
              )}
            </div>
          )}

          {activeTab === 'patient' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Tổng bệnh nhân',
                    value: patientReport?.totalPatients ?? 0,
                    icon: Users,
                    color: 'sage',
                  },
                  {
                    label: 'Mới trong kỳ',
                    value: patientReport?.newPatients ?? 0,
                    icon: TrendingUp,
                    color: 'green',
                  },
                  {
                    label: 'Đang điều trị',
                    value: patientReport?.activePatients ?? 0,
                    icon: FileText,
                    color: 'terra',
                  },
                ].map((kpi, index) => {
                  const Icon = kpi.icon
                  return (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
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

              <EmptyChartState
                title="Phân bố Giới tính"
                message="API báo cáo bệnh nhân hiện chưa trả về dữ liệu phân bố giới tính."
              />

              <EmptyChartState
                title="Xu hướng Đăng ký mới"
                message="API báo cáo bệnh nhân hiện chưa trả về dữ liệu xu hướng đăng ký mới."
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reports
