import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Calendar, FileText, Filter, Search, UserRound, XCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { consultationApi } from '@/api/consultationApiWrapper'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { repairReactNode } from '@/utils/repairReactMojibake'
import {
  loadPaymentBookingSummaryByAppointmentId,
  loadPaymentBookingSummaryByConsultationId,
} from '@/utils/paymentBookingSummary'

const primaryButtonClass =
  '!rounded-[6px] border-[#0f4f2a] bg-[#0f4f2a] px-5 py-3 text-base font-semibold text-white shadow-none hover:bg-[#0b3f21]'
const secondaryButtonClass =
  '!rounded-[6px] border-[#cfd9d1] bg-white px-5 py-3 text-base font-semibold text-[#173925] shadow-none hover:bg-[#f5f8f5]'
const chipBase = 'rounded-[6px] border px-3 py-2 text-sm font-medium transition-colors'
const labelBaseClass = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold'

const emptyFilters = {
  startDate: '',
  endDate: '',
  status: 'ALL',
  service: 'ALL',
  place: 'ALL',
}

const statusMap = {
  PENDING: { label: 'Đã đặt lịch', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  CONFIRMED: { label: 'Đã đặt lịch', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  CHECKED_IN: { label: 'Đã đặt lịch', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  ACCEPTED: { label: 'Đã đặt lịch', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  IN_PROGRESS: { label: 'Đang tư vấn', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  COMPLETED: { label: 'Hoàn thành', className: 'border-green-200 bg-green-50 text-green-700' },
  CANCELLED: { label: 'Đã hủy', className: 'border-red-200 bg-red-50 text-red-700' },
  REJECTED: { label: 'Đã hủy', className: 'border-red-200 bg-red-50 text-red-700' },
}

const paymentStatusMap = {
  PAID: { label: 'Đã thanh toán', className: 'border-green-200 bg-green-50 text-green-700' },
  UNPAID: { label: 'Chưa thanh toán', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  EXPIRED: { label: 'Hết hạn thanh toán', className: 'border-red-200 bg-red-50 text-red-700' },
  UNKNOWN: { label: '', className: '' },
}

const serviceOptions = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'APPOINTMENT', label: 'Đặt lịch khám' },
  { value: 'CONSULTATION', label: 'Đặt lịch tư vấn' },
]

const placeOptions = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'DOCTOR', label: 'Bác sĩ' },
  { value: 'CLINIC', label: 'Phòng khám' },
  { value: 'HOSPITAL', label: 'Bệnh viện' },
]

const statusOptions = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'BOOKED', label: 'Đã đặt lịch' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'UNPAID', label: 'Chưa thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
]

const formatDateLabel = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toLocaleDateString('vi-VN')
}

const formatGenderLabel = (value) => {
  switch (String(value || '').toUpperCase()) {
    case 'MALE':
      return 'Nam'
    case 'FEMALE':
      return 'Nữ'
    case 'OTHER':
      return 'Khác'
    default:
      return value || '--'
  }
}

const normalizeTime = (value) => String(value || '').slice(0, 5)
const buildRecordId = (type, id) => `${String(type).toLowerCase()}-${id}`
const getStatusMeta = (status) => statusMap[String(status || '').toUpperCase()] || statusMap.PENDING

const buildFallbackTicketCode = (prefix, id, date) => {
  if (!id) return ''
  const datePart = String(date || '').slice(2, 10).replaceAll('-', '') || '000000'
  const idPart = String(id).replace(/\D/g, '').slice(-4).padStart(4, '0')
  return `${prefix}${datePart}${idPart}`
}

const getSelectedRecordId = (searchParams) => {
  const bookingId = searchParams.get('bookingId')
  if (bookingId) return bookingId

  const appointmentId = searchParams.get('appointmentId')
  return appointmentId ? buildRecordId('appointment', appointmentId) : ''
}

const getFilterStatus = (record) => {
  const normalized = String(record?.status || '').toUpperCase()
  if (['PENDING', 'CONFIRMED', 'CHECKED_IN', 'ACCEPTED', 'IN_PROGRESS'].includes(normalized)) {
    return 'BOOKED'
  }
  if (normalized === 'COMPLETED') return 'COMPLETED'
  if (['CANCELLED', 'REJECTED'].includes(normalized)) return 'CANCELLED'
  return 'BOOKED'
}

