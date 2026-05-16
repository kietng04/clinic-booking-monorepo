import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpDown,
  CalendarDays,
  CalendarRange,
  Check,
  Clock3,
  FileText,
  Phone,
  Play,
  Search,
  SlidersHorizontal,
  Stethoscope,
  Video,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Loading'
import { CancelAppointmentModal } from '@/components/CancelAppointmentModal'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { medicalRecordApi } from '@/api/realApis/medicalRecordApi'
import { doctorPrimaryButtonClass } from './theme'

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'booked', label: 'Đã đặt lịch' },
  { value: 'in_progress', label: 'Đang diễn ra' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
]

const serviceOptions = [
  { value: 'all', label: 'Tất cả dịch vụ' },
  { value: 'DIRECT', label: 'Khám trực tiếp' },
  { value: 'ONLINE', label: 'Tư vấn trực tuyến' },
]

const dateOptions = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'next7', label: '7 ngày tới' },
  { value: 'next30', label: '30 ngày tới' },
  { value: 'custom', label: 'Từ ngày - Đến ngày' },
  { value: 'all', label: 'Toàn bộ thời gian' },
]

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
]

const bookedStatuses = new Set(['PENDING', 'CONFIRMED'])

function getAppointmentDate(appointment) {
  return appointment?.appointmentDate || appointment?.date || ''
}

function getAppointmentTime(appointment) {
  return appointment?.appointmentTime || appointment?.time || ''
}

function getPatientPhone(appointment) {
  return (
    appointment?.patientPhone ||
    appointment?.phone ||
    appointment?.phoneNumber ||
    appointment?.patient?.phone ||
    appointment?.patient?.phoneNumber ||
    ''
  )
}

function normalizeDateOnly(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10)
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(dateString, days) {
  const parsed = new Date(`${dateString}T00:00:00`)
  parsed.setDate(parsed.getDate() + days)
  return normalizeDateOnly(parsed)
}

function formatDisplayDate(value) {
  const normalized = normalizeDateOnly(value)
  if (!normalized) return '--/--/----'

  const [year, month, day] = normalized.split('-')
  return `${day}/${month}/${year}`
}

