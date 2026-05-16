import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Stethoscope,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { statsApi } from '@/api/statsApiWrapper'
import { Avatar } from '@/components/ui/Avatar'
import { Card, CardContent } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { doctorPrimaryButtonClass, DOCTOR_PRIMARY } from './theme'

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function formatLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseAppointmentDateTime(rawDate, rawTime) {
  if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    const [year, month, day] = rawDate.split('-').map(Number)
    let hours = 0
    let minutes = 0

    if (typeof rawTime === 'string' && /^\d{2}:\d{2}/.test(rawTime)) {
      ;[hours, minutes] = rawTime.slice(0, 5).split(':').map(Number)
    }

    return new Date(year, month - 1, day, hours, minutes)
  }

  const fallback = new Date(rawDate || rawTime || '')
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

function normalizeTime(rawTime, parsedDate) {
  if (typeof rawTime === 'string' && /^\d{2}:\d{2}/.test(rawTime)) {
    return rawTime.slice(0, 5)
  }

  if (!parsedDate) return '--:--'

  return parsedDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getAppointmentTypeLabel(type) {
  return type === 'ONLINE' ? 'Tư vấn trực tuyến' : 'Khám trực tiếp'
}

function getAppointmentStage(status) {
  if (status === 'CANCELLED') return 'cancelled'
  if (status === 'COMPLETED') return 'completed'
  if (status === 'IN_PROGRESS') return 'in_progress'
  return 'scheduled'
}

function getStageBadge(stage) {
  switch (stage) {
    case 'completed':
      return 'border-[#d5ead8] bg-[#f2f8f3] text-[#41614a]'
    case 'in_progress':
      return 'border-[#d9e7ff] bg-[#f3f7ff] text-[#31558f]'
    case 'cancelled':
      return 'border-red-200 bg-red-50 text-red-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
}

function getStageLabel(stage) {
  switch (stage) {
    case 'completed':
      return 'Hoàn thành'
    case 'in_progress':
      return 'Đang khám'
    case 'cancelled':
      return 'Đã hủy'
    default:
      return 'Chưa bắt đầu'
  }
}

function getActionState(appointment, now) {
  if (appointment.stage === 'in_progress') {
    return {
      label: 'Đang khám',
      tone: 'border-[#d9e7ff] bg-[#f3f7ff] text-[#31558f]',
    }
  }

  if (appointment.stage === 'completed') {
    return null
  }

  if (appointment.stage === 'cancelled') {
    return null
  }

  if (!appointment.parsedDateTime) {
    return {
      label: 'Chưa bắt đầu',
      tone: 'border-slate-200 bg-slate-50 text-slate-700',
    }
  }

  const diffMinutes = Math.round((appointment.parsedDateTime.getTime() - now.getTime()) / 60000)

  if (diffMinutes < -30) {
    return {
      label: 'Cần hoàn thành note',
      tone: 'border-amber-200 bg-amber-50 text-amber-700',
    }
  }

  if (diffMinutes <= 60) {
    return {
      label: 'Sắp đến giờ',
      tone: 'border-[#d9e7ff] bg-[#f3f7ff] text-[#31558f]',
    }
  }

  return null
}

function getAmountFromAppointment(appointment) {
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

export default function DoctorDashboard() {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [stats, setStats] = useState({})
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.id) return

      setIsLoading(true)

      const [statsResult, appointmentsResult] = await Promise.allSettled([
        statsApi.getDoctorStats(user.id),
        appointmentApi.getDoctorAppointments(user.id, { size: 200 }),
      ])

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value || {})
      } else {
        setStats({})
      }

      if (appointmentsResult.status === 'fulfilled') {
        setAppointments(Array.isArray(appointmentsResult.value) ? appointmentsResult.value : [])
      } else {
        setAppointments([])
      }

      if (statsResult.status === 'rejected' && appointmentsResult.status === 'rejected') {
        showToast({ type: 'error', message: 'Không thể tải dữ liệu tổng quan bác sĩ' })
      }

      setIsLoading(false)
    }

    fetchDashboard()
  }, [showToast, user?.id])

  const dashboardData = useMemo(() => {
    const now = new Date()
    const todayKey = formatLocalDateKey(now)
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 6)
    weekStart.setHours(0, 0, 0, 0)
    const monthStart = new Date(now)
    monthStart.setDate(now.getDate() - 29)
    monthStart.setHours(0, 0, 0, 0)

    const normalizedAppointments = appointments
      .map((appointment) => {
        const rawDate = appointment.appointmentDate || appointment.date
        const rawTime = appointment.appointmentTime || appointment.time
        const parsedDateTime = parseAppointmentDateTime(rawDate, rawTime)
        const dateKey = parsedDateTime ? formatLocalDateKey(parsedDateTime) : null
        const stage = getAppointmentStage(appointment.status)

        return {
          ...appointment,
          dateKey,
          parsedDateTime,
          timeLabel: normalizeTime(rawTime, parsedDateTime),
          stage,
          typeLabel: getAppointmentTypeLabel(appointment.type),
          amount: getAmountFromAppointment(appointment),
        }
      })
      .sort((left, right) => {
        const leftTime = left.parsedDateTime?.getTime() || 0
        const rightTime = right.parsedDateTime?.getTime() || 0
        return leftTime - rightTime
      })

    const todayAppointments = normalizedAppointments.filter((appointment) => appointment.dateKey === todayKey)
    const upcomingAppointments = normalizedAppointments.filter(
      (appointment) =>
        appointment.parsedDateTime &&
        appointment.parsedDateTime >= now &&
        appointment.stage !== 'cancelled' &&
        appointment.stage !== 'completed'
    )
    const completedAppointments = normalizedAppointments.filter((appointment) => appointment.stage === 'completed')
    const cancelledAppointments = normalizedAppointments.filter((appointment) => appointment.stage === 'cancelled')
    const todayRevenue = todayAppointments
      .filter((appointment) => appointment.stage !== 'cancelled')
      .reduce((sum, appointment) => sum + appointment.amount, 0)

    const actionItems = todayAppointments
      .map((appointment) => ({
        ...appointment,
        actionState: getActionState(appointment, now),
      }))
      .filter((appointment) => appointment.actionState)
      .sort((left, right) => {
        const leftTime = left.parsedDateTime?.getTime() || 0
        const rightTime = right.parsedDateTime?.getTime() || 0
        return leftTime - rightTime
      })
      .slice(0, 6)

    const recentPatients = normalizedAppointments
      .slice()
      .sort((left, right) => (right.parsedDateTime?.getTime() || 0) - (left.parsedDateTime?.getTime() || 0))
      .filter((appointment, index, list) => {
        const patientKey = String(appointment.patientId || appointment.patientName || appointment.id)
        return index === list.findIndex((item) => String(item.patientId || item.patientName || item.id) === patientKey)
      })
      .slice(0, 6)

    const totalAppointments = normalizedAppointments.length
    const cancellationRate = totalAppointments === 0 ? 0 : Math.round((cancelledAppointments.length / totalAppointments) * 100)
    const hasRevenue = todayRevenue > 0 || Number(stats?.monthlyRevenue || 0) > 0
    const recent7Days = normalizedAppointments.filter(
      (appointment) => appointment.parsedDateTime && appointment.parsedDateTime >= weekStart
    )
    const recent30Days = normalizedAppointments.filter(
      (appointment) => appointment.parsedDateTime && appointment.parsedDateTime >= monthStart
    )

    const kpis = [
      {
        id: 'today',
        label: 'Lịch hôm nay',
        value: todayAppointments.length,
        hint: 'Tổng số lịch trong ngày',
        icon: CalendarDays,
        iconClass: 'bg-[#eff4ef] text-[#2f5a36]',
      },
      {
        id: 'upcoming',
        label: 'Lịch sắp tới',
        value: upcomingAppointments.length,
        hint: 'Các lịch chưa diễn ra',
        icon: Clock3,
        iconClass: 'bg-[#f2f6ff] text-[#35548a]',
      },
      {
        id: 'completed',
        label: 'Đã hoàn thành',
        value: completedAppointments.length,
        hint: 'Tổng lịch đã xử lý xong',
        icon: CheckCircle2,
        iconClass: 'bg-[#f3f7f3] text-[#4b6b53]',
      },
      {
        id: 'cancelled',
        label: 'Tỷ lệ hủy',
        value: `${cancellationRate}%`,
        hint: `${cancelledAppointments.length} lịch đã hủy`,
        icon: Ban,
        iconClass: 'bg-[#fff1f1] text-[#b84141]',
      },
    ]

    if (hasRevenue) {
      kpis.push({
        id: 'revenue',
        label: 'Doanh thu hôm nay',
        value: currencyFormatter.format(todayRevenue),
        hint: 'Tính từ lịch có phí trong ngày',
        icon: Wallet,
        iconClass: 'bg-[#fff6e9] text-[#9a5d12]',
      })
    }

    return {
      kpis,
      timeline: todayAppointments,
      actionItems,
      recentPatients,
      totalPatients: stats?.totalPatients ?? recentPatients.length,
      compactStats: [
        {
          id: 'today',
          label: 'Hôm nay',
          total: todayAppointments.length,
          completed: todayAppointments.filter((appointment) => appointment.stage === 'completed').length,
          cancelled: todayAppointments.filter((appointment) => appointment.stage === 'cancelled').length,
        },
        {
          id: 'last-7-days',
          label: '7 ngày qua',
          total: recent7Days.length,
          completed: recent7Days.filter((appointment) => appointment.stage === 'completed').length,
          cancelled: recent7Days.filter((appointment) => appointment.stage === 'cancelled').length,
        },
        {
          id: 'last-30-days',
          label: '30 ngày qua',
          total: recent30Days.length,
          completed: recent30Days.filter((appointment) => appointment.stage === 'completed').length,
          cancelled: recent30Days.filter((appointment) => appointment.stage === 'cancelled').length,
        },
      ],
    }
  }, [appointments, stats])

  const quickActions = [
    {
      label: 'Tạo lịch làm việc',
      to: '/schedule',
      icon: CalendarDays,
    },
    {
      label: 'Xem lịch hẹn',
      to: '/doctor/bookings',
      icon: FileText,
    },
    {
      label: 'Mở danh sách bệnh nhân',
      to: '/patients',
      icon: Users,
    },
  ]

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
      <Card className="overflow-hidden rounded-[18px] border-slate-200 bg-[linear-gradient(135deg,#fbfcfb_0%,#f3f6f4_100%)] p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <CardContent className="px-5 py-5 lg:px-6 lg:py-6">
          <div className={`grid gap-4 ${dashboardData.kpis.length >= 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4'} md:grid-cols-2`}>
            {dashboardData.kpis.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.id}
                  className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-500">{item.label}</div>
                      <div className="mt-3 text-[30px] font-semibold leading-none text-slate-900">{item.value}</div>
                      <div className="mt-2 text-sm text-slate-500">{item.hint}</div>
                    </div>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${item.iconClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
        <Card className="rounded-[18px] border-slate-200 bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <CardContent className="px-5 py-5 lg:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">Timeline hôm nay</div>
              </div>
              <Link
                to="/doctor/bookings"
                className="rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-[15px] font-medium text-slate-700 transition hover:bg-white"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {dashboardData.timeline.length === 0 ? (
                <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-[15px] text-slate-600">
                  Hôm nay chưa có lịch hẹn nào.
                </div>
              ) : (
                dashboardData.timeline.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="grid gap-4 rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fafbfa_100%)] p-4 md:grid-cols-[88px_minmax(0,1fr)_auto]"
                  >
                    <div className="rounded-[14px] bg-[#f3f6f4] px-3 py-4 text-center">
                      <div className="text-[24px] font-semibold leading-none text-slate-900">{appointment.timeLabel}</div>
                      <div className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        {appointment.typeLabel}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={`https://i.pravatar.cc/150?u=${appointment.patientId || appointment.id}`}
                          name={appointment.patientName}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-[18px] font-semibold text-slate-900">
                            {appointment.patientName || 'Bệnh nhân'}
                          </div>
                          <div className="mt-1 text-[15px] text-slate-600">
                            {appointment.reason || appointment.symptoms || 'Khám và theo dõi sức khỏe'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start justify-end md:justify-start">
                      <span className={`rounded-[12px] border px-3 py-2 text-sm font-semibold ${getStageBadge(appointment.stage)}`}>
                        {getStageLabel(appointment.stage)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[18px] border-slate-200 bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <CardContent className="px-5 py-5 lg:px-6">
              <div className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">Lịch cần xử lý</div>

              <div className="mt-5 space-y-3">
                {dashboardData.actionItems.length === 0 ? (
                  <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-[15px] text-slate-600">
                    Chưa có lịch nào cần xử lý ngay lúc này.
                  </div>
                ) : (
                  dashboardData.actionItems.map((appointment) => (
                    <div key={appointment.id} className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[15px] font-semibold text-slate-500">{appointment.timeLabel}</div>
                          <div className="mt-1 text-[17px] font-semibold text-slate-900">
                            {appointment.patientName || 'Bệnh nhân'}
                          </div>
                          <div className="mt-1 text-[15px] text-slate-600">{appointment.typeLabel}</div>
                        </div>
                        <span className={`rounded-[12px] border px-3 py-2 text-sm font-semibold ${appointment.actionState.tone}`}>
                          {appointment.actionState.label}
                        </span>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Link
                          to={appointment.type === 'ONLINE' ? '/doctor/messages' : '/doctor/bookings'}
                          className={`rounded-[12px] px-4 py-2.5 text-[15px] font-medium transition ${doctorPrimaryButtonClass}`}
                        >
                          {appointment.type === 'ONLINE' ? 'Mở tư vấn' : 'Mở lịch hẹn'}
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[18px] border-slate-200 bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <CardContent className="px-5 py-5 lg:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">Bệnh nhân gần đây</div>
                </div>
                <div className="rounded-[12px] bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
                  {dashboardData.totalPatients} bệnh nhân
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {dashboardData.recentPatients.length === 0 ? (
                  <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-[15px] text-slate-600">
                    Chưa có bệnh nhân gần đây.
                  </div>
                ) : (
                  dashboardData.recentPatients.map((appointment) => (
                    <Link
                      key={`${appointment.patientId || appointment.patientName}-${appointment.id}`}
                      to="/patients"
                      className="flex items-center justify-between gap-4 rounded-[16px] border border-slate-200 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.06)]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar
                          src={`https://i.pravatar.cc/150?u=${appointment.patientId || appointment.id}`}
                          name={appointment.patientName}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-[17px] font-semibold text-slate-900">
                            {appointment.patientName || 'Bệnh nhân'}
                          </div>
                          <div className="mt-1 text-[15px] text-slate-600">
                            {appointment.timeLabel} • {appointment.typeLabel}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" />
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-[18px] border-slate-200 bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <CardContent className="px-5 py-5 lg:px-6">
          <div className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">Lối tắt</div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="rounded-[16px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8faf8_100%)] px-4 py-5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#eff4ef] text-slate-700">
                      <Icon className="h-5 w-5" style={{ color: DOCTOR_PRIMARY }} />
                    </div>
                    <div className="text-[17px] font-semibold text-slate-900">{action.label}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[18px] border-slate-200 bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <CardContent className="px-5 py-5 lg:px-6">
          <div className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">Mini thống kê</div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {dashboardData.compactStats.map((item) => (
              <div
                key={item.id}
                className="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fafbfa_100%)] p-5"
              >
                <div className="text-[18px] font-semibold text-slate-900">{item.label}</div>
                <div className="mt-4 space-y-3 text-[15px] text-slate-700">
                  <div className="flex items-center justify-between gap-4">
                    <span>Lịch hẹn</span>
                    <span className="font-semibold text-slate-900">{item.total}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Hoàn thành</span>
                    <span className="font-semibold text-slate-900">{item.completed}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Hủy</span>
                    <span className="font-semibold text-slate-900">{item.cancelled}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
