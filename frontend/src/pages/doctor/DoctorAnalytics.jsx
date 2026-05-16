import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CircleDollarSign,
  RefreshCw,
  Stethoscope,
  Users,
  Video,
  XCircle,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { Card, CardContent } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { doctorPrimaryActiveClass, DOCTOR_PRIMARY } from './theme'

const DATE_FILTERS = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7days', label: '7 ngày qua' },
  { value: '30days', label: '30 ngày qua' },
  { value: 'custom', label: 'Tùy chọn ngày' },
]

const TREND_GROUPS = [
  { value: 'day', label: 'Theo ngày' },
  { value: 'week', label: 'Theo tuần' },
  { value: 'month', label: 'Theo tháng' },
]

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalDate(dateString, timeString) {
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number)
    let hours = 0
    let minutes = 0

    if (typeof timeString === 'string' && /^\d{2}:\d{2}/.test(timeString)) {
      ;[hours, minutes] = timeString.slice(0, 5).split(':').map(Number)
    }

    return new Date(year, month - 1, day, hours, minutes)
  }

  const parsed = new Date(dateString || timeString || '')
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getAmount(appointment) {
  const candidates = [
    appointment.serviceFee,
    appointment.amount,
    appointment.price,
    appointment.consultationFee,
    appointment.fee,
  ]

  const value = candidates.find((item) => Number.isFinite(Number(item)) && Number(item) > 0)
  return Number(value || 0)
}

function startOfWeek(date) {
  const next = new Date(date)
  const day = next.getDay()
  const diff = day === 0 ? -6 : 1 - day
  next.setDate(next.getDate() + diff)
  next.setHours(0, 0, 0, 0)
  return next
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date, count) {
  const next = new Date(date)
  next.setDate(next.getDate() + count)
  return next
}

function addWeeks(date, count) {
  return addDays(date, count * 7)
}

function addMonths(date, count) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + count)
  return next
}

function getFilterRange(filter, customFrom, customTo) {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  if (filter === 'today') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }

  if (filter === '7days') {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }

  if (filter === '30days') {
    const start = new Date(now)
    start.setDate(start.getDate() - 29)
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }

  const start = customFrom ? new Date(`${customFrom}T00:00:00`) : null
  const customEnd = customTo ? new Date(`${customTo}T23:59:59`) : null

  return { start, end: customEnd }
}

function isWithinRange(date, range) {
  if (!date) return false
  if (range.start && date < range.start) return false
  if (range.end && date > range.end) return false
  return true
}

function formatCompactDate(date) {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function formatMonthLabel(date) {
  return date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })
}

function getTrendData(appointments, grouping, range) {
  if (!range.start || !range.end) return []

  const series = []
  let cursor
  let advance
  let keyBuilder
  let labelBuilder

  if (grouping === 'month') {
    cursor = startOfMonth(range.start)
    advance = (date) => addMonths(date, 1)
    keyBuilder = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    labelBuilder = (date) => formatMonthLabel(date)
  } else if (grouping === 'week') {
    cursor = startOfWeek(range.start)
    advance = (date) => addWeeks(date, 1)
    keyBuilder = (date) => formatDateKey(date)
    labelBuilder = (date) => `Tuần ${formatCompactDate(date)}`
  } else {
    cursor = new Date(range.start)
    cursor.setHours(0, 0, 0, 0)
    advance = (date) => addDays(date, 1)
    keyBuilder = (date) => formatDateKey(date)
    labelBuilder = (date) =>
      date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
  }

  while (cursor <= range.end) {
    const key = keyBuilder(cursor)
    series.push({ key, label: labelBuilder(cursor), total: 0 })
    cursor = advance(cursor)
  }

  const indexMap = new Map(series.map((item, index) => [item.key, index]))

  appointments.forEach((appointment) => {
    if (!appointment.parsedDate) return

    let key
    if (grouping === 'month') {
      key = `${appointment.parsedDate.getFullYear()}-${String(appointment.parsedDate.getMonth() + 1).padStart(2, '0')}`
    } else if (grouping === 'week') {
      key = formatDateKey(startOfWeek(appointment.parsedDate))
    } else {
      key = formatDateKey(appointment.parsedDate)
    }

    const index = indexMap.get(key)
    if (index == null) return
    series[index].total += 1
  })

  return series
}

