import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  FileText,
  Filter,
  Mail,
  Phone,
  Search,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { userApi } from '@/api/userApiWrapper'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { medicalRecordApi } from '@/api/medicalRecordApiWrapper'
import { consultationApi } from '@/api/consultationApiWrapper'
import { formatPhone } from '@/lib/utils'
import { doctorPrimaryButtonClass } from './theme'

const HISTORY_FILTERS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'IN_PERSON', label: 'Khám trực tiếp' },
  { id: 'ONLINE', label: 'Tư vấn trực tuyến' },
]

const STATUS_META = {
  PENDING: { label: 'Chờ xác nhận', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'border-sky-200 bg-sky-50 text-sky-700' },
  ACCEPTED: { label: 'Đã nhận', className: 'border-sky-200 bg-sky-50 text-sky-700' },
  IN_PROGRESS: { label: 'Đang thực hiện', className: 'border-violet-200 bg-violet-50 text-violet-700' },
  COMPLETED: { label: 'Hoàn thành', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Đã hủy', className: 'border-rose-200 bg-rose-50 text-rose-700' },
  REJECTED: { label: 'Từ chối', className: 'border-slate-200 bg-slate-100 text-slate-600' },
}

function normalizeDoctorId(value) {
  return String(value ?? '')
}

function isSameDoctor(left, right) {
  return normalizeDoctorId(left) === normalizeDoctorId(right)
}

function isOnlineService(type) {
  return ['ONLINE', 'CONSULTATION', 'VIDEO_CALL'].includes(String(type || '').toUpperCase())
}

function getServiceTypeLabel(type) {
  return type === 'ONLINE' ? 'Tư vấn trực tuyến' : 'Khám trực tiếp'
}

function getStatusMeta(status) {
  return STATUS_META[String(status || '').toUpperCase()] || STATUS_META.PENDING
}

function formatVietnameseDate(dateValue) {
  if (!dateValue) return 'Chưa cập nhật'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return String(dateValue)

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatVietnameseDateTime(dateValue, timeValue) {
  if (!dateValue && !timeValue) return 'Chưa cập nhật'

  const normalizedTime = String(timeValue || '').slice(0, 5)
  if (dateValue) {
    const combined = normalizedTime ? `${dateValue}T${normalizedTime}` : dateValue
    const date = new Date(combined)
    if (!Number.isNaN(date.getTime())) {
      const dateLabel = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
      const timeLabel = new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date)
      return `${dateLabel} - ${timeLabel}`
    }
  }

  return normalizedTime ? `${String(dateValue || '').slice(0, 10)} - ${normalizedTime}` : String(dateValue)
}

function formatGender(gender) {
  const normalized = String(gender || '').toUpperCase()
  if (normalized === 'MALE') return 'Nam'
  if (normalized === 'FEMALE') return 'Nữ'
  if (normalized === 'OTHER') return 'Khác'
  return 'Chưa cập nhật'
}

function getAgeLabel(age) {
  if (typeof age === 'number' && Number.isFinite(age) && age >= 0) return `${age} tuổi`
  return 'Chưa cập nhật tuổi'
}

function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  return []
}

function normalizeDateOnly(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/)
    if (match) return match[1]
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isDateWithinRange(dateValue, fromDate, toDate) {
  const normalizedDate = normalizeDateOnly(dateValue)
  if (!normalizedDate) return false
  if (fromDate && normalizedDate < fromDate) return false
  if (toDate && normalizedDate > toDate) return false
  return true
}