const normalizePaymentStatus = (value) => {
  const normalized = String(value || '').trim().toUpperCase()

  if (!normalized) return 'UNKNOWN'
  if (['PAID', 'SUCCESS', 'COMPLETED'].includes(normalized)) return 'PAID'
  if (['PAYMENT_EXPIRED', 'EXPIRED'].includes(normalized)) return 'EXPIRED'
  if (
    [
      'PENDING_PAYMENT',
      'PENDING',
      'UNPAID',
      'AWAITING_PAYMENT',
      'WAITING_PAYMENT',
      'CREATED',
      'PROCESSING',
    ].includes(normalized)
  ) {
    return 'UNPAID'
  }

  return 'UNKNOWN'
}

const getPaymentStatusValue = (record) => {
  const candidates = [
    record?.paymentStatus,
    record?.payment?.paymentStatus,
    record?.payment?.status,
    record?.billingStatus,
    record?.summary?.paymentStatus,
    record?.summary?.payment?.paymentStatus,
    record?.summary?.payment?.status,
  ]

  for (const candidate of candidates) {
    const normalized = normalizePaymentStatus(candidate)
    if (normalized !== 'UNKNOWN') return normalized
  }

  return 'UNKNOWN'
}

const getPaymentStatusMeta = (record) =>
  paymentStatusMap[getPaymentStatusValue(record)] || paymentStatusMap.UNKNOWN

