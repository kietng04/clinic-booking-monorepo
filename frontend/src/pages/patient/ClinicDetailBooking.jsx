import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Heart,
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { clinicApi } from '@/api/clinicApiWrapper'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'
import { familyMemberApi } from '@/api/familyMemberApiWrapper'
import { profileApi } from '@/api/profileApiWrapper'
import { scheduleApi } from '@/api/scheduleApiWrapper'
import { userApi } from '@/api/userApiWrapper'
import { formatPhone, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { saveAppointmentBookingSummary } from '@/utils/appointmentBookingSummary'

const bannerImages = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1600&q=80',
]

const hospitalImages = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80',
]

const clinicImages = [
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
]

const fallbackServiceNames = [
  'Nội tổng quát',
  'Hô hấp',
  'Giấc ngủ',
  'Dinh dưỡng',
  'Dị ứng - Miễn dịch',
]

const primaryButtonClass =
  '!rounded-[6px] border-[#0f4f2a] bg-[#0f4f2a] text-white shadow-none hover:bg-[#0b3f21]'
const secondaryButtonClass =
  '!rounded-[6px] border-[#0f4f2a] text-[#0f4f2a] shadow-none hover:bg-[#edf4ef] hover:text-[#0f4f2a]'

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const hashString = (value) =>
  String(value || '').split('').reduce((total, char) => total + char.charCodeAt(0), 0)

const formatCurrency = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const formatDateDisplay = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN')
}

const formatScheduleDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const buildPeriodLabel = (time) => {
  const hour = Number(String(time || '').slice(0, 2))
  if (!Number.isFinite(hour)) return '--'
  if (hour < 12) return 'Buổi sáng'
  if (hour < 17) return 'Buổi chiều'
  return 'Buổi tối'
}

const toIsoDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (date, days) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const buildFallbackPatientCode = (profile) => {
  const dateDigits = String(profile?.dateOfBirth || '').replace(/\D/g, '')
  const idDigits = String(profile?.entityId || profile?.id || '')
    .replace(/\D/g, '')
    .slice(-4)
    .padStart(4, '0')

  if (dateDigits) {
    return `YMP${dateDigits.slice(-6)}${idDigits}`
  }

  return `YMP000000${idDigits}`
}

const buildProfileAddress = (profile) =>
  profile?.address ||
  profile?.streetAddress ||
  profile?.fullAddress ||
  profile?.district ||
  profile?.city ||
  profile?.province ||
  ''

const buildSelfProfile = (profile, user) => ({
  id: 'self',
  entityId: user?.id || profile?.id || 'self',
  type: 'SELF',
  badge: 'Tôi',
  relationshipLabel: 'Tôi',
  fullName: profile?.fullName || user?.name || 'Hồ sơ của tôi',
  dateOfBirth: profile?.dateOfBirth || user?.dateOfBirth || '',
  gender: profile?.gender || user?.gender || '',
  phone: formatPhone(profile?.phone || user?.phone || user?.phoneNumber || ''),
  email: profile?.email || user?.email || '',
  address: buildProfileAddress(profile) || buildProfileAddress(user),
  avatar: profile?.avatar || profile?.avatarUrl || user?.avatar || user?.avatarUrl || '',
  patientCode: profile?.patientCode || buildFallbackPatientCode({ ...profile, entityId: user?.id }),
})

const buildFamilyProfile = (member) => ({
  id: `family-${member.id}`,
  entityId: member.id,
  type: 'FAMILY',
  badge: 'Khác',
  relationshipLabel: member?.relationship || 'Người thân',
  fullName: member?.fullName || member?.name || 'Hồ sơ người thân',
  dateOfBirth: member?.dateOfBirth || '',
  gender: member?.gender || '',
  phone: formatPhone(member?.phone || member?.phoneNumber || ''),
  email: member?.email || '',
  address: buildProfileAddress(member),
  avatar: member?.avatar || member?.avatarUrl || '',
  patientCode: member?.patientCode || buildFallbackPatientCode({ ...member, entityId: member?.id }),
})

const normalizeDoctor = (doctor) => ({
  ...doctor,
  id: doctor?.id,
  name: doctor?.fullName || doctor?.name || 'Bác sĩ',
  avatar: doctor?.avatar || doctor?.avatarUrl || '',
  specialization: doctor?.specialization || 'Chuyên khoa',
  workplace: doctor?.workplace || doctor?.hospital || doctor?.clinicName || '',
  title: doctor?.title || doctor?.position || 'Bác sĩ chuyên khoa',
  consultationFee: doctor?.consultationFee ?? 0,
  yearsOfExperience: doctor?.yearsOfExperience ?? doctor?.experienceYears ?? 0,
  rating: doctor?.rating ?? 0,
})

const buildDoctorPool = (clinic, doctors) => {
  if (!clinic || !Array.isArray(doctors) || doctors.length === 0) return []

  const clinicName = normalizeText(clinic.name)
  const directMatches = doctors.filter((doctor) =>
    normalizeText([doctor.workplace, doctor.hospital, doctor.clinicName].join(' ')).includes(clinicName)
  )

  if (directMatches.length >= 4) {
    return directMatches.map(normalizeDoctor)
  }

  const normalizedDoctors = doctors.map(normalizeDoctor)
  const sortedDoctors = [...normalizedDoctors].sort((left, right) => Number(right.rating || 0) - Number(left.rating || 0))
  const offset = hashString(clinic.id) % Math.max(sortedDoctors.length, 1)
  const distributed = sortedDoctors.filter((_, index) => index % 3 === offset % 3)

  const result = [...directMatches.map(normalizeDoctor), ...distributed]
    .filter((doctor, index, collection) => collection.findIndex((item) => String(item.id) === String(doctor.id)) === index)
    .slice(0, 8)

  return result.length > 0 ? result : sortedDoctors.slice(0, 8)
}

const buildDisplayServices = (services) => {
  if (Array.isArray(services) && services.length > 0) return services

  return fallbackServiceNames.map((name, index) => ({
    id: `fallback-${index + 1}`,
    name,
    description: '',
    category: 'General',
    duration: 30,
    price: null,
    synthetic: true,
  }))
}

const doctorMatchesService = (doctor, service) => {
  if (!service) return true
  if (service.synthetic) return true

  const specialization = normalizeText(doctor?.specialization)
  const serviceText = normalizeText(`${service?.name || ''} ${service?.category || ''}`)
  const tokens = serviceText.split(/\s+/).filter((token) => token.length >= 4)

  if (tokens.some((token) => specialization.includes(token))) return true
  if (normalizeText(service?.category) === 'general') {
    return ['noi', 'tong quat', 'da khoa', 'nhi', 'general'].some((token) => specialization.includes(token))
  }

  return false
}

const buildClinicAbout = (clinic) => {
  const description = clinic?.description?.trim()
  return [
    description || `${clinic?.name || 'Phòng khám'} là cơ sở khám chữa bệnh đa chuyên khoa với quy trình đặt lịch nhanh và rõ ràng.`,
    `${clinic?.name || 'Phòng khám'} tập trung vào trải nghiệm đặt khám theo từng bước: chọn chuyên khoa, chọn bác sĩ, chọn lịch trống và xác nhận hồ sơ bệnh nhân.`,
    'Bạn có thể chọn hồ sơ chính hoặc hồ sơ người thân, thêm ghi chú triệu chứng và hoàn tất thanh toán giống luồng đặt lịch bác sĩ hiện tại.',
  ]
}

