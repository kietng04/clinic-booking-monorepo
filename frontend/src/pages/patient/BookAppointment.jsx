import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  FileText,
  MapPin,
  Search,
  Stethoscope,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { userApi } from '@/api/userApiWrapper'
import { scheduleApi } from '@/api/scheduleApiWrapper'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { adminApi } from '@/api/adminApiWrapper'
import { familyMemberApi } from '@/api/familyMemberApiWrapper'
import { profileApi } from '@/api/profileApiWrapper'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'
import { saveAppointmentBookingSummary } from '@/utils/appointmentBookingSummary'
import { formatPhone } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Loading } from '@/components/ui/Loading'

const STEPS = [
  { id: 1, name: 'Chọn bác sĩ', description: 'Tìm bác sĩ phù hợp' },
  { id: 2, name: 'Chọn ngày giờ', description: 'Chọn lịch khám' },
  { id: 3, name: 'Thông tin', description: 'Điền thông tin bổ sung' },
  { id: 4, name: 'Xác nhận', description: 'Kiểm tra và thanh toán' },
]

const DAY_LABELS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

const progressButtonClass =
  'inline-flex items-center justify-center rounded-[8px] border border-[#0f4f2a] bg-[#0f4f2a] px-5 py-3 text-sm font-semibold text-white shadow-none hover:bg-[#0b3f21]'
const outlineButtonClass =
  'inline-flex items-center justify-center rounded-[8px] border border-[#0f4f2a] bg-white px-5 py-3 text-sm font-semibold text-[#0f4f2a] shadow-none hover:bg-[#eef5f0]'
const slotDurationMinutes = 15
const APPOINTMENT_FEE_DISPLAY = 'Liên hệ'

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const normalizeDoctor = (doctor) => ({
  ...doctor,
  id: doctor?.id,
  name: doctor?.name || doctor?.fullName || 'Bác sĩ',
  specialization: doctor?.specialization || 'Đa khoa',
  avatar: doctor?.avatar || doctor?.avatarUrl || '',
  rating: Number(doctor?.rating || 0),
  consultationFee: Number(doctor?.consultationFee || 0),
  yearsOfExperience: Number(doctor?.yearsOfExperience ?? doctor?.experienceYears ?? 0),
  workplace: doctor?.workplace || doctor?.hospital || doctor?.clinicName || 'Đang cập nhật',
  title: doctor?.title || doctor?.position || 'Bác sĩ chuyên khoa',
  introduction:
    doctor?.introduction || doctor?.bio || doctor?.description || doctor?.about || doctor?.profileDescription || '',
})