function StatCard({ label, value, icon: Icon, tone = 'bg-slate-100 text-slate-700', labelClassName = '' }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={`text-sm font-semibold text-slate-500 ${labelClassName}`}>{label}</div>
          <div className="mt-3 text-[30px] font-semibold leading-none text-slate-900">{value}</div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, iconClassName, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${iconClassName}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">{title}</div>
    </div>
  )
}

export default function DoctorAnalytics() {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('30days')
  const [trendGrouping, setTrendGrouping] = useState('day')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return

      setIsLoading(true)
      try {
        const result = await appointmentApi.getDoctorAppointments(user.id, { size: 500 })
        setAppointments(Array.isArray(result) ? result : [])
      } catch {
        setAppointments([])
        showToast({ type: 'error', message: 'Khong the tai du lieu thong ke bac si' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [showToast, user?.id])

  const analyticsData = useMemo(() => {
    const normalized = appointments
      .map((appointment) => {
        const parsedDate = parseLocalDate(
          appointment.appointmentDate || appointment.date,
          appointment.appointmentTime || appointment.time
        )

        return {
          ...appointment,
          parsedDate,
          status: appointment.status || 'PENDING',
          type: appointment.type || 'IN_PERSON',
          amount: getAmount(appointment),
          patientKey: String(appointment.patientId || appointment.patientName || appointment.id),
        }
      })
      .filter((appointment) => appointment.parsedDate)
      .sort((left, right) => left.parsedDate.getTime() - right.parsedDate.getTime())

    const patientFirstVisitMap = new Map()
    normalized.forEach((appointment) => {
      if (!patientFirstVisitMap.has(appointment.patientKey)) {
        patientFirstVisitMap.set(appointment.patientKey, appointment.parsedDate)
      }
    })

    const range = getFilterRange(timeFilter, customFrom, customTo)
    const filtered = normalized.filter((appointment) => isWithinRange(appointment.parsedDate, range))

    const totalAppointments = filtered.length
    const inPersonAppointments = filtered.filter((appointment) => appointment.type !== 'ONLINE')
    const onlineAppointments = filtered.filter((appointment) => appointment.type === 'ONLINE')
    const completedAppointments = filtered.filter((appointment) => appointment.status === 'COMPLETED')
    const cancelledAppointments = filtered.filter((appointment) => appointment.status === 'CANCELLED')
    const noShowAppointments = filtered.filter((appointment) => appointment.status === 'NO_SHOW')

    const uniquePatients = new Map()
    filtered.forEach((appointment) => {
      if (!uniquePatients.has(appointment.patientKey)) {
        uniquePatients.set(appointment.patientKey, appointment)
      }
    })

    const newPatients = Array.from(uniquePatients.values()).filter((appointment) => {
      const firstVisit = patientFirstVisitMap.get(appointment.patientKey)
      return firstVisit && isWithinRange(firstVisit, range)
    })

    const returningPatients = Math.max(uniquePatients.size - newPatients.length, 0)
    const totalRevenue = filtered.reduce((sum, appointment) => sum + appointment.amount, 0)
    const inPersonRevenue = inPersonAppointments.reduce((sum, appointment) => sum + appointment.amount, 0)
    const onlineRevenue = onlineAppointments.reduce((sum, appointment) => sum + appointment.amount, 0)
    const hasRevenue = totalRevenue > 0 || inPersonRevenue > 0 || onlineRevenue > 0

    const completionRate = totalAppointments ? Math.round((completedAppointments.length / totalAppointments) * 100) : 0
    const cancellationRate = totalAppointments ? Math.round((cancelledAppointments.length / totalAppointments) * 100) : 0
    const noShowRate = totalAppointments ? Math.round((noShowAppointments.length / totalAppointments) * 100) : 0
    const inPersonRate = totalAppointments ? Math.round((inPersonAppointments.length / totalAppointments) * 100) : 0
    const onlineRate = totalAppointments ? Math.round((onlineAppointments.length / totalAppointments) * 100) : 0
    const trendData = getTrendData(filtered, trendGrouping, range)

    return {
      filtered,
      trendData,
      overview: {
        totalAppointments,
        inPerson: inPersonAppointments.length,
        online: onlineAppointments.length,
        completed: completedAppointments.length,
        cancelled: cancelledAppointments.length,
      },
      performance: {
        total: totalAppointments,
        completionRate,
        cancellationRate,
        noShowRate,
      },
      patients: {
        total: uniquePatients.size,
        newPatients: newPatients.length,
        returningPatients,
      },
      revenue: {
        hasRevenue,
        totalRevenue,
        inPersonRevenue,
        onlineRevenue,
      },
      serviceMix: {
        inPersonRate,
        onlineRate,
      },
    }
  }, [appointments, customFrom, customTo, timeFilter, trendGrouping])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[18px] border-slate-200 bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <CardContent className="px-5 py-5 lg:px-6">
          <div className="flex flex-col gap-3">
            <div className="text-sm font-semibold text-slate-500">Bộ lọc thời gian</div>
            <div className="flex flex-wrap gap-2">
              {DATE_FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTimeFilter(option.value)}
                  className={`rounded-[12px] px-4 py-2.5 text-[15px] font-medium transition ${
                    timeFilter === option.value ? doctorPrimaryActiveClass : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {timeFilter === 'custom' && (
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div className="grid gap-3 md:grid-cols-2 xl:flex xl:flex-1 xl:flex-nowrap xl:items-end">
                  <label className="flex items-center gap-3 xl:min-w-[280px]">
                    <span className="whitespace-nowrap text-sm font-medium text-slate-600">Từ ngày</span>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(event) => setCustomFrom(event.target.value)}
                      className="h-11 w-full rounded-[14px] border border-slate-200 px-3 text-slate-900 focus:outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-3 xl:min-w-[280px]">
                    <span className="whitespace-nowrap text-sm font-medium text-slate-600">Đến ngày</span>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(event) => setCustomTo(event.target.value)}
                      className="h-11 w-full rounded-[14px] border border-slate-200 px-3 text-slate-900 focus:outline-none"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomFrom('')
                    setCustomTo('')
                  }}
                  className="text-sm font-semibold text-slate-500 transition hover:text-slate-900 xl:mb-2"
                >
                  Xóa lọc
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Tổng lịch hẹn"
              value={analyticsData.overview.totalAppointments}
              icon={CalendarDays}
              tone="bg-[#eff4ef] text-[#2f5a36]"
            />
            <StatCard
              label="Khám trực tiếp"
              value={analyticsData.overview.inPerson}
              icon={Stethoscope}
              tone="bg-[#f5efe9] text-[#8a5b35]"
            />
            <StatCard
              label="Tư vấn trực tuyến"
              value={analyticsData.overview.online}
              icon={Video}
              tone="bg-[#eef4ff] text-[#35548a]"
              labelClassName="whitespace-nowrap text-[13px]"
            />
            <StatCard
              label="Hoàn thành"
              value={analyticsData.overview.completed}
              icon={RefreshCw}
              tone="bg-[#f3f7f3] text-[#4b6b53]"
            />
            <StatCard
              label="Đã hủy"
              value={analyticsData.overview.cancelled}
              icon={XCircle}
              tone="bg-[#fff1f1] text-[#b84141]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.95fr)]">
        <Card className="rounded-[18px] border-slate-200 bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <CardContent className="px-5 py-5 lg:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">Xu hướng lịch hẹn</div>

              <div className="flex flex-wrap gap-2">
                {TREND_GROUPS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTrendGrouping(option.value)}
                    className={`rounded-[12px] px-4 py-2.5 text-[15px] font-medium transition ${
                      trendGrouping === option.value ? doctorPrimaryActiveClass : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {analyticsData.trendData.length === 0 ? (
              <div className="mt-6 flex h-[420px] items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                Chưa có dữ liệu xu hướng cho khoảng thời gian này.
              </div>
            ) : (
              <div className="mt-6 w-full" style={{ height: 420, minHeight: 420 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [`${value}`, 'Lịch hẹn']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke={DOCTOR_PRIMARY}
                      strokeWidth={3}
                      dot={{ fill: DOCTOR_PRIMARY, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[18px] border-slate-200 bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <CardContent className="px-5 py-5 lg:px-6">
              <SectionTitle
                icon={RefreshCw}
                iconClassName="bg-[#eff4ef] text-[#4b6b53]"
                title="Hiệu suất khám"
              />

              <div className="mt-5 grid gap-3">
                <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-sm text-slate-500">Tổng lịch</div>
                  <div className="mt-2 text-[28px] font-semibold text-slate-900">{analyticsData.performance.total}</div>
                </div>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                  <div className="text-sm text-slate-500 whitespace-nowrap">Tỷ lệ hoàn thành</div>
                  <div className="mt-2 text-[24px] font-semibold text-slate-900">
                    {analyticsData.performance.completionRate}%
                  </div>
                </div>
                  <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                    <div className="text-sm text-slate-500">Tỷ lệ hủy</div>
                    <div className="mt-2 text-[24px] font-semibold text-slate-900">
                      {analyticsData.performance.cancellationRate}%
                    </div>
                  </div>
                  <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                    <div className="text-sm text-slate-500">No-show</div>
                    <div className="mt-2 text-[24px] font-semibold text-slate-900">
                      {analyticsData.performance.noShowRate}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[18px] border-slate-200 bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <CardContent className="px-5 py-5 lg:px-6">
              <SectionTitle
                icon={Stethoscope}
                iconClassName="bg-[#f5efe9] text-[#8a5b35]"
                title="Thống kê loại dịch vụ"
              />

              <div className="mt-5 space-y-4">
                {[
                  {
                    label: 'Khám trực tiếp',
                    value: analyticsData.overview.inPerson,
                    percent: analyticsData.serviceMix.inPersonRate,
                    color: '#8a5b35',
                    bg: '#f5efe9',
                  },
                  {
                    label: 'Tư vấn trực tuyến',
                    value: analyticsData.overview.online,
                    percent: analyticsData.serviceMix.onlineRate,
                    color: '#35548a',
                    bg: '#eef4ff',
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="text-[15px] font-medium text-slate-700">{item.label}</div>
                      <div className="text-[15px] font-semibold text-slate-900">
                        {item.percent}% • {item.value}
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full"
                        style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <div
                      className="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ color: item.color, backgroundColor: item.bg }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[18px] border-slate-200 bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <CardContent className="px-5 py-5 lg:px-6">
            <SectionTitle
              icon={CircleDollarSign}
              iconClassName="bg-[#fff6e9] text-[#9a5d12]"
              title="Doanh thu"
            />

            {analyticsData.revenue.hasRevenue ? (
              <div className="mt-5 grid gap-3">
                <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-sm text-slate-500">Tổng doanh thu</div>
                  <div className="mt-2 text-[28px] font-semibold text-slate-900">
                    {currencyFormatter.format(analyticsData.revenue.totalRevenue)}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                    <div className="text-sm text-slate-500">Doanh thu khám trực tiếp</div>
                    <div className="mt-2 text-[22px] font-semibold text-slate-900">
                      {currencyFormatter.format(analyticsData.revenue.inPersonRevenue)}
                    </div>
                  </div>
                  <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                    <div className="text-sm text-slate-500">Doanh thu tư vấn trực tuyến</div>
                    <div className="mt-2 text-[22px] font-semibold text-slate-900">
                      {currencyFormatter.format(analyticsData.revenue.onlineRevenue)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex min-h-[180px] items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
                Chưa có dữ liệu doanh thu hoặc chưa áp dụng phí khám trong khoảng thời gian này.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[18px] border-slate-200 bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <CardContent className="px-5 py-5 lg:px-6">
            <SectionTitle icon={Users} iconClassName="bg-[#eff4ef] text-[#2f5a36]" title="Bệnh nhân" />

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                <div className="text-sm text-slate-500">Tổng bệnh nhân</div>
                <div className="mt-2 text-[26px] font-semibold text-slate-900">{analyticsData.patients.total}</div>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                <div className="text-sm text-slate-500">Bệnh nhân mới</div>
                <div className="mt-2 text-[26px] font-semibold text-slate-900">{analyticsData.patients.newPatients}</div>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                <div className="text-sm text-slate-500">Bệnh nhân quay lại</div>
                <div className="mt-2 text-[26px] font-semibold text-slate-900">
                  {analyticsData.patients.returningPatients}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