function formatDisplayWeekday(value) {
  const normalized = normalizeDateOnly(value)
  if (!normalized) return 'Chưa có ngày'

  const weekday = new Date(`${normalized}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long',
  })
  return weekday.charAt(0).toUpperCase() + weekday.slice(1)
}

function formatDisplayTime(value) {
  if (!value) return '--:--'
  if (typeof value === 'string' && /^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5)
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function toTimestamp(appointment) {
  const dateValue = normalizeDateOnly(getAppointmentDate(appointment))
  const timeValue = formatDisplayTime(getAppointmentTime(appointment))

  if (!dateValue) return 0

  const parsed = new Date(`${dateValue}T${timeValue === '--:--' ? '00:00' : timeValue}:00`)
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

function getServiceTypeLabel(type) {
  return type === 'ONLINE' ? 'Tư vấn trực tuyến' : 'Khám trực tiếp'
}

function isOnlineService(type) {
  return type === 'ONLINE'
}

function getAppointmentStage(status) {
  if (status === 'CANCELLED') return 'cancelled'
  if (status === 'COMPLETED') return 'completed'
  if (status === 'IN_PROGRESS') return 'in_progress'
  if (bookedStatuses.has(status)) return 'booked'
  return 'booked'
}

function getAppointmentStageLabel(status) {
  const stage = getAppointmentStage(status)

  if (stage === 'cancelled') return 'Đã hủy'
  if (stage === 'completed') return 'Hoàn thành'
  if (stage === 'in_progress') return 'Đang diễn ra'
  return 'Đã đặt lịch'
}

function getAppointmentStageClasses(status) {
  const stage = getAppointmentStage(status)

  if (stage === 'cancelled') return 'border-red-200 bg-red-50 text-red-700'
  if (stage === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (stage === 'in_progress') return 'border-sky-200 bg-sky-50 text-sky-700'
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function getServiceTypeClasses(type) {
  return isOnlineService(type)
    ? 'border-blue-200 bg-blue-50 text-blue-700'
    : 'border-orange-200 bg-orange-50 text-orange-700'
}

function matchesDateFilter(dateValue, dateFilter, customRange) {
  const normalized = normalizeDateOnly(dateValue)
  if (!normalized) return false

  if (dateFilter === 'all') return true

  const today = normalizeDateOnly(new Date())

  if (dateFilter === 'today') {
    return normalized === today
  }

  if (dateFilter === 'next7') {
    return normalized >= today && normalized <= addDays(today, 6)
  }

  if (dateFilter === 'next30') {
    return normalized >= today && normalized <= addDays(today, 29)
  }

  if (dateFilter === 'custom') {
    const fromDate = customRange.fromDate || ''
    const toDate = customRange.toDate || ''

    if (fromDate && normalized < fromDate) return false
    if (toDate && normalized > toDate) return false
    return true
  }

  return true
}

function sortAppointments(items, sortOrder) {
  return [...items].sort((left, right) => {
    const leftTime = toTimestamp(left)
    const rightTime = toTimestamp(right)

    if (sortOrder === 'oldest') {
      return leftTime - rightTime
    }

    return rightTime - leftTime
  })
}

function buildActiveFilterChips({
  searchQuery,
  statusFilter,
  serviceFilter,
  dateFilter,
  customRange,
  sortOrder,
}) {
  const chips = []

  if (searchQuery.trim()) {
    chips.push(`Tìm: ${searchQuery.trim()}`)
  }

  if (statusFilter !== 'all') {
    chips.push(statusOptions.find((item) => item.value === statusFilter)?.label || 'Trạng thái')
  }

  if (serviceFilter !== 'all') {
    chips.push(serviceOptions.find((item) => item.value === serviceFilter)?.label || 'Dịch vụ')
  }

  if (dateFilter !== 'all') {
    if (dateFilter === 'custom') {
      const fromDate = customRange.fromDate ? formatDisplayDate(customRange.fromDate) : '...'
      const toDate = customRange.toDate ? formatDisplayDate(customRange.toDate) : '...'
      chips.push(`Từ ${fromDate} đến ${toDate}`)
    } else {
      chips.push(dateOptions.find((item) => item.value === dateFilter)?.label || 'Ngày')
    }
  }
  if (sortOrder !== 'newest') {
    chips.push(sortOptions.find((item) => item.value === sortOrder)?.label || 'Sắp xếp')
  }

  return chips
}

export default function DoctorAppointments() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [appointments, setAppointments] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [customRange, setCustomRange] = useState({ fromDate: '', toDate: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [medicalRecordsByAppointment, setMedicalRecordsByAppointment] = useState({})
  const [selectedAppointmentDetail, setSelectedAppointmentDetail] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null)
  const [appointmentToCancel, setAppointmentToCancel] = useState(null)

  const activeFilterChips = useMemo(() => buildActiveFilterChips({
    searchQuery,
    statusFilter,
    serviceFilter,
    dateFilter,
    customRange,
    sortOrder,
  }), [customRange, dateFilter, searchQuery, serviceFilter, sortOrder, statusFilter])

  const loadMedicalRecords = async (sourceAppointments = []) => {
    const completedAppointments = sourceAppointments.filter(
      (appointment) => getAppointmentStage(appointment.status) === 'completed'
    )

    if (!completedAppointments.length) {
      setMedicalRecordsByAppointment({})
      return
    }

    setIsLoadingRecords(true)
    try {
      const records = await medicalRecordApi.getByDoctorId(user.id, { page: 0, size: 200 })
      const nextRecords = {}

      records.forEach((record) => {
        if (record?.appointmentId) {
          nextRecords[record.appointmentId] = record
        }
      })

      setMedicalRecordsByAppointment(nextRecords)
    } catch {
      showToast({ type: 'error', message: 'Không thể tải hồ sơ kết quả.' })
    } finally {
      setIsLoadingRecords(false)
    }
  }

  const loadAppointments = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const data = await appointmentApi.getAppointments({ doctorId: user.id, size: 200 })
      const nextAppointments = Array.isArray(data) ? data : []
      setAppointments(nextAppointments)
      await loadMedicalRecords(nextAppointments)
    } catch {
      showToast({ type: 'error', message: 'Không thể tải danh sách lịch hẹn.' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [user?.id])

  const filteredAppointments = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    const nextItems = appointments.filter((appointment) => {
      const stage = getAppointmentStage(appointment.status)
      const patientName = String(appointment.patientName || '').toLowerCase()
      const patientPhone = String(getPatientPhone(appointment) || '').toLowerCase()
      const reason = String(appointment.reason || appointment.symptoms || '').toLowerCase()

      const matchesStatus = statusFilter === 'all' || stage === statusFilter
      const matchesService =
        serviceFilter === 'all' ||
        (serviceFilter === 'ONLINE' ? isOnlineService(appointment.type) : !isOnlineService(appointment.type))
      const matchesKeyword =
        !keyword ||
        patientName.includes(keyword) ||
        patientPhone.includes(keyword) ||
        reason.includes(keyword)
      const matchesDate = matchesDateFilter(getAppointmentDate(appointment), dateFilter, customRange)

      return matchesStatus && matchesService && matchesKeyword && matchesDate
    })

    return sortAppointments(nextItems, sortOrder)
  }, [appointments, customRange, dateFilter, searchQuery, serviceFilter, sortOrder, statusFilter])

  const handleStartAppointment = async (appointment) => {
    const stage = getAppointmentStage(appointment.status)
    if (stage === 'cancelled' || stage === 'completed') return

    if (stage === 'booked') {
      setIsUpdatingStatus(true)
      try {
        await appointmentApi.updateAppointment(appointment.id, { status: 'IN_PROGRESS' })
        showToast({ type: 'success', message: 'Phiên khám đã được bắt đầu.' })
        await loadAppointments()
      } catch {
        showToast({ type: 'error', message: 'Không thể chuyển lịch hẹn sang đang diễn ra.' })
        return
      } finally {
        setIsUpdatingStatus(false)
      }
    }

    if (appointment.type === 'ONLINE') {
      navigate('/doctor/messages')
      return
    }

    navigate(`/doctor/create-medical-record?appointmentId=${appointment.id}`)
  }

  const handleCancelAppointment = async (reason) => {
    if (!appointmentToCancel?.id) return

    try {
      await appointmentApi.cancelAppointment(appointmentToCancel.id, reason)
      showToast({ type: 'success', message: 'Đã hủy lịch hẹn thành công.' })
      setAppointmentToCancel(null)
      await loadAppointments()
    } catch {
      showToast({ type: 'error', message: 'Không thể hủy lịch hẹn.' })
    }
  }

  const handleOpenMedicalRecord = async (appointment) => {
    const record = medicalRecordsByAppointment[appointment.id]
    if (!record?.id) return

    try {
      const detail = await medicalRecordApi.getById(record.id)
      setMedicalRecordsByAppointment((current) => ({
        ...current,
        [appointment.id]: detail,
      }))
      setSelectedMedicalRecord(detail)
      setSelectedAppointment(appointment)
    } catch {
      showToast({ type: 'error', message: 'Không thể tải chi tiết kết quả.' })
    }
  }

  const getPrimaryAction = (appointment) => {
    const stage = getAppointmentStage(appointment.status)

    if (stage === 'cancelled' || stage === 'completed') {
      return null
    }

    if (stage === 'booked') {
      return {
        label: appointment.type === 'ONLINE' ? 'Bắt đầu tư vấn' : 'Bắt đầu phiên khám',
        icon: <Play className="h-4 w-4" />,
      }
    }

    return {
      label: appointment.type === 'ONLINE' ? 'Mở phiên tư vấn' : 'Ghi chú kết quả',
      icon: <FileText className="h-4 w-4" />,
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setServiceFilter('all')
    setDateFilter('all')
    setSortOrder('newest')
    setCustomRange({ fromDate: '', toDate: '' })
  }

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
      <Card className="rounded-[24px] border-slate-200 bg-white p-0 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
        <CardContent className="space-y-4 px-4 py-4 md:px-5 md:py-5">
          <div className="min-w-[240px]">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tên bệnh nhân, số điện thoại, lý do khám"
              className="h-12 rounded-[14px] border-slate-200 bg-slate-50 px-4 text-[15px]"
            />
          </div>

          <div className="grid gap-3 xl:grid-cols-4 xl:gap-4">
            <div className="flex items-center gap-3">
              <div className="flex min-w-[108px] items-center gap-1.5 whitespace-nowrap text-[15px] font-medium text-slate-700">
                <Check className="h-4 w-4 text-slate-400" />
                <span>Trạng thái</span>
              </div>
              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                options={statusOptions}
                containerClassName="flex-1"
                className="h-12 rounded-[14px] border-slate-200 bg-slate-50 px-4 text-[15px]"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex min-w-[120px] items-center gap-1.5 whitespace-nowrap text-[15px] font-medium text-slate-700">
                {serviceFilter === 'ONLINE' ? (
                  <Video className="h-4 w-4 text-slate-400" />
                ) : (
                  <Stethoscope className="h-4 w-4 text-slate-400" />
                )}
                <span>Loại dịch vụ</span>
              </div>
              <Select
                value={serviceFilter}
                onChange={(event) => setServiceFilter(event.target.value)}
                options={serviceOptions}
                containerClassName="flex-1"
                className="h-12 rounded-[14px] border-slate-200 bg-slate-50 px-4 text-[15px]"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex min-w-[108px] items-center gap-1.5 whitespace-nowrap text-[15px] font-medium text-slate-700">
                <CalendarRange className="h-4 w-4 text-slate-400" />
                <span>Ngày</span>
              </div>
              <Select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                options={dateOptions}
                containerClassName="flex-1"
                className="h-12 rounded-[14px] border-slate-200 bg-slate-50 px-4 text-[15px]"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex min-w-[90px] items-center gap-1.5 whitespace-nowrap text-[15px] font-medium text-slate-700">
                <ArrowUpDown className="h-4 w-4 text-slate-400" />
                <span>Sắp xếp</span>
              </div>
              <Select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                options={sortOptions}
                containerClassName="flex-1"
                className="h-12 rounded-[14px] border-slate-200 bg-slate-50 px-4 text-[15px]"
              />
            </div>
          </div>
          {dateFilter === 'custom' && (
            <div className="grid gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3 md:grid-cols-2">
              <Input
                label="Từ ngày"
                type="date"
                value={customRange.fromDate}
                onChange={(event) =>
                  setCustomRange((current) => ({ ...current, fromDate: event.target.value }))
                }
                className="h-11 rounded-[14px] border-slate-200 bg-white"
              />
              <Input
                label="Đến ngày"
                type="date"
                value={customRange.toDate}
                onChange={(event) =>
                  setCustomRange((current) => ({ ...current, toDate: event.target.value }))
                }
                className="h-11 rounded-[14px] border-slate-200 bg-white"
              />
            </div>
          )}

          <div className="flex flex-col gap-2 rounded-[18px] border border-[#dce8df] bg-[#f7faf7] px-3 py-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-[#355141]">
                <Check className="h-4 w-4" />
                Bộ lọc đang áp dụng
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="text-[15px] font-medium text-slate-500 transition hover:text-slate-700"
              >
                Đặt lại
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeFilterChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe0d3] bg-white px-3 py-1.5 text-[14px] font-medium text-[#244432]"
                >
                  <Check className="h-3.5 w-3.5" />
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredAppointments.map((appointment) => {
          const primaryAction = getPrimaryAction(appointment)
          const hasMedicalRecord = !!medicalRecordsByAppointment[appointment.id]
          const isBooked = getAppointmentStage(appointment.status) === 'booked'
          const patientPhone = getPatientPhone(appointment)

          return (
            <Card
              key={appointment.id}
              className="rounded-[22px] border-slate-200 bg-white p-0 shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
              hover
            >
              <CardContent className="px-3 py-3 md:px-4 md:py-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
                  <div className="flex min-w-[132px] flex-col items-center justify-center self-stretch rounded-[18px] border border-[#dce8df] bg-[linear-gradient(180deg,#f7fbf8_0%,#eef6f0_100%)] px-3.5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#5c7361]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDisplayWeekday(getAppointmentDate(appointment))}
                    </div>
                    <div className="mt-2 text-[17px] font-semibold tracking-[-0.02em] text-slate-900">
                      {formatDisplayDate(getAppointmentDate(appointment))}
                    </div>
                    <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[#1f5f43]">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-[26px] font-semibold leading-none tracking-[-0.05em]">
                        {formatDisplayTime(getAppointmentTime(appointment))}
                      </span>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <Avatar
                      src={`https://i.pravatar.cc/160?u=${appointment.patientId || appointment.id}`}
                      name={appointment.patientName}
                      size="lg"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">
                              {appointment.patientName || 'Bệnh nhân'}
                            </h3>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[13px] font-semibold ${getServiceTypeClasses(appointment.type)}`}
                            >
                              {appointment.type === 'ONLINE' ? (
                                <Video className="h-3.5 w-3.5" />
                              ) : (
                                <Stethoscope className="h-3.5 w-3.5" />
                              )}
                              {getServiceTypeLabel(appointment.type)}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[13px] text-slate-600">
                              <Phone className="h-3.5 w-3.5" />
                              {patientPhone || 'Chưa có số điện thoại'}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-semibold ${getAppointmentStageClasses(appointment.status)}`}
                            >
                              <Check className="h-3.5 w-3.5" />
                              {getAppointmentStageLabel(appointment.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 rounded-[16px] border border-slate-200 bg-slate-50 px-3.5 py-3">
                        <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Lý do khám
                        </div>
                        <p className="mt-1.5 text-[15px] leading-6 text-slate-700">
                          {appointment.reason || appointment.symptoms || 'Chưa có mô tả lý do khám.'}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAppointmentDetail(appointment)}
                          className="rounded-[12px] border-slate-200 px-3 text-slate-700"
                        >
                          Xem chi tiết
                        </Button>

                        {isBooked && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAppointmentToCancel(appointment)}
                            className="rounded-[12px] border-slate-200 px-3 text-slate-700"
                          >
                            Hủy lịch
                          </Button>
                        )}

                        {primaryAction && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStartAppointment(appointment)}
                            leftIcon={primaryAction.icon}
                            className={`rounded-[12px] px-3 ${doctorPrimaryButtonClass}`}
                            disabled={isUpdatingStatus}
                          >
                            {primaryAction.label}
                          </Button>
                        )}

                        {getAppointmentStage(appointment.status) === 'completed' && hasMedicalRecord && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenMedicalRecord(appointment)}
                            leftIcon={<FileText className="h-4 w-4" />}
                            className="rounded-[12px] border-slate-200 px-3 text-slate-700"
                          >
                            Xem kết quả
                          </Button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredAppointments.length === 0 && (
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_16px_32px_rgba(15,23,42,0.05)]">
            <CardContent className="px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-slate-100 text-slate-600">
                <CalendarDays className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-[22px] font-semibold text-slate-900">
                Không có lịch hẹn phù hợp
              </h3>
              <p className="mt-2 text-[15px] text-slate-600">
                Hãy thử đổi bộ lọc trạng thái, dịch vụ, ngày hoặc từ khóa tìm kiếm.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal
        isOpen={!!selectedAppointmentDetail}
        onClose={() => setSelectedAppointmentDetail(null)}
        title="Chi tiết lịch hẹn"
        size="lg"
      >
        {selectedAppointmentDetail && (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[20px] font-semibold text-slate-900">
                  {selectedAppointmentDetail.patientName || 'Bệnh nhân'}
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[13px] font-semibold ${getServiceTypeClasses(selectedAppointmentDetail.type)}`}
                >
                  {getServiceTypeLabel(selectedAppointmentDetail.type)}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-[13px] font-semibold ${getAppointmentStageClasses(selectedAppointmentDetail.status)}`}
                >
                  {getAppointmentStageLabel(selectedAppointmentDetail.status)}
                </span>
              </div>
              <div className="mt-3 text-[15px] text-slate-600">
                {formatDisplayWeekday(getAppointmentDate(selectedAppointmentDetail))},{' '}
                {formatDisplayDate(getAppointmentDate(selectedAppointmentDetail))} lúc{' '}
                {formatDisplayTime(getAppointmentTime(selectedAppointmentDetail))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Số điện thoại
                </div>
                <div className="mt-2 text-[15px] text-slate-900">
                  {getPatientPhone(selectedAppointmentDetail) || 'Chưa cập nhật'}
                </div>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Mã lịch hẹn
                </div>
                <div className="mt-2 text-[15px] text-slate-900">
                  {selectedAppointmentDetail.id || 'Chưa cập nhật'}
                </div>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4 md:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Lý do khám
                </div>
                <div className="mt-2 text-[15px] leading-7 text-slate-900">
                  {selectedAppointmentDetail.reason ||
                    selectedAppointmentDetail.symptoms ||
                    'Chưa cập nhật'}
                </div>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4 md:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Ghi chú thêm
                </div>
                <div className="mt-2 text-[15px] leading-7 text-slate-900">
                  {selectedAppointmentDetail.notes || 'Không có ghi chú bổ sung.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedMedicalRecord}
        onClose={() => {
          setSelectedMedicalRecord(null)
          setSelectedAppointment(null)
        }}
        title="Chi tiết kết quả khám"
        size="lg"
      >
        {selectedMedicalRecord && (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Bệnh nhân
              </div>
              <div className="mt-2 text-[20px] font-semibold text-slate-900">
                {selectedAppointment?.patientName || selectedMedicalRecord.patientName}
              </div>
              <div className="mt-2 text-[15px] text-slate-600">
                {selectedAppointment
                  ? `${formatDisplayWeekday(getAppointmentDate(selectedAppointment))}, ${formatDisplayDate(getAppointmentDate(selectedAppointment))} lúc ${formatDisplayTime(getAppointmentTime(selectedAppointment))}`
                  : 'Chưa có thời gian hẹn'}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Kết luận
                </div>
                <div className="mt-2 text-[15px] leading-7 text-slate-900">
                  {selectedMedicalRecord.diagnosis || 'Chưa cập nhật'}
                </div>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Triá»‡u chá»©ng
                </div>
                <div className="mt-2 text-[15px] leading-7 text-slate-900">
                  {selectedMedicalRecord.symptoms || 'Chưa cập nhật'}
                </div>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Hướng điều trị
                </div>
                <div className="mt-2 text-[15px] leading-7 text-slate-900">
                  {selectedMedicalRecord.treatmentPlan || 'Chưa cập nhật'}
                </div>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Ngày tái khám
                </div>
                <div className="mt-2 text-[15px] text-slate-900">
                  {selectedMedicalRecord.followUpDate
                    ? formatDisplayDate(selectedMedicalRecord.followUpDate)
                    : 'Không có'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <CancelAppointmentModal
        isOpen={!!appointmentToCancel}
        onClose={() => setAppointmentToCancel(null)}
        appointment={appointmentToCancel}
        onConfirm={handleCancelAppointment}
      />
    </div>
  )
}