const slugify = (value) =>
  normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

const hospitalPresets = {
  [slugify('Bệnh viện Ung Bướu TPHCM')]: {
    tagline: 'Kiểm soát ung thư - Vững tin cuộc sống',
    phone: '1900633465',
    website: 'https://youmed.vn',
    address: '3 Nơ Trang Long, Phường 7, Bình Thạnh, TP.HCM',
    introduction: [
      'Các kênh đặt khám online chính thức của bệnh viện gồm ứng dụng bệnh viện, nền tảng YouMed và website đặt khám trực tuyến.',
      'Luồng đặt khám online được tối ưu để người bệnh chọn chuyên khoa, bác sĩ, giờ khám và hồ sơ ngay trên một hành trình rõ ràng.',
      'Bệnh viện tập trung vào tiếp nhận đúng khung giờ đã đăng ký, giảm thời gian chờ và minh bạch thông tin trước khi đến khám.',
    ],
    hours: [
      { label: 'Thứ 2 đến Thứ 6 (khám giờ hành chính)', value: '7h30 - 16h30' },
      { label: 'Thứ 2 đến Thứ 6 (khám dịch vụ)', value: '5h00 - 19h00' },
      { label: 'Thứ 7 và Chủ nhật', value: '7h30 - 11h30' },
      { label: 'Cấp cứu', value: '24/7' },
    ],
  },
  [slugify('Bệnh viện Bạch Mai')]: {
    tagline: 'Khám chuyên sâu - hỗ trợ điều trị toàn diện',
    phone: '1900888866',
    website: 'https://youmed.vn',
    address: '78 Giải Phóng, Đống Đa, Hà Nội',
  },
  [slugify('Bệnh viện Chợ Rẫy')]: {
    tagline: 'Điều trị chuyên sâu - chăm sóc chuẩn tuyến cuối',
    phone: '19002115',
    website: 'https://youmed.vn',
    address: '201B Nguyễn Chí Thanh, Quận 5, TP.HCM',
  },
  [slugify('Bệnh viện Đại học Y Dược')]: {
    tagline: 'Đa chuyên khoa - bác sĩ giàu kinh nghiệm',
    phone: '19007178',
    website: 'https://youmed.vn',
    address: '215 Hồng Bàng, Quận 5, TP.HCM',
  },
}

const buildHospitalServiceItems = (specializations) => {
  const items = (specializations || []).slice(0, 8)
  if (items.length > 0) {
    return items.map((name, index) => ({
      id: `hospital-service-${index + 1}`,
      name,
      description: '',
      category: 'Hospital',
      duration: 30,
      price: null,
      synthetic: true,
    }))
  }

  return buildDisplayServices([])
}

const buildHospitalAbout = (hospital) => {
  const preset = hospitalPresets[slugify(hospital?.name)]
  if (preset?.introduction?.length) return preset.introduction

  return [
    `${hospital?.name || 'Bệnh viện'} triển khai đặt khám trực tuyến theo luồng nhiều bước để người bệnh dễ chọn đúng chuyên khoa và đúng bác sĩ.`,
    'Thông tin giờ làm việc, tổng đài và chuyên khoa được gom về một màn hình để người bệnh có thể kiểm tra trước khi xác nhận lịch hẹn.',
    'Sau khi chọn giờ khám và hồ sơ bệnh nhân, hệ thống sẽ dùng cùng luồng thanh toán như đặt lịch bác sĩ để hoàn tất lịch hẹn.',
  ]
}

const buildHospitalQuickLinks = (hospital) => [
  { label: 'Fanpage', value: hospital?.name || 'Bệnh viện', href: hospital?.website || 'https://youmed.vn' },
  { label: 'Zalo', value: hospital?.name || 'Bệnh viện', href: hospital?.website || 'https://youmed.vn' },
  { label: 'Tổng đài bệnh viện', value: hospital?.phone || 'Đang cập nhật', href: null },
  { label: 'Bảng giá dịch vụ', value: 'Tra cứu trực tuyến', href: hospital?.website || 'https://youmed.vn' },
  { label: 'Tra cứu hoá đơn', value: 'Hỗ trợ trực tuyến', href: hospital?.website || 'https://youmed.vn' },
]

const buildHospitalHours = (hospital) => {
  const preset = hospitalPresets[slugify(hospital?.name)]
  if (preset?.hours?.length) return preset.hours

  return [
    { label: 'Thứ 2 đến Thứ 6', value: '07:30 - 16:30' },
    { label: 'Khám dịch vụ', value: '08:00 - 19:00' },
    { label: 'Thứ 7', value: '07:30 - 11:30' },
    { label: 'Cấp cứu', value: '24/7' },
  ]
}

const buildHospitalDetails = (hospitalName, doctorGroup) => {
  const preset = hospitalPresets[slugify(hospitalName)] || {}
  const specializations = Array.from(
    new Set((doctorGroup || []).map((doctor) => doctor?.specialization).filter(Boolean))
  )

  return {
    id: slugify(hospitalName),
    name: hospitalName,
    tagline: preset.tagline || 'Đặt khám nhanh - thông tin rõ ràng - hỗ trợ đúng tuyến',
    phone: preset.phone || '19002805',
    website: preset.website || 'https://youmed.vn',
    address:
      preset.address ||
      doctorGroup?.find((doctor) => doctor?.address)?.address ||
      'Đang cập nhật địa chỉ bệnh viện',
    doctorsCount: doctorGroup?.length || 0,
    servicesCount: specializations.length || 0,
    active: true,
  }
}

const attachFacilityMedia = (facility, type) => {
  if (!facility) return facility

  const imagePool = type === 'hospital' ? hospitalImages : clinicImages
  const fallbackImage = imagePool[hashString(facility?.id || facility?.name || type) % imagePool.length]

  return {
    ...facility,
    image: facility?.image || facility?.imageUrl || facility?.logo || facility?.logoUrl || fallbackImage,
    logo:
      facility?.logo ||
      facility?.logoUrl ||
      facility?.avatar ||
      facility?.image ||
      facility?.imageUrl ||
      fallbackImage,
  }
}

const buildHospitalCandidates = (doctors) => {
  const groups = new Map()

  ;(doctors || []).forEach((doctor) => {
    const name = String(doctor?.hospital || doctor?.workplace || doctor?.clinicName || '').trim()
    if (!name) return

    const key = slugify(name)
    if (!groups.has(key)) {
      groups.set(key, { name, doctors: [] })
    }

    groups.get(key).doctors.push(normalizeDoctor(doctor))
  })

  return Array.from(groups.entries()).map(([key, value]) => ({
    key,
    name: value.name,
    doctors: value.doctors,
    services: Array.from(new Set(value.doctors.map((doctor) => doctor.specialization).filter(Boolean))),
    hospital: buildHospitalDetails(value.name, value.doctors),
  }))
}