const startOfDay = (date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

const addDays = (date, days) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const parseDateOnly = (value) => {
  if (!value) return null
  const [year, month, day] = String(value).split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const formatDateOnly = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatShortDate = (value) => {
  const date = parseDateOnly(value) || new Date(value)
  if (Number.isNaN(date?.getTime?.())) return '--'
  return date.toLocaleDateString('vi-VN')
}

const formatLongDate = (value) => {
  const date = parseDateOnly(value) || new Date(value)
  if (Number.isNaN(date?.getTime?.())) return '--'
  return `${DAY_LABELS[date.getDay()]}, ${date.toLocaleDateString('vi-VN')}`
}

const formatBirthDate = (value) => {
  if (!value) return '--'
  const date = parseDateOnly(value) || new Date(value)
  if (Number.isNaN(date?.getTime?.())) return value
  return date.toLocaleDateString('vi-VN')
}

const formatCurrency = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return 'Liên hệ'
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} đ`
}

const buildSlotLabel = (time, durationMinutes = slotDurationMinutes) => {
  const normalizedTime = String(time || '').slice(0, 5)
  const [hour, minute] = normalizedTime.split(':').map(Number)

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return normalizedTime || '--'
  }

  const startMinutes = hour * 60 + minute
  const endMinutes = startMinutes + durationMinutes
  const endHour = String(Math.floor(endMinutes / 60)).padStart(2, '0')
  const endMinute = String(endMinutes % 60).padStart(2, '0')

  return `${normalizedTime}-${endHour}:${endMinute}`
}

const buildDateChoices = (count = 7) => {
  const choices = []
  let cursor = addDays(startOfDay(new Date()), 1)

  while (choices.length < count) {
    if (cursor.getDay() !== 0) {
      choices.push({
        value: formatDateOnly(cursor),
        weekdayLabel: DAY_LABELS[cursor.getDay()],
        dayMonthLabel: `${String(cursor.getDate()).padStart(2, '0')}-${String(
          cursor.getMonth() + 1,
        ).padStart(2, '0')}`,
      })
    }
    cursor = addDays(cursor, 1)
  }

  return choices
}

const groupSlotsByPeriod = (slots) => {
  const groups = [
    { key: 'morning', label: 'Buổi sáng', slots: [] },
    { key: 'afternoon', label: 'Buổi chiều', slots: [] },
    { key: 'evening', label: 'Buổi tối', slots: [] },
  ]

  slots.forEach((slot) => {
    const hour = Number(String(slot?.time || '').slice(0, 2))
    if (!Number.isFinite(hour)) return
    if (hour < 12) groups[0].slots.push(slot)
    else if (hour < 17) groups[1].slots.push(slot)
    else groups[2].slots.push(slot)
  })

  return groups.filter((group) => group.slots.length > 0)
}

const buildFallbackPatientCode = (profile) => {
  const dateDigits = String(profile?.dateOfBirth || '').replace(/\D/g, '')
  const idDigits = String(profile?.entityId || profile?.id || '')
    .replace(/\D/g, '')
    .slice(-4)
    .padStart(4, '0')

  if (dateDigits) return `YMP${dateDigits.slice(-6)}${idDigits}`
  return `YMP000000${idDigits}`
}

const buildSelfProfile = (profile, user) => ({
  id: 'self',
  entityId: user?.id || profile?.id || 'self',
  type: 'SELF',
  relationshipLabel: 'Tôi',
  fullName: profile?.fullName || user?.name || user?.fullName || 'Hồ sơ của tôi',
  dateOfBirth: profile?.dateOfBirth || user?.dateOfBirth || '',
  gender: profile?.gender || user?.gender || '',
  phone: formatPhone(profile?.phone || user?.phone || user?.phoneNumber || ''),
  email: profile?.email || user?.email || '',
  address: profile?.address || profile?.streetAddress || profile?.fullAddress || user?.address || '',
  avatar: profile?.avatar || profile?.avatarUrl || user?.avatar || user?.avatarUrl || '',
  patientCode: profile?.patientCode || buildFallbackPatientCode({ ...profile, entityId: user?.id }),
})

const buildFamilyProfile = (member) => ({
  id: `family-${member.id}`,
  entityId: member.id,
  type: 'FAMILY',
  relationshipLabel: member?.relationship || 'Người thân',
  fullName: member?.fullName || member?.name || 'Hồ sơ người thân',
  dateOfBirth: member?.dateOfBirth || '',
  gender: member?.gender || '',
  phone: formatPhone(member?.phone || member?.phoneNumber || ''),
  email: member?.email || '',
  address: member?.address || member?.streetAddress || member?.fullAddress || '',
  avatar: member?.avatar || member?.avatarUrl || '',
  patientCode: member?.patientCode || buildFallbackPatientCode({ ...member, entityId: member?.id }),
})

const resolveClinicForDoctor = (doctor, clinics) => {
  if (!doctor || clinics.length === 0) return null

  const doctorLocation = normalizeText([doctor.workplace, doctor.hospital, doctor.clinicName].join(' '))
  return (
    clinics.find((clinic) => doctorLocation.includes(normalizeText(clinic?.name))) ||
    clinics.find((clinic) => normalizeText(clinic?.name).includes(doctorLocation)) ||
    clinics[0]
  )
}

const resolveServiceForClinic = (clinicId, services, doctor) => {
  const availableServices = services.filter((service) => String(service?.clinicId) === String(clinicId))
  if (availableServices.length === 0) return null

  const specialization = normalizeText(doctor?.specialization)
  return (
    availableServices.find((service) =>
      normalizeText(`${service?.name || ''} ${service?.category || ''}`).includes(specialization),
    ) || availableServices[0]
  )
}

const resolveRoomForClinic = (clinicId, rooms) =>
  rooms.find((room) => String(room?.clinicId) === String(clinicId)) || null

const buildPeriodLabel = (time) => {
  const hour = Number(String(time || '').slice(0, 2))
  if (!Number.isFinite(hour)) return ''
  if (hour < 12) return 'Buổi sáng'
  if (hour < 17) return 'Buổi chiều'
  return 'Buổi tối'
}

const buildDoctorIntroduction = (doctor) => {
  if (doctor?.introduction?.trim()) return doctor.introduction.trim()

  const parts = [
    doctor?.title ? `${doctor.title} chuyên lĩnh vực ${doctor.specialization || 'đa khoa'}` : '',
    doctor?.yearsOfExperience ? `với ${doctor.yearsOfExperience} năm kinh nghiệm lâm sàng.` : '',
    doctor?.workplace ? `Hiện bác sĩ đang công tác tại ${doctor.workplace}.` : '',
  ].filter(Boolean)

  return parts.join(' ') || 'Thông tin giới thiệu bác sĩ đang được cập nhật.'
}

const resolveWorkplaceAddress = (clinic, doctor) => {
  const candidates = [
    clinic?.address,
    doctor?.address,
    doctor?.workAddress,
    doctor?.clinicAddress,
  ]

  const resolved = candidates.find((value) => String(value || '').trim().length >= 12)
  if (resolved) return String(resolved).trim()

  return '789 Nguyen Dinh Chieu, Phuong Xuan Hoa, Quan 3, TP. Ho Chi Minh'
}

export function BookAppointment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()

  const [initialLoading, setInitialLoading] = useState(true)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [doctors, setDoctors] = useState([])
  const [clinics, setClinics] = useState([])
  const [services, setServices] = useState([])
  const [rooms, setRooms] = useState([])
  const [profiles, setProfiles] = useState([])
  const [scheduleEntries, setScheduleEntries] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedSlotLabel, setSelectedSlotLabel] = useState('')
  const [selectedProfileId, setSelectedProfileId] = useState('self')
  const [expandedProfileId, setExpandedProfileId] = useState('self')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [bookingData, setBookingData] = useState({
    doctorId: null,
    doctor: null,
    clinicId: '',
    serviceId: '',
    roomId: '',
    type: 'IN_PERSON',
  })

  const specializations = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))],
    [doctors],
  )

  const selectedClinic = useMemo(
    () => clinics.find((clinic) => String(clinic?.id) === String(bookingData.clinicId)) || null,
    [bookingData.clinicId, clinics],
  )

  const selectedService = useMemo(
    () => services.find((service) => String(service?.id) === String(bookingData.serviceId)) || null,
    [bookingData.serviceId, services],
  )

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room?.id) === String(bookingData.roomId)) || null,
    [bookingData.roomId, rooms],
  )

  const selectedProfile = useMemo(
    () => profiles.find((profile) => String(profile.id) === String(selectedProfileId)) || profiles[0] || null,
    [profiles, selectedProfileId],
  )

  const selectedDateEntry = useMemo(
    () => scheduleEntries.find((entry) => entry.value === selectedDate) || null,
    [scheduleEntries, selectedDate],
  )

  const slotGroups = useMemo(
    () => groupSlotsByPeriod(selectedDateEntry?.slots || []),
    [selectedDateEntry],
  )

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm)

    return doctors.filter((doctor) => {
      const matchesSearch =
        !normalizedSearch ||
        normalizeText(`${doctor.name} ${doctor.specialization} ${doctor.workplace}`).includes(normalizedSearch)

      const matchesSpecialization =
        !selectedSpecialization || String(doctor.specialization) === String(selectedSpecialization)

      return matchesSearch && matchesSpecialization
    })
  }, [doctors, searchTerm, selectedSpecialization])

  const bookingFee = useMemo(
    () => Number(selectedService?.basePrice ?? selectedService?.price ?? bookingData?.doctor?.consultationFee ?? 0),
    [bookingData?.doctor?.consultationFee, selectedService],
  )

  const bookingSummaryItems = useMemo(
    () => [
      { label: 'Ngày khám', value: selectedDate ? formatShortDate(selectedDate) : '--' },
      { label: 'Khung giờ', value: selectedSlotLabel || selectedTime || '--' },
      { label: 'Bệnh nhân', value: selectedProfile?.fullName || '--' },
      { label: 'Phí khám', value: APPOINTMENT_FEE_DISPLAY },
    ],
    [selectedDate, selectedProfile?.fullName, selectedSlotLabel, selectedTime],
  )

  const loadDoctorSchedule = async (doctor) => {
    if (!doctor?.id) return

    setScheduleLoading(true)
    setSubmitError('')

    try {
      const dateChoices = buildDateChoices(7)
      const results = await Promise.all(
        dateChoices.map(async (choice) => {
          try {
            const slots = await scheduleApi.getAvailableSlots(doctor.id, choice.value)
            const normalizedSlots = (Array.isArray(slots) ? slots : [])
              .filter((slot) => slot?.available)
              .map((slot) => ({
                ...slot,
                time: String(slot?.time || '').slice(0, 5),
                label: slot?.label || buildSlotLabel(slot?.time, slot?.durationMinutes || slot?.duration || slotDurationMinutes),
              }))

            return {
              ...choice,
              slots: normalizedSlots,
              slotCount: normalizedSlots.length,
            }
          } catch (error) {
            return { ...choice, slots: [], slotCount: 0 }
          }
        }),
      )

      setScheduleEntries(results)
      const defaultDate = results.find((entry) => entry.slotCount > 0)?.value || results[0]?.value || ''
      setSelectedDate(defaultDate)
      setSelectedTime('')
      setSelectedSlotLabel('')
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải lịch khám của bác sĩ.' })
    } finally {
      setScheduleLoading(false)
    }
  }

  const applyDoctorSelection = async (doctor, sourceClinics = clinics, sourceServices = services, sourceRooms = rooms) => {
    const normalizedDoctor = normalizeDoctor(doctor)
    const clinic = resolveClinicForDoctor(normalizedDoctor, sourceClinics)
    const service = clinic ? resolveServiceForClinic(clinic.id, sourceServices, normalizedDoctor) : null
    const room = clinic ? resolveRoomForClinic(clinic.id, sourceRooms) : null

    setBookingData((prev) => ({
      ...prev,
      doctorId: normalizedDoctor.id,
      doctor: normalizedDoctor,
      clinicId: clinic ? String(clinic.id) : '',
      serviceId: service ? String(service.id) : '',
      roomId: room ? String(room.id) : '',
    }))
    setCurrentStep(2)

    await loadDoctorSchedule(normalizedDoctor)
  }

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      setInitialLoading(true)

      try {
        const [doctorResult, clinicResult, serviceResult, roomResult, profileResult, familyResult] =
          await Promise.allSettled([
            userApi.getDoctors(),
            adminApi.getClinics(),
            adminApi.getServices(),
            adminApi.getAllRooms(),
            profileApi.getProfile(),
            familyMemberApi.getMembers(user?.id),
          ])

        if (!mounted) return

        const loadedDoctors = (Array.isArray(doctorResult.value) ? doctorResult.value : [])
          .map(normalizeDoctor)
          .filter((doctor) => doctor?.id)
        const loadedClinics = (Array.isArray(clinicResult.value) ? clinicResult.value : []).filter(
          (clinic) => clinic?.active !== false,
        )
        const loadedServices = (Array.isArray(serviceResult.value) ? serviceResult.value : []).filter(
          (service) => service?.active !== false,
        )
        const loadedRooms = (Array.isArray(roomResult.value) ? roomResult.value : []).filter(
          (room) => room?.active !== false,
        )

        const selfProfile =
          profileResult.status === 'fulfilled' && profileResult.value
            ? buildSelfProfile(profileResult.value, user)
            : buildSelfProfile(null, user)
        const familyProfiles =
          familyResult.status === 'fulfilled' && Array.isArray(familyResult.value)
            ? familyResult.value.map(buildFamilyProfile)
            : []

        setDoctors(loadedDoctors)
        setClinics(loadedClinics)
        setServices(loadedServices)
        setRooms(loadedRooms)
        setProfiles([selfProfile, ...familyProfiles])
        setSelectedProfileId('self')
        setExpandedProfileId('self')

        const preselectedDoctorId = searchParams.get('doctorId')
        if (preselectedDoctorId) {
          let preselectedDoctor =
            loadedDoctors.find((doctor) => String(doctor.id) === String(preselectedDoctorId)) || null

          if (!preselectedDoctor) {
            try {
              preselectedDoctor = normalizeDoctor(await userApi.getUser(preselectedDoctorId))
            } catch (error) {
              preselectedDoctor = null
            }
          }

          if (preselectedDoctor?.id) {
            await applyDoctorSelection(preselectedDoctor, loadedClinics, loadedServices, loadedRooms)
          }
        }
      } catch (error) {
        if (!mounted) return
        showToast({ type: 'error', message: 'Không thể tải dữ liệu đặt khám.' })
      } finally {
        if (mounted) setInitialLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [searchParams, showToast, user])

  const handleSubmit = async () => {
    const selectedDoctor = bookingData.doctor

    if (!selectedDoctor || !selectedDate || !selectedTime || !selectedProfile) {
      showToast({ type: 'error', message: 'Vui lòng chọn đủ bác sĩ, ngày khám, giờ khám và hồ sơ bệnh nhân.' })
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const latestSlots = await scheduleApi.getAvailableSlots(selectedDoctor.id, selectedDate)
      const confirmedSlot = (latestSlots || []).find(
        (slot) => slot?.available && String(slot?.time || '').slice(0, 5) === String(selectedTime).slice(0, 5),
      )

      if (!confirmedSlot) {
        const message = 'Khung giờ này vừa hết chỗ. Vui lòng chọn khung giờ khác.'
        setSubmitError(message)
        showToast({ type: 'error', message })
        setCurrentStep(2)
        await loadDoctorSchedule(selectedDoctor)
        return
      }

      const appointment = await appointmentApi.createAppointment({
        patientId: user.id,
        familyMemberId: selectedProfile.type === 'FAMILY' ? selectedProfile.entityId : null,
        doctorId: selectedDoctor.id,
        clinicId: bookingData.clinicId ? Number(bookingData.clinicId) : null,
        serviceId: bookingData.serviceId ? Number(bookingData.serviceId) : null,
        roomId: bookingData.roomId ? Number(bookingData.roomId) : null,
        serviceFee: Number.isFinite(bookingFee) ? bookingFee : null,
        date: selectedDate,
        time: String(confirmedSlot.time || '').slice(0, 5),
        type: 'IN_PERSON',
        priority: 'NORMAL',
        reason: reason.trim() || `Đặt khám ${selectedDoctor.specialization}`,
        notes: notes.trim(),
      })

      saveAppointmentBookingSummary(appointment.id, {
        appointmentId: appointment.id,
        appointmentCode: appointment.appointmentCode || '',
        queueNumber: appointment.queueNumber || '--',
        doctorName: selectedDoctor.name,
        doctorAvatar: selectedDoctor.avatar,
        doctorSpecialization: selectedDoctor.specialization,
        doctorAddress:
          selectedRoom?.roomNumber ||
          selectedRoom?.name ||
          selectedClinic?.address ||
          selectedClinic?.name ||
          selectedDoctor.workplace,
        clinicName: selectedClinic?.name || selectedDoctor.workplace,
        date: selectedDate,
        time: String(confirmedSlot.time || '').slice(0, 5),
        slotLabel:
          selectedSlotLabel ||
          buildSlotLabel(
            confirmedSlot.time,
            confirmedSlot?.durationMinutes || confirmedSlot?.duration || slotDurationMinutes,
          ),
        periodLabel: buildPeriodLabel(confirmedSlot.time),
        patientName: selectedProfile.fullName,
        patientDateOfBirth: selectedProfile.dateOfBirth,
        patientGender: selectedProfile.gender,
        patientPhone: selectedProfile.phone || '',
        patientAddress: selectedProfile.address || '',
        patientCode: selectedProfile.patientCode || buildFallbackPatientCode(selectedProfile),
      })

      showToast({ type: 'success', message: 'Đặt lịch khám thành công.' })
      navigate(`/appointments/success?appointmentId=${appointment.id}`)
    } catch (error) {
      const errorMessage = extractApiErrorMessage(error, 'Không thể hoàn tất đặt lịch khám.')
      setSubmitError(errorMessage)
      showToast({ type: 'error', message: errorMessage })
    } finally {
      setSubmitting(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loading text="Đang tải dữ liệu đặt khám..." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#6d8074]">
        <Link to="/dashboard" className="transition hover:text-[#143c26]">
          Trang chủ
        </Link>
        <ChevronRight className="h-4 w-4 text-[#9aa9a0]" />
        <span className="font-semibold text-[#143c26]">Đặt lịch khám</span>
      </div>

      <section className="rounded-[16px] border border-[#d7e2da] bg-white px-5 py-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:px-8">
        <div className="grid gap-6 md:grid-cols-4">
          {STEPS.map((step, index) => {
            const isDone = currentStep > step.id
            const isActive = currentStep === step.id
            const isEnabled = currentStep >= step.id

            return (
              <div key={step.id} className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center">
                {index < STEPS.length - 1 && (
                  <div
                    className={`absolute left-[42px] top-5 hidden h-[2px] w-[calc(100%-10px)] md:block ${
                      currentStep > step.id ? 'bg-[#0f4f2a]' : 'bg-[#e6ece8]'
                    }`}
                  />
                )}

                <div
                  className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] border text-lg font-bold ${
                    isEnabled
                      ? 'border-[#0f4f2a] bg-[#0f4f2a] text-white'
                      : 'border-[#edf1ee] bg-[#f7f9f7] text-[#8aa092]'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-6 w-6" /> : step.id}
                </div>

                <div className="min-w-0">
                  <div className={`text-lg font-semibold ${isActive ? 'text-[#143c26]' : 'text-[#3d5446]'}`}>
                    {step.name}
                  </div>
                  <div className="mt-1 text-sm leading-5 text-[#6d8074]">{step.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.section
            key="step-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="rounded-[16px] border border-[#d7e2da] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6d8074]">Chọn bác sĩ</div>
            <h2 className="mt-2 text-3xl font-bold text-[#143c26]">Chọn bác sĩ phù hợp</h2>
            <p className="mt-2 text-sm leading-6 text-[#587062]">
              Tìm bác sĩ theo tên hoặc chuyên khoa, sau đó tiếp tục chọn ngày và khung giờ khám.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm theo tên bác sĩ hoặc chuyên khoa"
                leftIcon={<Search className="h-5 w-5" />}
              />
              <Select
                value={selectedSpecialization}
                onChange={(event) => setSelectedSpecialization(event.target.value)}
                options={[
                  { value: '', label: 'Tất cả chuyên khoa' },
                  ...specializations.map((specialization) => ({
                    value: specialization,
                    label: specialization,
                  })),
                ]}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {filteredDoctors.map((doctor) => (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() => applyDoctorSelection(doctor)}
                  className="rounded-[14px] border border-[#d7e2da] bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[#0f4f2a] hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex items-start gap-4">
                    <Avatar src={doctor.avatar} name={doctor.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-semibold text-[#143c26]">{doctor.name}</div>
                      <div className="mt-1 text-sm font-medium text-[#0f4f2a]">{doctor.specialization}</div>
                      <div className="mt-3 text-sm leading-6 text-[#5f7363]">{doctor.workplace}</div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-[#143c26]">{APPOINTMENT_FEE_DISPLAY}</div>
                        <Button className={progressButtonClass}>Chọn bác sĩ</Button>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {currentStep === 2 && (
          <motion.section
            key="step-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
          >
            {bookingData.doctor && (
              <section className="rounded-[16px] border border-[#d7e2da] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
                <div className="grid gap-6 lg:grid-cols-[176px_minmax(0,1fr)]">
                  <div className="flex justify-center lg:justify-start">
                    <Avatar src={bookingData.doctor.avatar} name={bookingData.doctor.name} size="3xl" shape="square" />
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px]">
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6d8074]">
                        Thông tin bác sĩ
                      </div>
                      <div className="mt-3 text-[34px] font-bold leading-tight text-[#143c26]">
                        {bookingData.doctor.name}
                      </div>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div>
                          <div className="text-sm font-semibold text-[#476252]">Kinh nghiệm</div>
                          <div className="mt-2 flex items-baseline gap-2 text-[#143c26]">
                            <span className="text-[26px] font-bold">{bookingData.doctor.yearsOfExperience || '--'}</span>
                            <span className="whitespace-nowrap text-sm font-medium text-[#5f7363]">năm kinh nghiệm</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#476252]">Chức vụ</div>
                          <div className="mt-2 text-base font-semibold text-[#143c26]">
                            {bookingData.doctor.title}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="flex items-start gap-3">
                          <Stethoscope className="mt-1 h-5 w-5 text-[#0f4f2a]" />
                          <div>
                            <div className="text-sm font-semibold text-[#476252]">Chuyên khoa</div>
                            <div className="mt-1 text-base font-semibold text-[#143c26]">
                              {bookingData.doctor.specialization}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-1 h-5 w-5 text-[#0f4f2a]" />
                          <div>
                            <div className="text-sm font-semibold text-[#476252]">Nơi công tác</div>
                            <div className="mt-1 text-base font-semibold text-[#143c26]">
                              {selectedClinic?.name || bookingData.doctor.workplace}
                            </div>
                            <div className="mt-2 text-sm leading-6 text-[#5f7363]">
                              {resolveWorkplaceAddress(selectedClinic, bookingData.doctor)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden">
                      <div className="flex items-start gap-3">
                        <Stethoscope className="mt-1 h-5 w-5 text-[#0f4f2a]" />
                        <div>
                          <div className="text-sm font-semibold text-[#476252]">Chuyên khoa</div>
                          <div className="mt-1 text-base font-semibold text-[#143c26]">
                            {bookingData.doctor.specialization}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-1 h-5 w-5 text-[#0f4f2a]" />
                        <div>
                          <div className="text-sm font-semibold text-[#476252]">Nơi công tác</div>
                          <div className="mt-1 text-base font-semibold text-[#143c26]">
                            {selectedClinic?.name || bookingData.doctor.workplace}
                          </div>
                          <div className="mt-2 text-sm leading-6 text-[#5f7363]">
                            {resolveWorkplaceAddress(selectedClinic, bookingData.doctor)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-[#476252]">Phí khám</div>
                      <div className="mt-3 text-[32px] font-bold text-[#0f4f2a]">{APPOINTMENT_FEE_DISPLAY}</div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-[16px] border border-[#d7e2da] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
              <h2 className="mt-2 text-[30px] font-bold text-[#143c26]">Chọn ngày và khung giờ khám</h2>

              {submitError && (
                <div className="mt-5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div className="mt-6 overflow-x-auto pb-3">
                <div className="flex min-w-max gap-4">
                  {scheduleEntries.map((entry) => {
                    const isActive = entry.value === selectedDate
                    return (
                      <button
                        key={entry.value}
                        type="button"
                        onClick={() => {
                          setSelectedDate(entry.value)
                          setSelectedTime('')
                          setSelectedSlotLabel('')
                        }}
                        className={`w-[164px] shrink-0 rounded-[12px] border px-5 py-4 text-left transition-all ${
                          isActive
                            ? 'border-[#0f4f2a] bg-[#0f4f2a] text-white'
                            : 'border-[#d7e2da] bg-white text-[#143c26] hover:border-[#0f4f2a]'
                        }`}
                      >
                        <div className={`text-[15px] font-semibold ${isActive ? 'text-white/90' : 'text-[#476252]'}`}>
                          {entry.weekdayLabel}
                        </div>
                        <div className="mt-2 text-[22px] font-bold">{entry.dayMonthLabel}</div>
                        <div className={`mt-3 text-[12px] ${isActive ? 'text-white/85' : 'text-[#6d8074]'}`}>
                          {entry.slotCount} khung giờ
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-6 rounded-[16px] border border-[#d7e2da] bg-white p-5">
                {scheduleLoading ? (
                  <div className="py-8">
                    <Loading text="Đang tải khung giờ khám..." />
                  </div>
                ) : slotGroups.length > 0 ? (
                  <div className="space-y-6">
                    {slotGroups.map((group) => (
                      <div key={group.key}>
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#476252]">
                          <Clock3 className="h-4 w-4 text-[#0f4f2a]" />
                          {group.label}
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
                          {group.slots.map((slot) => {
                            const isActive = slot.time === selectedTime
                            return (
                              <button
                                key={`${selectedDate}-${slot.time}`}
                                type="button"
                                onClick={() => {
                                  setSelectedTime(slot.time)
                                  setSelectedSlotLabel(slot.label)
                                  setCurrentStep(3)
                                }}
                                className={`rounded-[10px] border px-3 py-2.5 text-center text-[13px] font-semibold transition-all ${
                                  isActive
                                    ? 'border-[#0f4f2a] bg-[#0f4f2a] text-white'
                                    : 'border-[#0f4f2a] bg-white text-[#143c26] hover:bg-[#eff5f1]'
                                }`}
                              >
                                {slot.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-sm text-[#6d8074]">
                    Bác sĩ chưa mở lịch trống cho ngày này. Vui lòng chọn ngày khác.
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-[16px] border border-[#d7e2da] bg-[#f8fbf9] p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6d8074]">Giới thiệu bác sĩ</div>
                <div className="mt-3 text-[15px] leading-7 text-[#35513f]">
                  {buildDoctorIntroduction(bookingData.doctor)}
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" className={outlineButtonClass} onClick={() => setCurrentStep(1)}>
                  <ChevronLeft className="h-4 w-4" />
                  Quay lại
                </Button>
              </div>
            </section>
          </motion.section>
        )}

        {currentStep === 3 && (
          <motion.section
            key="step-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
          >
            <div className="space-y-6">
              <section className="rounded-[16px] border border-[#d7e2da] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6d8074]">Bệnh nhân</div>
                <h2 className="mt-2 text-3xl font-bold text-[#143c26]">Hồ sơ bệnh nhân</h2>

                <div className="mt-6 space-y-4">
                  {profiles.map((profile) => {
                    const isSelected = String(profile.id) === String(selectedProfileId)
                    const isExpanded = String(profile.id) === String(expandedProfileId)

                    return (
                      <div
                        key={profile.id}
                        className={`overflow-hidden rounded-[16px] border transition-all ${
                          isSelected
                            ? 'border-[#0f4f2a] bg-[#f4f8f5] shadow-[0_4px_12px_rgba(15,79,42,0.08)]'
                            : 'border-[#e4ebe6] bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4 px-4 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedProfileId(profile.id)}
                            className="flex min-w-0 flex-1 items-center gap-4 text-left"
                          >
                            <Avatar src={profile.avatar} name={profile.fullName} size="lg" />

                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a9b90]">
                                {String(profile.relationshipLabel || '').toUpperCase()}
                              </div>
                              <div className="mt-1 text-[18px] font-semibold text-[#143c26]">{profile.fullName}</div>
                              <div className="mt-2 text-sm text-[#6d8074]">{formatBirthDate(profile.dateOfBirth)}</div>
                            </div>
                          </button>

                          <div className="flex items-center gap-3">
                            {isSelected && <div className="text-sm font-semibold text-[#0f4f2a]">Đã chọn</div>}
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedProfileId((current) => (String(current) === String(profile.id) ? '' : profile.id))
                              }
                              className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#e4ebe6] bg-white text-[#5d7264] transition-colors hover:border-[#0f4f2a] hover:text-[#0f4f2a]"
                            >
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="grid gap-4 border-t border-[#e4ebe6] bg-white px-4 py-4 sm:grid-cols-2">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a9b90]">Ngày sinh</div>
                              <div className="mt-1 text-sm font-medium text-[#143c26]">{formatBirthDate(profile.dateOfBirth)}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a9b90]">Giới tính</div>
                              <div className="mt-1 text-sm font-medium text-[#143c26]">{profile.gender || 'Đang cập nhật'}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a9b90]">Số điện thoại</div>
                              <div className="mt-1 text-sm font-medium text-[#143c26]">{profile.phone || 'Đang cập nhật'}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a9b90]">Mã bệnh nhân</div>
                              <div className="mt-1 text-sm font-medium text-[#143c26]">{profile.patientCode || '--'}</div>
                            </div>
                            <div className="sm:col-span-2">
                              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a9b90]">Địa chỉ</div>
                              <div className="mt-1 text-sm font-medium text-[#143c26]">{profile.address || 'Đang cập nhật'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-[16px] border border-[#d7e2da] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6d8074]">Thông tin</div>
                <h3 className="mt-2 text-2xl font-bold text-[#143c26]">Ghi chú cho bác sĩ</h3>

                <div className="mt-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#476252]">Ghi chú thêm</label>
                    <textarea
                      rows={5}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Mô tả triệu chứng, thời gian xuất hiện hoặc điều cần bác sĩ lưu ý..."
                      className="w-full rounded-[12px] border border-[#d7e2da] px-4 py-3 text-sm text-[#143c26] outline-none transition-all focus:border-[#0f4f2a] focus:ring-2 focus:ring-[#d8e7dc]"
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-between">
                <Button variant="outline" className={outlineButtonClass} onClick={() => setCurrentStep(2)}>
                  <ChevronLeft className="h-4 w-4" />
                  Quay lại
                </Button>

                <Button className={progressButtonClass} onClick={() => setCurrentStep(4)}>
                  Tiếp tục
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <aside className="rounded-[16px] border border-[#d7e2da] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6 lg:sticky lg:top-24 lg:self-start">
              <div className="text-xl font-semibold text-[#143c26]">Thông tin đặt lịch khám</div>

              <div className="mt-5 flex items-start gap-4">
                <Avatar src={bookingData.doctor?.avatar} name={bookingData.doctor?.name} size="lg" shape="square" />
                <div className="min-w-0">
                  <div className="text-[22px] font-semibold text-[#143c26]">{bookingData.doctor?.name}</div>
                  <div className="mt-1 text-base text-[#5f7363]">{selectedClinic?.name || bookingData.doctor?.workplace}</div>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {bookingSummaryItems.map((item) => (
                  <div key={item.label}>
                    <div className="text-sm text-[#6d8074]">{item.label}</div>
                    <div className="mt-1 text-[20px] font-semibold text-[#143c26]">{item.value}</div>
                  </div>
                ))}
              </div>

            </aside>
          </motion.section>
        )}

        {currentStep === 4 && (
          <motion.section
            key="step-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
          >
            <div className="space-y-6">
              {submitError && (
                <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <section className="rounded-[16px] border border-[#d7e2da] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6d8074]">Xác nhận</div>
                <h2 className="mt-2 text-3xl font-bold text-[#143c26]">Kiểm tra thông tin trước khi xác nhận</h2>

                <div className="mt-6 rounded-[18px] border border-[#d7e2da] bg-[#fcfdfc] p-5">
                  <div className="border-b border-dashed border-[#d7e2da] pb-5">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a9b90]">Phiếu khám</div>
                      <div className="mt-2 text-[28px] font-bold text-[#143c26]">Xác nhận lịch khám</div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-x-6 gap-y-4 md:grid-cols-2">
                    <div className="border-b border-[#edf2ee] pb-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a9b90]">Bác sĩ</div>
                      <div className="mt-1 text-base font-semibold text-[#143c26]">{bookingData.doctor?.name}</div>
                      <div className="mt-1 text-sm text-[#5f7363]">{bookingData.doctor?.specialization}</div>
                    </div>
                    <div className="border-b border-[#edf2ee] pb-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a9b90]">Nơi khám</div>
                      <div className="mt-1 text-base font-semibold text-[#143c26]">
                        {selectedClinic?.name || bookingData.doctor?.workplace}
                      </div>
                      <div className="mt-1 text-sm text-[#5f7363]">
                        {selectedRoom?.name || selectedRoom?.roomNumber || 'Phòng khám sẽ sắp xếp'}
                      </div>
                    </div>
                    <div className="border-b border-[#edf2ee] pb-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a9b90]">Ngày khám</div>
                      <div className="mt-1 text-base font-semibold text-[#143c26]">{formatLongDate(selectedDate)}</div>
                    </div>
                    <div className="border-b border-[#edf2ee] pb-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a9b90]">Khung giờ</div>
                      <div className="mt-1 text-sm font-semibold text-[#143c26]">{selectedSlotLabel || selectedTime || '--'}</div>
                    </div>
                    <div className="border-b border-[#edf2ee] pb-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a9b90]">Hồ sơ bệnh nhân</div>
                      <div className="mt-1 text-base font-semibold uppercase text-[#143c26]">
                        {selectedProfile?.fullName || '--'}
                      </div>
                      <div className="mt-1 text-sm text-[#5f7363]">
                        {selectedProfile?.phone || formatBirthDate(selectedProfile?.dateOfBirth)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[14px] border border-[#d7e2da] bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#6d8074]">
                      <FileText className="h-4 w-4 text-[#0f4f2a]" />
                      Ghi chú
                    </div>
                    <div className="mt-3 text-sm leading-7 text-[#143c26]">{notes || 'Không có ghi chú thêm.'}</div>
                  </div>

                  <div className="mt-5 border-t border-dashed border-[#d7e2da] pt-5">
                    <div className="text-sm leading-7 text-[#667b6d]">
                      Bằng cách nhấn nút xác nhận, bạn đã đồng ý với các điều khoản và điều kiện đặt khám.
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" className={outlineButtonClass} onClick={() => setCurrentStep(3)}>
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại
                  </Button>

                  <Button className={progressButtonClass} onClick={handleSubmit} isLoading={submitting}>
                    Đặt lịch khám
                    {!submitting && <Check className="h-4 w-4" />}
                  </Button>
                </div>
              </section>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BookAppointment