function getTimelineTimestamp(item) {
  const dateValue = item?.dateValue
  const timeValue = String(item?.timeValue || '').slice(0, 5)
  const combined = dateValue ? `${dateValue}T${timeValue || '00:00'}` : item?.rawTimestamp
  const timestamp = new Date(combined || '').getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function buildHistoryEntries({ appointments, medicalRecords, consultations, doctorId, doctorNameFallback }) {
  const recordsByAppointmentId = new Map()

  medicalRecords
    .filter((record) => isSameDoctor(record?.doctorId, doctorId))
    .forEach((record) => {
      if (record?.appointmentId != null) recordsByAppointmentId.set(String(record.appointmentId), record)
    })

  const inPersonEntries = appointments
    .filter((appointment) => isSameDoctor(appointment?.doctorId, doctorId))
    .filter((appointment) => !isOnlineService(appointment?.type))
    .map((appointment) => {
      const record = recordsByAppointmentId.get(String(appointment.id)) || null
      return {
        id: `appointment-${appointment.id}`,
        type: 'IN_PERSON',
        dateValue: appointment.appointmentDate || appointment.date || record?.createdAt || null,
        timeValue: appointment.appointmentTime || appointment.time || null,
        rawTimestamp: appointment.appointmentDate || appointment.date || record?.createdAt || null,
        status: appointment.status || record?.status || 'COMPLETED',
        doctorName: record?.doctorName || appointment.doctorName || doctorNameFallback,
        symptoms: record?.symptoms || appointment.reason || appointment.symptoms || 'Chưa cập nhật',
        conclusion: record?.diagnosis || 'Chưa cập nhật',
        advice: record?.treatmentPlan || record?.notes || 'Chưa cập nhật',
        followUpDate: record?.followUpDate || null,
      }
    })

  const onlineEntries = consultations
    .filter((consultation) => isSameDoctor(consultation?.doctorId, doctorId))
    .map((consultation) => ({
      id: `consultation-${consultation.id}`,
      type: 'ONLINE',
      dateValue:
        consultation.consultationDate ||
        consultation.appointmentDate ||
        consultation.scheduledAt ||
        consultation.createdAt ||
        consultation.updatedAt ||
        null,
      timeValue:
        consultation.consultationTime ||
        consultation.appointmentTime ||
        consultation.time ||
        null,
      rawTimestamp:
        consultation.scheduledAt ||
        consultation.createdAt ||
        consultation.updatedAt ||
        consultation.consultationDate ||
        null,
      status: consultation.status || 'COMPLETED',
      doctorName: consultation.doctorName || doctorNameFallback,
      symptoms: consultation.symptoms || consultation.description || consultation.topic || 'Chưa cập nhật',
      conclusion: consultation.diagnosis || 'Chưa cập nhật',
      advice: consultation.doctorNotes || 'Chưa cập nhật',
      followUpDate: consultation.followUpDate || null,
    }))

  return [...inPersonEntries, ...onlineEntries].sort(
    (left, right) => getTimelineTimestamp(right) - getTimelineTimestamp(left)
  )
}

function PatientDetailField({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="mt-2 text-[15px] text-slate-900">{value || 'Chưa cập nhật'}</div>
    </div>
  )
}

function HistoryBlock({ entry }) {
  const statusMeta = getStatusMeta(entry.status)

  return (
    <div className="relative rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <div className="absolute left-[-34px] top-8 hidden h-4 w-4 rounded-full border-4 border-white bg-[#29352B] shadow md:block" />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">
            {formatVietnameseDateTime(entry.dateValue, entry.timeValue)}
          </h3>
          <div className="mt-4 space-y-2 text-[15px] text-slate-700">
            <p><span className="font-semibold text-slate-900">Loại dịch vụ:</span> {getServiceTypeLabel(entry.type)}</p>
            <p><span className="font-semibold text-slate-900">Bác sĩ:</span> {entry.doctorName || 'Chưa cập nhật'}</p>
            <p><span className="font-semibold text-slate-900">Trạng thái:</span> {statusMeta.label}</p>
          </div>
        </div>

        <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
          {statusMeta.label}
        </span>
      </div>

      <div className="mt-6 space-y-5 rounded-[20px] bg-slate-50/80 p-5">
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500">Triệu chứng:</div>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-slate-900">{entry.symptoms || 'Chưa cập nhật'}</p>
        </div>

        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            {entry.type === 'ONLINE' ? 'Kết luận tư vấn:' : 'Kết luận:'}
          </div>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-slate-900">{entry.conclusion || 'Chưa cập nhật'}</p>
        </div>

        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500">Dặn dò:</div>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-slate-900">{entry.advice || 'Chưa cập nhật'}</p>
        </div>

        {entry.type === 'IN_PERSON' && (
          <div>
            <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500">Ngày tái khám:</div>
            <p className="mt-2 text-[15px] text-slate-900">
              {entry.followUpDate ? formatVietnameseDate(entry.followUpDate) : 'Chưa có lịch tái khám'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const DoctorPatients = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()

  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [patientDateFrom, setPatientDateFrom] = useState('')
  const [patientDateTo, setPatientDateTo] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyEntries, setHistoryEntries] = useState([])
  const [activeHistoryFilter, setActiveHistoryFilter] = useState('ALL')
  const [historyDateFrom, setHistoryDateFrom] = useState('')
  const [historyDateTo, setHistoryDateTo] = useState('')
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    const keyword = searchQuery.trim().toLowerCase()

    setFilteredPatients(
      patients.filter((patient) => {
        const matchesKeyword =
          !keyword ||
          [patient.name, formatPhone(patient.phone), patient.email]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(keyword))

        const matchesDateRange =
          (!patientDateFrom && !patientDateTo) ||
          (patient.visitDates || []).some((visitDate) => isDateWithinRange(visitDate, patientDateFrom, patientDateTo))

        return matchesKeyword && matchesDateRange
      })
    )
  }, [patients, searchQuery, patientDateFrom, patientDateTo])

  const fetchPatients = async () => {
    setIsLoading(true)
    try {
      const [patientsData, doctorAppointments] = await Promise.all([
        userApi.getDoctorPatients(user.id),
        appointmentApi.getDoctorAppointments(user.id, { page: 0, size: 1000 }),
      ])

      const visitsByPatientId = new Map()

      toArray(doctorAppointments).forEach((appointment) => {
        const patientId = String(appointment?.patientId ?? '')
        const appointmentDate = normalizeDateOnly(appointment?.appointmentDate || appointment?.date)
        if (!patientId || !appointmentDate) return
        if (!visitsByPatientId.has(patientId)) visitsByPatientId.set(patientId, [])
        visitsByPatientId.get(patientId).push(appointmentDate)
      })

      const enrichedPatients = patientsData.map((patient) => {
        const visitDates = Array.from(new Set(visitsByPatientId.get(String(patient.id)) || []))
          .sort((left, right) => right.localeCompare(left))

        return {
          ...patient,
          visitDates,
          lastVisit: patient.lastVisit || visitDates[0] || null,
        }
      })

      const sortedPatients = [...enrichedPatients].sort((left, right) => {
        const leftTime = new Date(left.lastVisit || 0).getTime()
        const rightTime = new Date(right.lastVisit || 0).getTime()
        return rightTime - leftTime
      })

      setPatients(sortedPatients)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải danh sách bệnh nhân' })
    } finally {
      setIsLoading(false)
    }
  }

  const openPatientDetails = (patient) => {
    setSelectedPatient(patient)
    setShowDetailModal(true)
  }

  const openPatientHistory = async (patient) => {
    setSelectedPatient(patient)
    setHistoryEntries([])
    setActiveHistoryFilter('ALL')
    setHistoryDateFrom('')
    setHistoryDateTo('')
    setShowHistoryModal(true)
    setIsHistoryLoading(true)

    try {
      const [appointmentsResult, medicalRecordsResult, consultationsResult] = await Promise.allSettled([
        appointmentApi.getPatientAppointments(patient.id, { page: 0, size: 100 }),
        medicalRecordApi.getRecordsByPatient(patient.id),
        consultationApi.getConsultationsByPatient(patient.id, 0, 100),
      ])

      const appointments = appointmentsResult.status === 'fulfilled' ? toArray(appointmentsResult.value) : []
      const medicalRecords = medicalRecordsResult.status === 'fulfilled' ? toArray(medicalRecordsResult.value) : []
      const consultations = consultationsResult.status === 'fulfilled' ? toArray(consultationsResult.value) : []

      const entries = buildHistoryEntries({
        appointments,
        medicalRecords,
        consultations,
        doctorId: user.id,
        doctorNameFallback: user.fullName,
      })

      setHistoryEntries(entries)

      if (
        appointmentsResult.status === 'rejected' &&
        medicalRecordsResult.status === 'rejected' &&
        consultationsResult.status === 'rejected'
      ) {
        throw new Error('Không thể tải dữ liệu lịch sử khám')
      }
    } catch (error) {
      setHistoryEntries([])
      showToast({ type: 'error', message: 'Không thể tải lịch sử khám của bệnh nhân' })
    } finally {
      setIsHistoryLoading(false)
    }
  }

  const visibleHistoryEntries = historyEntries.filter((entry) => {
    const matchesType = activeHistoryFilter === 'ALL' || entry.type === activeHistoryFilter
    const matchesDate = (!historyDateFrom && !historyDateTo) || isDateWithinRange(entry.dateValue, historyDateFrom, historyDateTo)
    return matchesType && matchesDate
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[24px] border-slate-200 p-0 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
        <CardContent className="p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_220px_220px_auto]">
            <Input
              type="text"
              placeholder="Tìm theo tên bệnh nhân, số điện thoại hoặc email..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
              className="h-12 rounded-[16px] border-slate-200"
            />
            <Input
              type="date"
              value={patientDateFrom}
              onChange={(event) => setPatientDateFrom(event.target.value)}
              className="h-12 rounded-[16px] border-slate-200"
            />
            <Input
              type="date"
              value={patientDateTo}
              min={patientDateFrom || undefined}
              onChange={(event) => setPatientDateTo(event.target.value)}
              className="h-12 rounded-[16px] border-slate-200"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPatientDateFrom('')
                setPatientDateTo('')
              }}
              className="h-12 rounded-[16px] border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Xóa lọc ngày
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredPatients.map((patient, index) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <Card className="rounded-[28px] border-slate-200 p-0 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 items-start gap-4">
                    <Avatar
                      src={patient.avatar || `https://i.pravatar.cc/150?u=${patient.id}`}
                      alt={patient.name}
                      size="xl"
                    />

                    <div className="flex-1">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-900">
                            {patient.name}
                          </h2>
                          <p className="mt-1 text-[15px] text-slate-600">
                            {getAgeLabel(patient.age)} • {formatGender(patient.gender)}
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Lần khám gần nhất</div>
                            <div className="mt-2 text-[15px] font-medium text-slate-900">
                              {patient.lastVisit ? formatVietnameseDate(patient.lastVisit) : 'Chưa có'}
                            </div>
                          </div>
                          <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Tổng lượt khám</div>
                            <div className="mt-2 text-[15px] font-medium text-slate-900">{patient.appointmentCount || 0}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 text-[14px] text-slate-600 md:grid-cols-2">
                        <div className="flex items-center gap-2 rounded-[16px] border border-slate-200 px-4 py-3">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{formatPhone(patient.phone) || 'Chưa có số điện thoại'}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-[16px] border border-slate-200 px-4 py-3">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="truncate">{patient.email || 'Chưa có email'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:w-[270px]">
                    <Button
                      onClick={() => openPatientDetails(patient)}
                      className={`rounded-[16px] ${doctorPrimaryButtonClass}`}
                      leftIcon={<UserRound className="h-4 w-4" />}
                    >
                      Xem chi tiết bệnh nhân
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openPatientHistory(patient)}
                      className="rounded-[16px] border-slate-200 text-slate-800 hover:bg-slate-50"
                      leftIcon={<FileText className="h-4 w-4" />}
                    >
                      Xem lịch sử khám
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card className="rounded-[28px] border-dashed border-slate-300 bg-white/80 p-0">
          <CardContent className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-slate-900">Không tìm thấy bệnh nhân phù hợp</h3>
            <p className="mt-2 text-[15px] text-slate-600">Hãy thử đổi từ khóa tìm kiếm hoặc điều chỉnh lại khoảng ngày lọc.</p>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedPatient(null)
        }}
        title="Chi tiết bệnh nhân"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f7faf7_60%,#eef4ef_100%)] p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <Avatar
                  src={selectedPatient.avatar || `https://i.pravatar.cc/150?u=${selectedPatient.id}`}
                  alt={selectedPatient.name}
                  size="2xl"
                />
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">Hồ sơ bệnh nhân</div>
                  <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-900">{selectedPatient.name}</h2>
                  <p className="mt-2 text-[15px] text-slate-600">{getAgeLabel(selectedPatient.age)} • {formatGender(selectedPatient.gender)}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 rounded-[24px] border border-slate-200 bg-white p-6 md:grid-cols-2">
              <PatientDetailField label="Họ và tên" value={selectedPatient.name} />
              <PatientDetailField label="Giới tính" value={formatGender(selectedPatient.gender)} />
              <PatientDetailField label="Tuổi" value={getAgeLabel(selectedPatient.age)} />
              <PatientDetailField label="Ngày sinh" value={selectedPatient.dateOfBirth ? formatVietnameseDate(selectedPatient.dateOfBirth) : 'Chưa cập nhật'} />
              <PatientDetailField label="Số điện thoại" value={formatPhone(selectedPatient.phone) || 'Chưa có'} />
              <PatientDetailField label="Email" value={selectedPatient.email || 'Chưa có'} />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false)
          setSelectedPatient(null)
          setHistoryEntries([])
          setIsHistoryLoading(false)
          setActiveHistoryFilter('ALL')
          setHistoryDateFrom('')
          setHistoryDateTo('')
        }}
        title="Lịch sử khám"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8faf8_60%,#eef4ef_100%)] px-5 py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={selectedPatient.avatar || `https://i.pravatar.cc/150?u=${selectedPatient.id}`}
                    alt={selectedPatient.name}
                    size="lg"
                  />
                  <div>
                    <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900">{selectedPatient.name}</h3>
                    <p className="mt-1 text-[14px] text-slate-600">
                      {formatPhone(selectedPatient.phone) || 'Chưa có số điện thoại'} • {selectedPatient.email || 'Chưa có email'}
                    </p>
                  </div>
                </div>

                <div className="rounded-[18px] bg-white px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">Tổng mốc lịch sử</div>
                  <div className="mt-1 text-[24px] font-semibold text-slate-900">{historyEntries.length}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                <Filter className="h-4 w-4" />
                Bộ lọc lịch sử
              </div>
              <div className="flex flex-wrap gap-3">
                {HISTORY_FILTERS.map((filter) => {
                  const isActive = filter.id === activeHistoryFilter
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveHistoryFilter(filter.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-[#29352B] text-white shadow-[0_10px_24px_rgba(41,53,43,0.18)]'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,220px)_minmax(0,220px)_auto]">
                <Input
                  type="date"
                  value={historyDateFrom}
                  onChange={(event) => setHistoryDateFrom(event.target.value)}
                  leftIcon={<CalendarDays className="h-4 w-4" />}
                  className="h-11 rounded-[16px] border-slate-200"
                />
                <Input
                  type="date"
                  value={historyDateTo}
                  min={historyDateFrom || undefined}
                  onChange={(event) => setHistoryDateTo(event.target.value)}
                  leftIcon={<CalendarDays className="h-4 w-4" />}
                  className="h-11 rounded-[16px] border-slate-200"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setHistoryDateFrom('')
                    setHistoryDateTo('')
                  }}
                  className="h-11 rounded-[16px] border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Xóa lọc ngày
                </Button>
              </div>
            </div>

            {isHistoryLoading ? (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : visibleHistoryEntries.length > 0 ? (
              <div className="relative space-y-5 md:pl-8">
                <div className="absolute bottom-0 left-[6px] top-0 hidden w-px bg-slate-200 md:block" />
                {visibleHistoryEntries.map((entry) => (
                  <HistoryBlock key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <Card className="rounded-[24px] border-dashed border-slate-300 bg-white/80 p-0">
                <CardContent className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <Stethoscope className="h-7 w-7 text-slate-400" />
                  </div>
                  <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-slate-900">Chưa có lịch sử phù hợp</h3>
                  <p className="mt-2 text-[15px] text-slate-600">Không tìm thấy lần khám nào theo bộ lọc hiện tại cho bệnh nhân này.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DoctorPatients