const addMinutesLabel = (time, minutes = 5) => {
  const [hourValue, minuteValue] = String(time || '00:00').split(':').map(Number)
  const startMinutes = hourValue * 60 + minuteValue
  const endMinutes = startMinutes + minutes
  const endHour = Math.floor(endMinutes / 60)
  const endMinute = endMinutes % 60

  return `${String(hourValue).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')} - ${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
}

const groupSlotsByPeriod = (slots) => {
  const groups = {
    morning: [],
    afternoon: [],
    evening: [],
  }

  ;(slots || []).forEach((slot) => {
    const hour = Number(String(slot.time || '').slice(0, 2))
    if (!Number.isFinite(hour)) return
    if (hour < 12) {
      groups.morning.push(slot)
      return
    }
    if (hour < 17) {
      groups.afternoon.push(slot)
      return
    }
    groups.evening.push(slot)
  })

  return groups
}

const periodMeta = {
  morning: { label: 'Buổi sáng', range: '07:30 - 11:30' },
  afternoon: { label: 'Buổi chiều', range: '13:30 - 16:30' },
  evening: { label: 'Buổi tối', range: '17:00 - 19:30' },
}

const weekdayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

const startOfDay = (value) => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

const startOfMonth = (value) => {
  const date = new Date(value)
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const endOfMonth = (value) => {
  const date = new Date(value)
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

const addMonths = (value, months) => {
  const date = new Date(value)
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

const parseIsoDate = (value) => {
  if (!value) return null
  const [year, month, day] = String(value).split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const isSameDate = (left, right) =>
  left &&
  right &&
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()

const isSameMonth = (left, right) =>
  left && right && left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth()

const buildCalendarDays = (monthDate) => {
  const firstDay = startOfMonth(monthDate)
  const lastDay = endOfMonth(monthDate)
  const startWeekday = (firstDay.getDay() + 6) % 7
  const endWeekday = (lastDay.getDay() + 6) % 7
  const startDate = addDays(firstDay, -startWeekday)
  const endDate = addDays(lastDay, 6 - endWeekday)
  const days = []

  for (let cursor = new Date(startDate); cursor <= endDate; cursor = addDays(cursor, 1)) {
    days.push(new Date(cursor))
  }

  return days
}

const formatMonthHeading = (value) =>
  new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric',
  }).format(value)

const formatCalendarDayLabel = (value) => {
  const date = new Date(value)
  if (date.getDate() === 1) {
    return `1 tháng ${date.getMonth() + 1}`
  }
  return String(date.getDate())
}

const isBeforeDay = (left, right) => startOfDay(left).getTime() < startOfDay(right).getTime()

const resolveFacilityLogo = (facility) =>
  facility?.logo ||
  facility?.logoUrl ||
  facility?.image ||
  facility?.imageUrl ||
  facility?.thumbnail ||
  facility?.avatar ||
  ''

function FacilityLogo({ facility, label, className = 'h-20 w-20 rounded-[22px]' }) {
  const logoSrc = resolveFacilityLogo(facility)

  if (logoSrc) {
    return (
      <div className={`overflow-hidden border border-[#d7e2da] bg-white shadow-sm ${className}`}>
        <img src={logoSrc} alt={facility?.name || label} className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center border border-[#d7e2da] bg-gradient-to-br from-[#edf6ef] via-white to-[#e2efe5] text-[#0f4f2a] shadow-sm ${className}`}
    >
      <div className="flex flex-col items-center justify-center gap-1">
        <Building2 className="h-7 w-7" />
        <span className="text-xs font-bold uppercase tracking-[0.14em]">{getInitials(facility?.name || label || 'YT')}</span>
      </div>
    </div>
  )
}

function BookingCalendar({
  monthDate,
  minDate,
  maxDate,
  selectedDate,
  onSelectDate,
  onMonthChange,
  getDayState,
}) {
  const days = buildCalendarDays(monthDate)
  const selected = parseIsoDate(selectedDate)
  const min = startOfDay(minDate)
  const max = startOfDay(maxDate)
  const canGoPrev = startOfMonth(monthDate).getTime() > startOfMonth(min).getTime()
  const canGoNext = startOfMonth(monthDate).getTime() < startOfMonth(max).getTime()

  return (
    <div className="rounded-[14px] border border-[#d7e2da] bg-[#fbfdfb] p-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => canGoPrev && onMonthChange(addMonths(monthDate, -1))}
          disabled={!canGoPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e2da] bg-white text-[#173925] transition hover:border-[#94b39f] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-lg font-semibold capitalize text-[#143c26]">{formatMonthHeading(monthDate)}</div>
        <button
          type="button"
          onClick={() => canGoNext && onMonthChange(addMonths(monthDate, 1))}
          disabled={!canGoNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e2da] bg-white text-[#173925] transition hover:border-[#94b39f] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
        {weekdayLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {days.map((date) => {
          const dateKey = toIsoDate(date)
          const inMonth = isSameMonth(date, monthDate)
          const state = getDayState(dateKey, date)
          const isSelected = isSameDate(date, selected)
          const isDisabled = !inMonth || isBeforeDay(date, min) || date.getTime() > max.getTime() || state === 'disabled'

          let className = 'border-[#d7e2da] bg-white text-[#173925] hover:border-[#94b39f]'

          if (!inMonth) {
            className = 'border-transparent bg-transparent text-sage-300'
          } else if (isDisabled) {
            className = 'border-[#eef2ef] bg-[#f5f7f5] text-sage-400'
          } else if (isSelected) {
            className = 'border-[#0f4f2a] bg-[#0f4f2a] text-white'
          } else if (state === 'today') {
            className = 'border-[#0f4f2a] bg-[#edf6ef] text-[#0f4f2a]'
          } else if (state === 'full') {
            className = 'border-[#f0c9c9] bg-[#fff3f3] text-[#b44949]'
          } else if (state === 'available') {
            className = 'border-[#cfe0d2] bg-[#f4faf5] text-[#173925]'
          }

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(dateKey)}
              className={`flex min-h-[64px] items-start justify-start rounded-[12px] border px-3 py-2 text-left text-sm font-medium transition ${className}`}
            >
              {formatCalendarDayLabel(date)}
            </button>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-sage-600">
        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#0f4f2a]" />
          <span>Hôm nay</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#d7eadb]" />
          <span>Có thể chọn</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#f0c9c9]" />
          <span>Đã đầy lịch</span>
        </div>
      </div>
    </div>
  )
}

export default function ClinicDetailBooking() {
  const navigate = useNavigate()
  const { clinicId, hospitalSlug } = useParams()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const isHospitalMode = Boolean(hospitalSlug)
  const facilityLabel = isHospitalMode ? 'Bệnh viện' : 'Phòng khám'
  const serviceLabel = isHospitalMode ? 'Chuyên khám' : 'Dịch vụ'
  const minBookingDate = startOfDay(new Date())
  const maxBookingDate = startOfDay(addDays(new Date(), 60))
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clinic, setClinic] = useState(null)
  const [services, setServices] = useState([])
  const [rooms, setRooms] = useState([])
  const [doctors, setDoctors] = useState([])
  const [profiles, setProfiles] = useState([])
  const [activeSection, setActiveSection] = useState('info')
  const [bookingStarted, setBookingStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedProfileId, setSelectedProfileId] = useState('self')
  const [notes, setNotes] = useState('')
  const [attachments, setAttachments] = useState([])
  const [availabilityCache, setAvailabilityCache] = useState({})
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [scheduleMonth, setScheduleMonth] = useState(() => startOfMonth(new Date()))
  const [doctorFilterOpen, setDoctorFilterOpen] = useState(false)
  const [doctorFilterMonth, setDoctorFilterMonth] = useState(() => startOfMonth(new Date()))
  const [doctorFilterDate, setDoctorFilterDate] = useState(() => toIsoDate(new Date()))
  const [doctorFilterLoading, setDoctorFilterLoading] = useState(false)
  const [doctorFilterResults, setDoctorFilterResults] = useState({})
  const [appliedDoctorFilterDate, setAppliedDoctorFilterDate] = useState('')

  const aboutParagraphs = useMemo(
    () => (isHospitalMode ? buildHospitalAbout(clinic) : buildClinicAbout(clinic)),
    [clinic, isHospitalMode]
  )
  const hospitalQuickLinks = useMemo(() => (isHospitalMode ? buildHospitalQuickLinks(clinic) : []), [clinic, isHospitalMode])
  const hospitalHours = useMemo(() => (isHospitalMode ? buildHospitalHours(clinic) : []), [clinic, isHospitalMode])

  useEffect(() => {
    let mounted = true

    async function loadData() {
      setIsLoading(true)

      try {
        const [doctorResult, profileResult, familyResult] = await Promise.allSettled([
          userApi.searchDoctors({ page: 0, size: 80, sort: 'rating,desc' }),
          profileApi.getProfile(),
          familyMemberApi.getMembers(user?.id),
        ])

        if (!mounted) return

        const doctorList =
          doctorResult.status === 'fulfilled'
            ? doctorResult.value?.content || doctorResult.value || []
            : []

        const selfProfile =
          profileResult.status === 'fulfilled' && profileResult.value
            ? buildSelfProfile(profileResult.value, user)
            : buildSelfProfile(null, user)
        const familyProfiles =
          familyResult.status === 'fulfilled' && Array.isArray(familyResult.value)
            ? familyResult.value.map(buildFamilyProfile)
            : []

        if (isHospitalMode) {
          const normalizedHospitalSlug = slugify(decodeURIComponent(hospitalSlug || ''))
          const hospitalCandidates = buildHospitalCandidates(doctorList)
          const selectedHospitalCandidate =
            hospitalCandidates.find((candidate) => candidate.key === normalizedHospitalSlug) ||
            hospitalCandidates.find((candidate) => slugify(candidate.name).includes(normalizedHospitalSlug)) ||
            {
              key: normalizedHospitalSlug,
              name: decodeURIComponent(hospitalSlug || 'Bệnh viện'),
              doctors: doctorList.map(normalizeDoctor).slice(0, 8),
              services: Array.from(new Set(doctorList.map((doctor) => doctor?.specialization).filter(Boolean))).slice(0, 8),
              hospital: buildHospitalDetails(decodeURIComponent(hospitalSlug || 'Bệnh viện'), doctorList.map(normalizeDoctor).slice(0, 8)),
            }

          setClinic(attachFacilityMedia(selectedHospitalCandidate.hospital, 'hospital'))
          setServices(buildHospitalServiceItems(selectedHospitalCandidate.services))
          setRooms([])
          setDoctors(selectedHospitalCandidate.doctors)
        } else {
          const clinicResult = await clinicApi.getClinicById(String(clinicId))
          const [serviceResult, roomResult] = await Promise.allSettled([
            clinicApi.getClinicServices(String(clinicId), { active: true }),
            clinicApi.getClinicRooms(String(clinicId)),
          ])

          if (!mounted) return

          setClinic(attachFacilityMedia(clinicResult, 'clinic'))
          setServices(buildDisplayServices(serviceResult.status === 'fulfilled' ? serviceResult.value || [] : []))
          setRooms((roomResult.status === 'fulfilled' ? roomResult.value || [] : []).filter((room) => room?.active !== false))
          setDoctors(buildDoctorPool(clinicResult, doctorList))
        }

        setProfiles([selfProfile, ...familyProfiles])
        setSelectedProfileId('self')
      } catch (error) {
        if (!mounted) return
        showToast({ type: 'error', message: `Không thể tải thông tin ${facilityLabel.toLowerCase()}` })
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [clinicId, facilityLabel, hospitalSlug, isHospitalMode, showToast, user])

  const selectedService = useMemo(
    () => services.find((service) => String(service.id) === String(selectedServiceId)) || null,
    [selectedServiceId, services]
  )

  const filteredDoctors = useMemo(() => {
    if (!selectedService) return doctors
    const matches = doctors.filter((doctor) => doctorMatchesService(doctor, selectedService))
    return matches.length > 0 ? matches : doctors
  }, [doctors, selectedService])

  const activeDoctorFilter = appliedDoctorFilterDate ? doctorFilterResults[appliedDoctorFilterDate] || null : null

  const visibleDoctors = useMemo(() => {
    if (!activeDoctorFilter) return filteredDoctors
    const allowedIds = new Set((activeDoctorFilter.doctorIds || []).map((id) => String(id)))
    return filteredDoctors.filter((doctor) => allowedIds.has(String(doctor.id)))
  }, [activeDoctorFilter, filteredDoctors])

  const selectedDoctor = useMemo(
    () => visibleDoctors.find((doctor) => String(doctor.id) === String(selectedDoctorId)) || null,
    [selectedDoctorId, visibleDoctors]
  )

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) || profiles[0] || null,
    [profiles, selectedProfileId]
  )

  const selectedRoom = useMemo(() => rooms[0] || null, [rooms])
  const currentAvailability = selectedDoctor ? availabilityCache[selectedDoctor.id] || [] : []
  const availableDates = useMemo(() => currentAvailability.filter((entry) => entry.slots.length > 0), [currentAvailability])
  const selectedDateEntry = useMemo(
    () => currentAvailability.find((entry) => entry.date === selectedDate) || null,
    [currentAvailability, selectedDate]
  )
  const slotGroups = useMemo(() => groupSlotsByPeriod(selectedDateEntry?.slots || []), [selectedDateEntry])
  const selectedSlot = useMemo(
    () => selectedDateEntry?.slots?.find((slot) => String(slot.time) === String(selectedTime)) || null,
    [selectedDateEntry, selectedTime]
  )

  const doctorFilterSummaryText = useMemo(() => {
    if (!activeDoctorFilter || !appliedDoctorFilterDate) return ''
    return activeDoctorFilter.doctorIds.length > 0
      ? `Đang hiển thị ${activeDoctorFilter.doctorIds.length} bác sĩ rảnh ngày ${formatDateDisplay(appliedDoctorFilterDate)}`
      : `Không có bác sĩ rảnh ngày ${formatDateDisplay(appliedDoctorFilterDate)}`
  }, [activeDoctorFilter, appliedDoctorFilterDate])

  useEffect(() => {
    if (!selectedService && services.length > 0) {
      setSelectedServiceId(String(services[0].id))
    }
  }, [selectedService, services])

  useEffect(() => {
    setSelectedDoctorId('')
    setSelectedDate('')
    setSelectedTime('')
    setDoctorFilterOpen(false)
    setDoctorFilterMonth(startOfMonth(new Date()))
    setDoctorFilterDate(toIsoDate(new Date()))
    setAppliedDoctorFilterDate('')
  }, [selectedServiceId])

  useEffect(() => {
    setSelectedDate('')
    setSelectedTime('')
    setScheduleMonth(startOfMonth(new Date()))
  }, [selectedDoctorId])

  useEffect(() => {
    if (!selectedDoctor || availabilityCache[selectedDoctor.id]) return

    let cancelled = false

    async function loadAvailability() {
      setAvailabilityLoading(true)

      try {
        const today = new Date()
        const collected = []

        for (let batchStart = 0; batchStart < 60; batchStart += 5) {
          const batchDates = Array.from({ length: 5 }, (_, index) => toIsoDate(addDays(today, batchStart + index)))
          const batchResults = await Promise.all(
            batchDates.map(async (date) => {
              try {
                const slots = await scheduleApi.getAvailableSlots(selectedDoctor.id, date)
                return {
                  date,
                  slots: (slots || [])
                    .filter((slot) => slot?.available)
                    .map((slot) => ({
                      ...slot,
                      label: isHospitalMode ? addMinutesLabel(slot.time, 5) : slot.time,
                    })),
                }
              } catch (error) {
                return { date, slots: [] }
              }
            })
          )

          collected.push(...batchResults)
        }

        if (!cancelled) {
          setAvailabilityCache((current) => ({ ...current, [selectedDoctor.id]: collected }))
        }
      } finally {
        if (!cancelled) setAvailabilityLoading(false)
      }
    }

    loadAvailability()

    return () => {
      cancelled = true
    }
  }, [availabilityCache, isHospitalMode, selectedDoctor])

  useEffect(() => {
    if (!selectedDoctor || !availableDates.length || selectedDate) return
    setSelectedDate(availableDates[0].date)
  }, [availableDates, selectedDate, selectedDoctor])

  useEffect(() => {
    if (!selectedDateEntry) return
    if (selectedDateEntry.slots.length === 0) {
      setSelectedTime('')
      return
    }
    if (selectedTime) return
    setSelectedTime(selectedDateEntry.slots[0].time)
  }, [selectedDateEntry, selectedTime])

  useEffect(() => {
    if (!selectedDate) return
    const parsed = parseIsoDate(selectedDate)
    if (parsed) setScheduleMonth(startOfMonth(parsed))
  }, [selectedDate])

  useEffect(() => {
    if (!selectedDoctorId) return
    const stillVisible = visibleDoctors.some((doctor) => String(doctor.id) === String(selectedDoctorId))
    if (!stillVisible) {
      setSelectedDoctorId('')
    }
  }, [selectedDoctorId, visibleDoctors])

  const handleStartBooking = () => {
    setBookingStarted(true)
    setCurrentStep(1)
  }

  const handleBackStep = () => {
    if (currentStep === 1) {
      setBookingStarted(false)
      return
    }
    setCurrentStep((step) => step - 1)
  }

  const handleApplyDoctorFilter = async () => {
    if (!doctorFilterDate) {
      showToast({ type: 'warning', message: 'Vui lòng chọn ngày khám để lọc bác sĩ.' })
      return
    }

    if (doctorFilterResults[doctorFilterDate]) {
      setAppliedDoctorFilterDate(doctorFilterDate)
      setSelectedDate(doctorFilterDate)
      setDoctorFilterOpen(false)
      return
    }

    setDoctorFilterLoading(true)

    try {
      const results = await Promise.all(
        filteredDoctors.map(async (doctor) => {
          try {
            const slots = await scheduleApi.getAvailableSlots(doctor.id, doctorFilterDate)
            const availableSlots = (slots || []).filter((slot) => slot?.available)
            return availableSlots.length > 0 ? String(doctor.id) : null
          } catch (error) {
            return null
          }
        })
      )

      const doctorIds = results.filter(Boolean)
      setDoctorFilterResults((current) => ({ ...current, [doctorFilterDate]: { doctorIds } }))
      setAppliedDoctorFilterDate(doctorFilterDate)
      setSelectedDate(doctorFilterDate)
      setSelectedTime('')
      setDoctorFilterOpen(false)

      if (doctorIds.length === 0) {
        showToast({ type: 'warning', message: `Không có bác sĩ rảnh ngày ${formatDateDisplay(doctorFilterDate)}.` })
      }
    } finally {
      setDoctorFilterLoading(false)
    }
  }

  const clearDoctorFilter = () => {
    setAppliedDoctorFilterDate('')
    setSelectedDoctorId('')
    setSelectedDate('')
    setSelectedTime('')
  }

  const getDoctorFilterDayState = (dateKey, date) => {
    if (isBeforeDay(date, minBookingDate) || date.getTime() > maxBookingDate.getTime()) return 'disabled'
    if (isSameDate(date, minBookingDate)) return 'today'

    const result = doctorFilterResults[dateKey]
    if (result) {
      return result.doctorIds.length > 0 ? 'available' : 'full'
    }

    return 'available'
  }

  const getScheduleDayState = (dateKey, date) => {
    if (isBeforeDay(date, minBookingDate) || date.getTime() > maxBookingDate.getTime()) return 'disabled'
    if (isSameDate(date, minBookingDate)) return 'today'

    const entry = currentAvailability.find((item) => item.date === dateKey)
    if (!entry) return 'full'
    return entry.slots.length > 0 ? 'available' : 'full'
  }

  const handleAttachments = (fileList) => {
    const nextFiles = [...attachments]

    for (const file of Array.from(fileList || [])) {
      if (nextFiles.length >= 5) {
        showToast({ type: 'warning', message: 'Chỉ được chọn tối đa 5 ảnh.' })
        break
      }

      const isValidType = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
      const isValidSize = file.size <= 15 * 1024 * 1024

      if (!isValidType) {
        showToast({ type: 'error', message: `${file.name} không đúng định dạng png, jpg.` })
        continue
      }

      if (!isValidSize) {
        showToast({ type: 'error', message: `${file.name} vượt quá 15MB.` })
        continue
      }

      nextFiles.push(file)
    }

    setAttachments(nextFiles)
  }

  const handleSubmit = async () => {
    if (!selectedService || !selectedDoctor || !selectedDate || !selectedTime || !selectedProfile) {
      showToast({ type: 'error', message: 'Vui lòng chọn đủ chuyên khoa, bác sĩ, giờ khám và hồ sơ.' })
      return
    }

    setIsSubmitting(true)

    try {
      const latestSlots = await scheduleApi.getAvailableSlots(selectedDoctor.id, selectedDate)
      const selectedSlot = (latestSlots || []).find(
        (slot) => slot?.available && String(slot.time).slice(0, 5) === String(selectedTime).slice(0, 5)
      )

      if (!selectedSlot) {
        showToast({ type: 'error', message: 'Khung giờ này vừa hết chỗ. Vui lòng chọn giờ khác.' })
        setCurrentStep(3)
        return
      }

      const appointment = await appointmentApi.createAppointment({
        patientId: user.id,
        familyMemberId: selectedProfile.type === 'FAMILY' ? selectedProfile.entityId : null,
        doctorId: selectedDoctor.id,
        clinicId: Number.isFinite(Number(clinic?.id)) ? Number(clinic.id) : null,
        serviceId: Number.isFinite(Number(selectedService?.id)) ? Number(selectedService.id) : null,
        roomId: Number.isFinite(Number(selectedRoom?.id)) ? Number(selectedRoom.id) : null,
        serviceFee: selectedService?.price ?? selectedService?.basePrice ?? selectedDoctor?.consultationFee ?? null,
        date: selectedDate,
        time: selectedSlot.time,
        type: 'IN_PERSON',
        durationMinutes: Number(selectedService?.duration) || 30,
        reason: notes.trim() || `Đặt khám ${selectedService.name}`,
        notes: notes.trim(),
      })

      const appointmentId = appointment?.id || appointment?.appointmentId || appointment?.bookingId

      if (appointmentId) {
        saveAppointmentBookingSummary(appointmentId, {
          appointmentId,
          appointmentCode: appointment?.appointmentCode || '',
          queueNumber: appointment?.queueNumber || '--',
          doctorName: selectedDoctor.name,
          doctorAvatar: selectedDoctor.avatar,
          doctorSpecialization: selectedService?.name || selectedDoctor.specialization,
          doctorAddress:
            selectedRoom?.roomNumber ||
            selectedRoom?.name ||
            clinic?.address ||
            clinic?.name ||
            selectedDoctor.workplace ||
            '',
          clinicName: clinic?.name || selectedDoctor.workplace || '',
          date: selectedDate,
          time: selectedSlot.time,
          slotLabel: selectedSlot.label || selectedSlot.time,
          periodLabel: buildPeriodLabel(selectedSlot.time),
          patientName: selectedProfile.fullName,
          patientDateOfBirth: selectedProfile.dateOfBirth,
          patientGender: selectedProfile.gender,
          patientPhone: selectedProfile.phone || '',
          patientAddress: selectedProfile.address || '',
          patientCode: selectedProfile.patientCode || buildFallbackPatientCode(selectedProfile),
        })

        showToast({ type: 'success', message: 'Đặt lịch thành công.' })
        navigate(`/appointments/success?appointmentId=${appointmentId}`)
        return
      }

      showToast({ type: 'success', message: 'Đặt lịch thành công.' })
      navigate('/appointments')
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể hoàn tất đặt lịch phòng khám'),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loading text="Đang tải thông tin phòng khám..." />
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="rounded-[10px] border border-[#d7e2da] bg-white p-8 text-center">
        <div className="text-lg font-semibold text-[#143c26]">Không tìm thấy phòng khám</div>
        <Button className={`mt-4 ${primaryButtonClass}`} onClick={() => navigate('/dashboard')}>
          Quay về trang chủ
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-sage-500">
        <Link to="/dashboard" className="hover:text-sage-900">Trang chủ</Link>
        <ChevronRight className="h-4 w-4" />
        <span>{facilityLabel}</span>
      </div>

      {!bookingStarted ? (
        <section className="overflow-hidden rounded-[14px] border border-[#d7e2da] bg-white">
          <div className="grid gap-3 border-b border-[#d7e2da] p-3 lg:grid-cols-[2fr_1fr]">
            <img src={bannerImages[0]} alt={clinic.name} className="h-[340px] w-full rounded-[10px] object-cover" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <img src={bannerImages[1]} alt={clinic.name} className="h-[162px] w-full rounded-[10px] object-cover" />
              <img src={bannerImages[2]} alt={clinic.name} className="h-[162px] w-full rounded-[10px] object-cover" />
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex max-w-3xl items-start gap-4">
                <FacilityLogo facility={clinic} label={facilityLabel} />
                <div>
                  <div className="inline-flex items-center rounded-full bg-[#e8f3eb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0f4f2a]">
                    {clinic.doctorsCount || doctors.length} bác sĩ
                  </div>
                  <h1 className="mt-3 text-3xl font-bold leading-tight text-[#143c26]">{clinic.name}</h1>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-sage-600">
                    <div className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#0f4f2a]" />
                      <span>{clinic.address}</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#0f4f2a]" />
                      <span>{clinic.phone || 'Đang cập nhật'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address || clinic.name)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" className={secondaryButtonClass}>Dẫn đường</Button>
                </a>
                <Button variant="outline" className={secondaryButtonClass} leftIcon={<Heart className="h-4 w-4" />}>
                  Yêu thích
                </Button>
                {isHospitalMode && clinic?.website && (
                  <a href={clinic.website} target="_blank" rel="noreferrer">
                    <Button variant="outline" className={secondaryButtonClass} leftIcon={<ExternalLink className="h-4 w-4" />}>
                      Website
                    </Button>
                  </a>
                )}
                <Button className={primaryButtonClass} onClick={handleStartBooking}>Đặt khám ngay</Button>
              </div>
            </div>

            {isHospitalMode && clinic?.tagline && (
              <div className="mt-4 text-base font-medium text-[#2f5a3d]">{clinic.tagline}</div>
            )}

            <div className="mt-6 flex flex-wrap gap-3 border-y border-[#e3ebe4] py-4 text-sm font-medium text-sage-600">
              <button type="button" onClick={() => setActiveSection('info')} className={activeSection === 'info' ? 'text-[#0f4f2a]' : ''}>
                Thông tin
              </button>
              <button type="button" onClick={() => setActiveSection('services')} className={activeSection === 'services' ? 'text-[#0f4f2a]' : ''}>
                {serviceLabel}
              </button>
              <button type="button" onClick={handleStartBooking} className="text-[#0f4f2a]">
                Đặt khám ngay
              </button>
            </div>

            <div className="mt-6">
              <div className="space-y-6">
                <section>
                  <div className="text-xl font-semibold text-[#143c26]">Giới thiệu</div>
                  <div className="mt-4 space-y-4 text-[15px] leading-7 text-sage-700">
                    {aboutParagraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="text-xl font-semibold text-[#143c26]">{serviceLabel}</div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {services.map((service) => (
                      <div key={service.id} className="rounded-full border border-[#d7e2da] bg-[#f7faf8] px-4 py-2 text-sm font-medium text-[#173925]">
                        {service.name}
                      </div>
                    ))}
                  </div>
                </section>

                {isHospitalMode && (
                  <>
                    <section>
                      <div className="text-xl font-semibold text-[#143c26]">Fanpage</div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {hospitalQuickLinks.map((item) => (
                          <a
                            key={item.label}
                            href={item.href || undefined}
                            target={item.href ? '_blank' : undefined}
                            rel={item.href ? 'noreferrer' : undefined}
                            className="rounded-[10px] border border-[#d7e2da] bg-[#fbfdfb] px-4 py-4 text-sm text-sage-700"
                          >
                            <div className="font-semibold text-[#173925]">{item.label}</div>
                            <div className="mt-1">{item.value}</div>
                          </a>
                        ))}
                      </div>
                    </section>

                    <section>
                      <div className="text-xl font-semibold text-[#143c26]">Giờ làm việc</div>
                      <div className="mt-4 grid gap-3">
                        {hospitalHours.map((item) => (
                          <div key={item.label} className="flex items-center justify-between rounded-[10px] border border-[#d7e2da] bg-[#fbfdfb] px-4 py-4">
                            <div className="text-sm font-medium text-[#173925]">{item.label}</div>
                            <div className="text-sm text-sage-600">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <div className="text-xl font-semibold text-[#143c26]">Tổng đài hỗ trợ</div>
                      <div className="mt-4 rounded-[12px] border border-[#d7e2da] bg-[#fbfdfb] p-5">
                        <div className="text-sm leading-6 text-sage-700">
                          Trong trường hợp bạn cần hỗ trợ thêm thông tin, vui lòng liên hệ tổng đài bên dưới để được trợ giúp.
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-[#173925]">
                          <div className="font-semibold">Tổng đài đặt khám: {clinic?.phone || '19002805'}</div>
                          <div>Hỗ trợ kỹ thuật: 19002805 (1.000đ/phút)</div>
                          <div className="text-[#0f4f2a]">Tư vấn đặt khám</div>
                        </div>
                      </div>
                    </section>
                  </>
                )}
              </div>

            </div>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[14px] border border-[#d7e2da] bg-white">
          <div className="border-b border-[#d7e2da] px-6 py-5">
            <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-sage-500 hover:text-sage-900">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>
            <div className="mt-4 flex items-center gap-4">
              <FacilityLogo facility={clinic} label={facilityLabel} className="h-16 w-16 rounded-[18px]" />
              <div>
                <div className="text-2xl font-bold text-[#143c26]">{clinic.name}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <div className="text-[28px] font-bold text-[#143c26]">Chọn chuyên khoa...</div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {services.map((service) => {
                      const isActive = String(service.id) === String(selectedServiceId)
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setSelectedServiceId(String(service.id))}
                          className={`rounded-[10px] border px-5 py-4 text-left transition ${
                            isActive ? 'border-[#0f4f2a] bg-[#f2f8f4]' : 'border-[#d7e2da] bg-white hover:border-[#94b39f]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-lg font-semibold text-[#173925]">{service.name}</div>
                            </div>
                            {isActive && <Check className="h-5 w-5 text-[#0f4f2a]" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <div className="text-[28px] font-bold text-[#143c26]">Chọn bác sĩ...</div>
                  </div>

                  <div className="rounded-[12px] border border-[#d7e2da] bg-[#fbfdfb] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-base font-semibold text-[#173925]">Lọc bác sĩ theo ngày</div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {appliedDoctorFilterDate && (
                          <Button variant="outline" className={secondaryButtonClass} onClick={clearDoctorFilter}>
                            Bỏ lọc
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className={secondaryButtonClass}
                          leftIcon={<CalendarDays className="h-4 w-4" />}
                          onClick={() => setDoctorFilterOpen((current) => !current)}
                        >
                          {doctorFilterOpen ? 'Ẩn bộ lọc ngày' : 'Lọc bác sĩ theo ngày'}
                        </Button>
                      </div>
                    </div>

                    {doctorFilterSummaryText && (
                      <div className="mt-3 rounded-[10px] bg-white px-4 py-3 text-sm font-medium text-[#0f4f2a]">
                        {doctorFilterSummaryText}
                      </div>
                    )}

                    {doctorFilterOpen && (
                      <div className="mt-4 space-y-4">

                        <BookingCalendar
                          monthDate={doctorFilterMonth}
                          minDate={minBookingDate}
                          maxDate={maxBookingDate}
                          selectedDate={doctorFilterDate}
                          onSelectDate={setDoctorFilterDate}
                          onMonthChange={setDoctorFilterMonth}
                          getDayState={getDoctorFilterDayState}
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-sm text-sage-600">
                            Ngày đang chọn: <span className="font-semibold text-[#173925]">{formatDateDisplay(doctorFilterDate)}</span>
                          </div>
                          <Button className={primaryButtonClass} isLoading={doctorFilterLoading} onClick={handleApplyDoctorFilter}>
                            Lọc
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {visibleDoctors.length === 0 ? (
                    <div className="rounded-[10px] border border-[#d7e2da] bg-[#fbfdfb] p-6 text-sm text-sage-600">
                      Không có bác sĩ phù hợp với bộ lọc hiện tại. Vui lòng chọn ngày khác.
                    </div>
                  ) : null}

                  <div className="grid gap-3">
                    {visibleDoctors.map((doctor) => {
                      const isActive = String(doctor.id) === String(selectedDoctorId)
                      return (
                        <button
                          key={doctor.id}
                          type="button"
                          onClick={() => setSelectedDoctorId(String(doctor.id))}
                          className={`rounded-[10px] border px-4 py-4 text-left transition ${
                            isActive ? 'border-[#0f4f2a] bg-[#f2f8f4]' : 'border-[#d7e2da] bg-white hover:border-[#94b39f]'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <Avatar src={doctor.avatar} name={doctor.name} size="lg" />
                            <div className="min-w-0 flex-1">
                              <div className="text-base font-semibold text-[#173925]">{doctor.name}</div>
                              <div className="mt-1 text-sm text-sage-600">{doctor.specialization}</div>
                              <div className="mt-1 text-sm text-sage-500">
                                {doctor.yearsOfExperience ? `${doctor.yearsOfExperience} năm kinh nghiệm` : 'Đang cập nhật kinh nghiệm'}
                              </div>
                              <div className="mt-1 text-sm text-sage-500">
                                Chức vụ: {doctor.title}
                              </div>
                            </div>
                            {isActive && <Check className="h-5 w-5 text-[#0f4f2a]" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <div className="text-[28px] font-bold text-[#143c26]">Chọn thời gian khám...</div>
                  </div>

                  {availabilityLoading ? (
                    <div className="flex min-h-[220px] items-center justify-center rounded-[10px] border border-[#d7e2da] bg-[#fbfdfb]">
                      <Loading text="Đang tải lịch khám..." />
                    </div>
                  ) : availableDates.length === 0 ? (
                    <div className="rounded-[10px] border border-[#d7e2da] bg-[#fbfdfb] p-6 text-sm text-sage-600">
                      Bác sĩ này hiện chưa có lịch trống trong vài tuần tới. Vui lòng chọn bác sĩ khác.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">

                        <BookingCalendar
                          monthDate={scheduleMonth}
                          minDate={minBookingDate}
                          maxDate={maxBookingDate}
                          selectedDate={selectedDate}
                          onSelectDate={(date) => {
                            setSelectedDate(date)
                            setSelectedTime('')
                          }}
                          onMonthChange={setScheduleMonth}
                          getDayState={getScheduleDayState}
                        />
                      </div>

                      {selectedDateEntry?.slots?.length ? (
                        <div className="rounded-[10px] border border-[#d7e2da] bg-[#fbfdfb] px-4 py-3 text-sm text-sage-600">
                          Ngày khám đã chọn: <span className="font-semibold capitalize text-[#173925]">{formatScheduleDate(selectedDate)}</span>
                        </div>
                      ) : selectedDate ? (
                        <div className="rounded-[10px] border border-[#d7e2da] bg-[#fbfdfb] px-4 py-3 text-sm text-sage-600">
                          Ngày {formatDateDisplay(selectedDate)} hiện đã đầy lịch. Vui lòng chọn ngày khác.
                        </div>
                      ) : null}

                      <div className="space-y-4">
                        {Object.entries(slotGroups).map(([key, items]) => {
                          if (!items.length) return null

                          return (
                            <div key={key} className="rounded-[10px] border border-[#d7e2da] bg-[#fbfdfb] p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-base font-semibold text-[#173925]">{periodMeta[key].label}</div>
                                <div className="text-sm text-sage-500">{periodMeta[key].range}</div>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-3">
                                {items.map((slot) => {
                                  const isActive = slot.time === selectedTime
                                  return (
                                    <button
                                      key={slot.time}
                                      type="button"
                                      onClick={() => setSelectedTime(slot.time)}
                                      className={`rounded-[8px] border px-4 py-2 text-sm font-semibold transition ${
                                        isActive ? 'border-[#0f4f2a] bg-[#0f4f2a] text-white' : 'border-[#d7e2da] bg-white text-[#173925] hover:border-[#94b39f]'
                                      }`}
                                    >
                                      {slot.label || slot.time}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-5">
                  <div>
                    <div className="text-[28px] font-bold text-[#143c26]">Chọn hồ sơ cần khám...</div>
                  </div>

                  <div className="grid gap-3">
                    {profiles.map((profile) => {
                      const isActive = profile.id === selectedProfileId

                      return (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => setSelectedProfileId(profile.id)}
                          className={`rounded-[10px] border px-4 py-4 text-left transition ${
                            isActive ? 'border-[#0f4f2a] bg-[#f2f8f4]' : 'border-[#d7e2da] bg-white hover:border-[#94b39f]'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar src={profile.avatar} name={profile.fullName} size="lg" className="[&>img]:rounded-[16px] [&>div]:rounded-[16px]" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-[#e8f3eb] px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-[#0f4f2a]">
                                  {profile.relationshipLabel || profile.badge}
                                </span>
                              </div>
                              <div className="mt-2 text-base font-semibold uppercase text-[#173925]">{profile.fullName}</div>
                              <div className="mt-2 text-sm text-sage-600">Ngày sinh: {formatDateDisplay(profile.dateOfBirth)}</div>
                              <div className="mt-1 text-sm text-sage-600">Số điện thoại: {profile.phone || '--'}</div>
                              <div className="mt-3 text-sm font-medium text-[#0f4f2a]">Xem chi tiết hồ sơ</div>
                            </div>
                            {isActive && <Check className="h-5 w-5 text-[#0f4f2a]" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className={secondaryButtonClass} onClick={() => navigate('/profile')}>
                      Thêm hồ sơ mới
                    </Button>
                    <Button variant="outline" className={secondaryButtonClass} onClick={() => navigate('/profile')}>
                      Xem chi tiết hồ sơ
                    </Button>
                  </div>

                  <div className="rounded-[10px] border border-[#d7e2da] bg-[#fbfdfb] p-4">
                    <label className="block text-sm font-semibold text-[#173925]">Thông tin bổ sung (không bắt buộc)...</label>
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="mt-3 min-h-[120px] w-full rounded-[8px] border border-[#d7e2da] bg-white px-4 py-3 text-sm text-[#173925] outline-none focus:border-[#0f4f2a]"
                      placeholder="Triệu chứng, thuốc đang dùng, tiền sử, ..."
                    />
                  </div>

                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      handleAttachments(event.dataTransfer.files)
                    }}
                    className="rounded-[10px] border border-dashed border-[#b6c9bb] bg-[#fbfdfb] p-5"
                  >
                    <div className="flex items-center gap-3 text-[#173925]">
                      <Upload className="h-5 w-5" />
                      <div className="text-sm font-semibold">Chọn tập tin hoặc kéo & thả tối đa 5 ảnh.</div>
                    </div>
                    <div className="mt-2 text-sm text-sage-500">Size thấp hơn 15MB, định dạng file png, jpg.</div>
                    <label className="mt-4 inline-flex cursor-pointer rounded-[8px] border border-[#0f4f2a] px-4 py-2 text-sm font-semibold text-[#0f4f2a] transition hover:bg-[#edf4ef]">
                      Chọn ảnh
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        multiple
                        className="hidden"
                        onChange={(event) => {
                          handleAttachments(event.target.files)
                          event.target.value = ''
                        }}
                      />
                    </label>

                    {attachments.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {attachments.map((file) => (
                          <div key={`${file.name}-${file.size}`} className="rounded-full bg-white px-3 py-1.5 text-sm text-sage-600">
                            {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#e3ebe4] pt-5">
                <Button variant="outline" className={secondaryButtonClass} onClick={handleBackStep}>
                  Quay lại
                </Button>

                {currentStep < 4 ? (
                  <Button
                    className={primaryButtonClass}
                    onClick={() => setCurrentStep((step) => step + 1)}
                    disabled={
                      (currentStep === 1 && !selectedServiceId) ||
                      (currentStep === 2 && !selectedDoctorId) ||
                      (currentStep === 3 && (!selectedDate || !selectedTime || availableDates.length === 0))
                    }
                  >
                    Tiếp tục
                  </Button>
                ) : (
                  <Button className={primaryButtonClass} isLoading={isSubmitting} onClick={handleSubmit}>
                    Đặt khám ngay
                  </Button>
                )}
              </div>
            </div>

            <aside className="h-fit rounded-[12px] border border-[#d7e2da] bg-[#f7faf8] p-5">
              <div className="text-lg font-semibold text-[#143c26]">Thông tin đặt khám</div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-sage-500">Chuyên khoa</div>
                  <div className="mt-1 text-sm font-semibold text-[#173925]">{selectedService?.name || '--'}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-sage-500">Bác sĩ</div>
                  <div className="mt-1 text-sm font-semibold text-[#173925]">{selectedDoctor?.name || '--'}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-sage-500">Ngày và giờ khám</div>
                  <div className="mt-1 text-sm font-semibold text-[#173925]">{selectedDate ? `Ngày khám ${formatDateDisplay(selectedDate)}` : '--'}</div>
                  <div className="mt-1 text-sm text-sage-600">{selectedSlot?.label || selectedTime || '--'}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-sage-500">Hồ sơ bệnh nhân</div>
                  <div className="mt-1 text-sm font-semibold text-[#173925]">{selectedProfile?.fullName || '--'}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-sage-500">Địa điểm</div>
                  <div className="mt-1 text-sm font-semibold text-[#173925]">{clinic.name}</div>
                  <div className="mt-1 text-sm text-sage-600">{clinic.address}</div>
                </div>

                {selectedDoctor && (
                  <div className="rounded-[10px] border border-[#d7e2da] bg-white p-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={selectedDoctor.avatar} name={selectedDoctor.name} size="md" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[#173925]">{selectedDoctor.name}</div>
                        <div className="truncate text-sm text-sage-500">{selectedDoctor.specialization}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      )}
    </div>
  )
}