const inferPlaceType = (record) => {
  const explicitValue = String(
    record?.placeType ||
      record?.locationType ||
      record?.summary?.placeType ||
      record?.summary?.locationType ||
      '',
  )
    .trim()
    .toUpperCase()

  if (['DOCTOR', 'CLINIC', 'HOSPITAL'].includes(explicitValue)) return explicitValue

  const haystack = [
    record?.clinicName,
    record?.doctorAddress,
    record?.summary?.clinicName,
    record?.summary?.doctorAddress,
    record?.title,
    record?.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (haystack.includes('bệnh viện') || haystack.includes('hospital')) return 'HOSPITAL'
  if (haystack.includes('phòng khám') || haystack.includes('phòng mạch') || haystack.includes('clinic')) {
    return 'CLINIC'
  }

  return 'DOCTOR'
}

const matchesStatusFilter = (record, filterValue) => {
  if (filterValue === 'ALL') return true

  if (['BOOKED', 'COMPLETED', 'CANCELLED'].includes(filterValue)) {
    return getFilterStatus(record) === filterValue
  }

  const paymentStatus = getPaymentStatusValue(record)

  if (filterValue === 'PAID') return paymentStatus === 'PAID'
  if (filterValue === 'UNPAID') return ['UNPAID', 'EXPIRED'].includes(paymentStatus)

  return true
}

const sortRecords = (records) =>
  [...records].sort((leftRecord, rightRecord) => {
    const left = new Date(
      `${String(leftRecord.dateValue || '').slice(0, 10)}T${normalizeTime(leftRecord.timeValue) || '00:00'}`,
    )
    const right = new Date(
      `${String(rightRecord.dateValue || '').slice(0, 10)}T${normalizeTime(rightRecord.timeValue) || '00:00'}`,
    )
    return right.getTime() - left.getTime()
  })

const normalizeAppointment = (item) => {
  const summary = loadPaymentBookingSummaryByAppointmentId(item.id)
  const dateValue = item?.date || item?.appointmentDate || summary?.date || ''
  const timeValue = item?.time || item?.appointmentTime || summary?.time || ''

  return {
    ...item,
    recordId: buildRecordId('appointment', item.id),
    resourceType: 'APPOINTMENT',
    resourceId: item.id,
    summary,
    dateValue,
    timeValue,
    title: item?.doctorName || item?.clinicName || 'Đặt lịch khám',
    doctorName: item?.doctorName || summary?.doctorName || 'Bác sĩ',
    doctorAvatar: item?.doctorAvatar || summary?.doctorAvatar || '',
    clinicName: item?.clinicName || summary?.clinicName || '',
    doctorAddress:
      item?.clinicAddress ||
      item?.clinicName ||
      summary?.doctorAddress ||
      summary?.clinicName ||
      '--',
    patientName: item?.patientName || summary?.patientName || '--',
    patientCode: item?.patientCode || summary?.patientCode || '--',
    patientDateOfBirth: item?.patientDateOfBirth || summary?.patientDateOfBirth || '--',
    patientGender: item?.patientGender || summary?.patientGender || '--',
    patientPhone: item?.patientPhone || summary?.patientPhone || '--',
    patientAddress: item?.patientAddress || item?.address || summary?.patientAddress || '--',
    specialization: item?.doctorSpecialization || summary?.doctorSpecialization || 'Chưa cập nhật',
    queueNumber: item?.queueNumber || summary?.queueNumber || '--',
    ticketCode:
      item?.appointmentCode ||
      summary?.appointmentCode ||
      buildFallbackTicketCode('YMA', item.id, dateValue),
    paymentStatus: item?.paymentStatus || summary?.paymentStatus || '',
    paymentMethod: item?.paymentMethod || summary?.paymentMethod || '--',
    paymentAmount: item?.paymentAmount || item?.serviceFee || summary?.paymentAmount || 0,
    resultText: item?.resultSummary || item?.result || 'Đang chờ kết quả cập nhật',
  }
}

const normalizeConsultation = (item) => {
  const summary = loadPaymentBookingSummaryByConsultationId(item.id)
  const dateValue = summary?.date || item?.scheduledDate || item?.createdAt || ''
  const timeValue = summary?.time || item?.scheduledTime || ''

  return {
    ...item,
    recordId: buildRecordId('consultation', item.id),
    resourceType: 'CONSULTATION',
    resourceId: item.id,
    summary,
    dateValue,
    timeValue,
    title: item?.topic || item?.doctorName || 'Đặt lịch tư vấn',
    doctorName: item?.doctorName || summary?.doctorName || 'Bác sĩ',
    doctorAvatar: item?.doctorAvatar || summary?.doctorAvatar || '',
    clinicName: item?.clinicName || summary?.clinicName || '',
    doctorAddress:
      summary?.doctorAddress ||
      item?.clinicAddress ||
      item?.clinicName ||
      '--',
    patientName: item?.patientName || summary?.patientName || '--',
    patientCode: item?.patientCode || summary?.patientCode || '--',
    patientDateOfBirth: item?.patientDateOfBirth || summary?.patientDateOfBirth || '--',
    patientGender: item?.patientGender || summary?.patientGender || '--',
    patientPhone: item?.patientPhone || summary?.patientPhone || '--',
    patientAddress: item?.patientAddress || summary?.patientAddress || '--',
    specialization: item?.specialization || summary?.doctorSpecialization || 'Chưa cập nhật',
    ticketCode:
      item?.consultationCode ||
      item?.requestCode ||
      summary?.consultationCode ||
      buildFallbackTicketCode('YTV', item.id, dateValue),
    topic: item?.topic || summary?.topic || '--',
    description: item?.description || summary?.description || '',
    paymentMethod: item?.paymentMethod || summary?.paymentMethod || '--',
    paymentAmount: item?.paymentAmount || summary?.paymentAmount || item?.fee || 0,
    paymentStatus: item?.paymentStatus || summary?.paymentStatus || '',
    resultText:
      item?.doctorNotes ||
      item?.latestMessagePreview ||
      item?.description ||
      'Phiếu tư vấn đang chờ bác sĩ cập nhật.',
  }
}

const formatCurrency = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return '--'
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} đ`
}

const StatusLabel = ({ meta }) => (
  <span className={`${labelBaseClass} ${meta.className}`}>{meta.label}</span>
)

const Appointments = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [records, setRecords] = useState([])
  const [selectedRecordId, setSelectedRecordId] = useState(getSelectedRecordId(searchParams))
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [filterOpen, setFilterOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    if (!user?.id) return

    const loadData = async () => {
      setIsLoading(true)

      try {
        const [appointmentResult, consultationResult] = await Promise.allSettled([
          appointmentApi.getAppointments({ patientId: user.id, includeUnpaid: true }),
          consultationApi.getConsultationsByPatient(user.id, 0, 50),
        ])

        const appointments =
          appointmentResult.status === 'fulfilled'
            ? (Array.isArray(appointmentResult.value) ? appointmentResult.value : []).map(
                normalizeAppointment,
              )
            : []

        const consultations =
          consultationResult.status === 'fulfilled'
            ? (
                Array.isArray(consultationResult.value?.content)
                  ? consultationResult.value.content
                  : Array.isArray(consultationResult.value)
                    ? consultationResult.value
                    : []
              ).map(normalizeConsultation)
            : []

        if (
          appointmentResult.status === 'rejected' &&
          consultationResult.status === 'rejected'
        ) {
          showToast({ type: 'error', message: 'Không thể tải danh sách lịch đặt hẹn' })
        }

        setRecords(sortRecords([...appointments, ...consultations]))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [showToast, user?.id])

  useEffect(() => {
    const queryRecordId = getSelectedRecordId(searchParams)
    if (queryRecordId && queryRecordId !== selectedRecordId) {
      setSelectedRecordId(queryRecordId)
    }
  }, [searchParams, selectedRecordId])

  const filteredRecords = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    return records.filter((record) => {
      const haystack = [
        record.title,
        record.doctorName,
        record.patientName,
        record.specialization,
        record.ticketCode,
        record.topic,
        record.clinicName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const recordDate = String(record.dateValue || '').slice(0, 10)

      if (keyword && !haystack.includes(keyword)) return false
      if (filters.startDate && (!recordDate || recordDate < filters.startDate)) return false
      if (filters.endDate && (!recordDate || recordDate > filters.endDate)) return false
      if (!matchesStatusFilter(record, filters.status)) return false
      if (filters.service !== 'ALL' && record.resourceType !== filters.service) return false
      if (filters.place !== 'ALL' && inferPlaceType(record) !== filters.place) return false

      return true
    })
  }, [filters, records, searchQuery])

  const selectedRecord = useMemo(
    () => records.find((record) => String(record.recordId) === String(selectedRecordId)) || null,
    [records, selectedRecordId],
  )

  useEffect(() => {
    if (filteredRecords.length === 0) {
      setSelectedDetail(null)
      return
    }

    const candidate =
      filteredRecords.find((record) => record.recordId === selectedRecordId) ||
      filteredRecords[0]

    if (!candidate) return

    if (candidate.recordId !== selectedRecordId) {
      setSelectedRecordId(candidate.recordId)
      setSearchParams({ bookingId: candidate.recordId }, { replace: true })
      return
    }

    const loadDetail = async () => {
      setIsDetailLoading(true)

      try {
        const detail =
          candidate.resourceType === 'CONSULTATION'
            ? await consultationApi.getConsultationById(candidate.resourceId)
            : await appointmentApi.getAppointment(candidate.resourceId)

        setSelectedDetail(detail)
      } catch (error) {
        setSelectedDetail(candidate)
      } finally {
        setIsDetailLoading(false)
      }
    }

    loadDetail()
  }, [filteredRecords, selectedRecordId, setSearchParams])

  const viewModel = useMemo(() => {
    if (!selectedRecord) return null

    return selectedRecord.resourceType === 'CONSULTATION'
      ? normalizeConsultation({ ...selectedRecord, ...selectedDetail })
      : normalizeAppointment({ ...selectedRecord, ...selectedDetail })
  }, [selectedDetail, selectedRecord])

  const handleSelect = (recordId) => {
    setSelectedRecordId(recordId)
    setSearchParams({ bookingId: recordId }, { replace: true })
  }

  const handleToggleFilter = () => {
    setDraftFilters(filters)
    setFilterOpen((current) => !current)
  }

  const handleApplyFilters = () => {
    if (
      draftFilters.startDate &&
      draftFilters.endDate &&
      draftFilters.startDate > draftFilters.endDate
    ) {
      showToast({
        type: 'error',
        message: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc',
      })
      return
    }

    setFilters(draftFilters)
    setFilterOpen(false)
  }

  const handleResetFilters = () => {
    setDraftFilters(emptyFilters)
    setFilters(emptyFilters)
    setFilterOpen(false)
  }

  const handleCancelAppointment = async () => {
    if (!selectedRecord || selectedRecord.resourceType !== 'APPOINTMENT') return

    try {
      await appointmentApi.cancelAppointment(selectedRecord.resourceId, cancelReason)
      showToast({ type: 'success', message: 'Đã hủy lịch khám' })
      setCancelModalOpen(false)
      setCancelReason('')

      setRecords((current) =>
        current.map((record) =>
          record.recordId === selectedRecord.recordId
            ? { ...record, status: 'CANCELLED' }
            : record,
        ),
      )
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể hủy lịch khám' })
    }
  }

  if (isLoading) {
    return <Loading />
  }

  const selectedStatusMeta = viewModel ? getStatusMeta(viewModel.status) : null
  const selectedPaymentMeta = viewModel
    ? getPaymentStatusMeta(viewModel)
    : paymentStatusMap.UNKNOWN

  return repairReactNode(
    <div className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold tracking-[-0.02em] text-[#143c26]">
          Lịch đặt hẹn
        </h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <section className="overflow-hidden border border-[#d7e2da] bg-white">
          <div className="border-b border-[#d7e2da] px-5 py-4">
            <div className="relative flex items-stretch gap-3">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Mã phiếu, bác sĩ, bệnh nhân..."
                leftIcon={<Search className="h-4 w-4" />}
                containerClassName="min-w-0 flex-1"
                className="!rounded-[6px] border-[#d7e2da] pr-4"
              />

              <button
                type="button"
                onClick={handleToggleFilter}
                className={`flex min-w-[102px] items-center justify-center gap-2 rounded-[6px] border px-4 text-sm font-semibold transition ${
                  filterOpen
                    ? 'border-[#0f4f2a] bg-[#f1f6f2] text-[#0f4f2a]'
                    : 'border-[#d7e2da] bg-white text-[#173925]'
                }`}
              >
                <Filter className="h-4 w-4" />
                Lọc
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-20 w-[360px] border border-[#d7e2da] bg-white p-5 shadow-[0_18px_48px_rgba(15,79,42,0.14)]">
                  <div className="space-y-5">
                    <div>
                      <div className="mb-2 text-sm font-semibold text-[#173925]">
                        Ngày hẹn
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#6b7f72]">
                            Ngày bắt đầu
                          </label>
                          <input
                            type="date"
                            value={draftFilters.startDate}
                            onChange={(event) =>
                              setDraftFilters((current) => ({
                                ...current,
                                startDate: event.target.value,
                              }))
                            }
                            className="h-11 w-full rounded-[6px] border border-[#d7e2da] px-3 text-sm text-[#173925] outline-none focus:border-[#0f4f2a]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#6b7f72]">
                            Ngày kết thúc
                          </label>
                          <input
                            type="date"
                            value={draftFilters.endDate}
                            onChange={(event) =>
                              setDraftFilters((current) => ({
                                ...current,
                                endDate: event.target.value,
                              }))
                            }
                            className="h-11 w-full rounded-[6px] border border-[#d7e2da] px-3 text-sm text-[#173925] outline-none focus:border-[#0f4f2a]"
                          />
                        </div>
                      </div>
                    </div>

                    <Select
                      label="Trạng thái"
                      value={draftFilters.status}
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                      options={statusOptions}
                      className="!rounded-[6px] !border-[#d7e2da] !py-3"
                    />

                    <Select
                      label="Nơi khám"
                      value={draftFilters.place}
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          place: event.target.value,
                        }))
                      }
                      options={placeOptions}
                      className="!rounded-[6px] !border-[#d7e2da] !py-3"
                    />

                    <div>
                      <div className="mb-2 text-sm font-semibold text-[#173925]">
                        Loại lịch
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {serviceOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setDraftFilters((current) => ({
                                ...current,
                                service: option.value,
                              }))
                            }
                            className={`${chipBase} ${
                              draftFilters.service === option.value
                                ? 'border-[#0f4f2a] bg-[#eff7f1] text-[#0f4f2a]'
                                : 'border-[#d7e2da] bg-white text-[#51685a]'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <Button
                        className={`${primaryButtonClass} justify-center`}
                        onClick={handleApplyFilters}
                      >
                        Áp dụng
                      </Button>
                      <Button
                        variant="outline"
                        className={`${secondaryButtonClass} justify-center`}
                        onClick={handleResetFilters}
                      >
                        Bỏ lọc
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="max-h-[900px] overflow-y-auto">
            {filteredRecords.length === 0 ? (
              <div className="px-5 py-8 text-sm text-[#5f7363]">
                Không có lịch đặt hẹn phù hợp.
              </div>
            ) : (
              filteredRecords.map((record) => {
                const isConsultation = record.resourceType === 'CONSULTATION'
                const statusMeta = getStatusMeta(record.status)
                const paymentMeta = getPaymentStatusMeta(record)
                const isActive = record.recordId === selectedRecordId

                return (
                  <button
                    key={record.recordId}
                    type="button"
                    onClick={() => handleSelect(record.recordId)}
                    className={`w-full border-b border-[#e5ece6] px-5 py-4 text-left transition ${
                      isActive ? 'bg-[#f4faf5]' : 'bg-white hover:bg-[#f8fbf8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 inline-flex rounded-full bg-[#e9f4ec] px-2.5 py-1 text-[11px] font-semibold text-[#0f4f2a]">
                          {isConsultation ? 'Đặt lịch tư vấn' : 'Đặt lịch khám'}
                        </div>
                        <div className="truncate text-[18px] font-semibold leading-6 text-[#143c26]">
                          {record.title}
                        </div>
                        <div className="mt-1 text-sm text-[#51685a]">
                          {`${normalizeTime(record.timeValue) || '--'} - ${formatDateLabel(record.dateValue)}`}
                        </div>
                        <div className="mt-3 text-sm font-semibold uppercase tracking-[0.01em] text-[#173925]">
                          {record.patientName}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <StatusLabel meta={statusMeta} />
                          {paymentMeta.label && <StatusLabel meta={paymentMeta} />}
                        </div>
                      </div>

                      {!isConsultation && (
                        <div className="min-w-[58px] text-right">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7f72]">
                            STT
                          </div>
                          <div className="mt-2 text-[28px] font-bold leading-none text-[#0f4f2a]">
                            {record.queueNumber}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>
        <section className="overflow-hidden border border-[#d7e2da] bg-white">
          {isDetailLoading ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <Loading />
            </div>
          ) : !viewModel ? (
            <div className="px-6 py-10 text-sm text-[#5f7363]">
              Chọn một lịch đặt hẹn để xem phiếu.
            </div>
          ) : (
            <div>
              <div className="border-b border-[#d7e2da] px-7 py-6">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7f72]">
                      {viewModel.resourceType === 'CONSULTATION' ? 'Phiếu tư vấn' : 'STT'}
                    </div>
                    <div className="mt-3 text-[42px] font-bold leading-none text-[#0f4f2a]">
                      {viewModel.resourceType === 'CONSULTATION'
                        ? viewModel.ticketCode
                        : viewModel.queueNumber}
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    {selectedStatusMeta && <StatusLabel meta={selectedStatusMeta} />}
                    {selectedPaymentMeta.label && <StatusLabel meta={selectedPaymentMeta} />}
                  </div>
                </div>
              </div>

              <div className="border-b border-[#d7e2da] px-7 py-6">
                <div className="flex items-start gap-4">
                  <Avatar
                    src={viewModel.doctorAvatar}
                    name={viewModel.doctorName}
                    size="xl"
                  />
                  <div className="min-w-0">
                    <div className="text-[24px] font-semibold leading-7 text-[#143c26]">
                      {viewModel.doctorName}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[#51685a]">
                      {viewModel.resourceType === 'CONSULTATION'
                        ? 'Nơi tư vấn'
                        : 'Phòng mạch'}
                      : {viewModel.doctorAddress}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-[#d7e2da] px-7 py-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#0f4f2a]" />
                  <h2 className="text-lg font-semibold text-[#143c26]">
                    {viewModel.resourceType === 'CONSULTATION'
                      ? 'Thông tin tư vấn'
                      : 'Thông tin đặt khám'}
                  </h2>
                </div>

                <div className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
                  <div>
                    <div className="text-sm text-[#6b7f72]">
                      {viewModel.resourceType === 'CONSULTATION'
                        ? 'Mã phiếu tư vấn'
                        : 'Mã phiếu khám'}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {viewModel.ticketCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7f72]">
                      {viewModel.resourceType === 'CONSULTATION'
                        ? 'Ngày tư vấn'
                        : 'Ngày khám'}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {formatDateLabel(viewModel.dateValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7f72]">
                      {viewModel.resourceType === 'CONSULTATION'
                        ? 'Giờ tư vấn'
                        : 'Giờ khám'}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {normalizeTime(viewModel.timeValue) || '--'}
                      {viewModel.summary?.periodLabel
                        ? ` (${viewModel.summary.periodLabel})`
                        : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7f72]">Chuyên khoa</div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {viewModel.specialization}
                    </div>
                  </div>
                  {selectedPaymentMeta.label && (
                    <div>
                      <div className="text-sm text-[#6b7f72]">Thanh toán</div>
                      <div className="mt-2">
                        <StatusLabel meta={selectedPaymentMeta} />
                      </div>
                    </div>
                  )}
                  {viewModel.paymentAmount > 0 && (
                    <div>
                      <div className="text-sm text-[#6b7f72]">
                        {viewModel.resourceType === 'CONSULTATION'
                          ? 'Phí tư vấn'
                          : 'Chi phí'}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-[#173925]">
                        {formatCurrency(viewModel.paymentAmount)}
                      </div>
                    </div>
                  )}

                  {viewModel.resourceType === 'CONSULTATION' && (
                    <>
                      <div>
                        <div className="text-sm text-[#6b7f72]">Chủ đề</div>
                        <div className="mt-1 text-sm font-semibold text-[#173925]">
                          {viewModel.topic}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#6b7f72]">
                          Phương thức thanh toán
                        </div>
                        <div className="mt-1 text-sm font-semibold text-[#173925]">
                          {viewModel.paymentMethod}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-sm text-[#6b7f72]">Mô tả</div>
                        <div className="mt-1 text-sm font-semibold text-[#173925]">
                          {viewModel.description || 'Không có mô tả thêm'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border-b border-[#d7e2da] px-7 py-6">
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-[#0f4f2a]" />
                  <h2 className="text-lg font-semibold text-[#143c26]">
                    Thông tin bệnh nhân
                  </h2>
                </div>

                <div className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
                  <div>
                    <div className="text-sm text-[#6b7f72]">Mã bệnh nhân</div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {viewModel.patientCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7f72]">Họ và tên</div>
                    <div className="mt-1 text-sm font-semibold uppercase text-[#173925]">
                      {viewModel.patientName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7f72]">Năm sinh</div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {formatDateLabel(viewModel.patientDateOfBirth)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7f72]">Số điện thoại</div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {viewModel.patientPhone}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7f72]">Giới tính</div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {formatGenderLabel(viewModel.patientGender)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7f72]">Địa chỉ</div>
                    <div className="mt-1 text-sm font-semibold uppercase text-[#173925]">
                      {viewModel.patientAddress}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-[#d7e2da] px-7 py-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#0f4f2a]" />
                  <h2 className="text-lg font-semibold text-[#143c26]">
                    {viewModel.resourceType === 'CONSULTATION'
                      ? 'Phiếu tư vấn'
                      : 'Kết quả'}
                  </h2>
                </div>
                <div className="mt-4 text-sm text-[#51685a]">{viewModel.resultText}</div>
              </div>

              <div className="border-b border-[#d7e2da] px-7 py-5 text-sm text-[#51685a]">
                Tổng đài hỗ trợ và chăm sóc khách hàng 1900-2805
              </div>

              <div className="px-7 py-5">
                {viewModel.resourceType === 'APPOINTMENT' &&
                  ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(
                    String(viewModel.status || '').toUpperCase(),
                  ) && (
                    <Button
                      variant="outline"
                      className={`${secondaryButtonClass} w-full justify-center border-[#b53b2f] text-[#b53b2f] hover:bg-[#faeceb] hover:text-[#b53b2f]`}
                      leftIcon={<XCircle className="h-4 w-4" />}
                      onClick={() => setCancelModalOpen(true)}
                    >
                      Hủy lịch
                    </Button>
                  )}
              </div>
            </div>
          )}
        </section>
      </div>

      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Hủy lịch"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#51685a]">
            Bạn có chắc muốn hủy lịch khám này không? Có thể thêm lý do nếu cần.
          </p>
          <textarea
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Lý do hủy lịch"
            className="min-h-[110px] w-full rounded-[6px] border border-[#d7e2da] px-3 py-3 text-sm outline-none focus:border-[#0f4f2a]"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className={`${secondaryButtonClass} flex-1 justify-center`}
              onClick={() => setCancelModalOpen(false)}
            >
              Đóng
            </Button>
            <Button
              className={`${primaryButtonClass} flex-1 justify-center`}
              onClick={handleCancelAppointment}
            >
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </Modal>
    </div>,
  )
}

export default Appointments
