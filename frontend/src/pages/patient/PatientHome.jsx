import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Baby,
  Brain,
  Building2,
  Droplets,
  Ear,
  Flower2,
  HeartPulse,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Stethoscope,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { userApi } from '@/api/userApiWrapper'
import { clinicApi } from '@/api/clinicApiWrapper'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const bookingModes = [
  { key: 'all', label: 'Tất cả', icon: Star },
  { key: 'doctor', label: 'Bác sĩ', icon: Stethoscope },
  { key: 'hospital', label: 'Bệnh viện', icon: Building2 },
  { key: 'clinic', label: 'Phòng khám', icon: MapPin },
  { key: 'specialization', label: 'Theo chuyên khoa', icon: ShieldCheck },
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

const facilityCardFallbackImage =
  'https://placehold.co/1200x800/e8f3eb/143c26?text=HealthFlow'

const fallbackHospitals = [
  {
    id: 'hospital-1',
    name: 'Bệnh viện Bạch Mai',
    specialty: 'Nội tổng quát',
    address: '78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội',
  },
  {
    id: 'hospital-2',
    name: 'Bệnh viện Chợ Rẫy',
    specialty: 'Tim mạch',
    address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM',
  },
  {
    id: 'hospital-3',
    name: 'Bệnh viện Đại học Y Dược',
    specialty: 'Da liễu',
    address: '215 Hồng Bàng, Phường 11, Quận 5, TP.HCM',
  },
  {
    id: 'hospital-4',
    name: 'Bệnh viện Nhân dân 115',
    specialty: 'Chấn thương chỉnh hình',
    address: '527 Sư Vạn Hạnh, Phường 12, Quận 10, TP.HCM',
  },
  {
    id: 'hospital-5',
    name: 'Bệnh viện Nhi Đồng 1',
    specialty: 'Nhi khoa',
    address: '341 Sư Vạn Hạnh, Phường 10, Quận 10, TP.HCM',
  },
  {
    id: 'hospital-6',
    name: 'Bệnh viện Từ Dũ',
    specialty: 'Sản phụ khoa',
    address: '284 Cống Quỳnh, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',
  },
]

const fallbackClinics = [
  {
    id: 'clinic-fallback-1',
    name: 'Phòng khám Đa khoa MedCare Sài Gòn',
    specialty: 'Đa khoa',
    address: '256 Điện Biên Phủ, Phường Võ Thị Sáu, Quận 3, TP.HCM',
  },
  {
    id: 'clinic-fallback-2',
    name: 'Phòng khám Chuyên khoa Việt Phúc',
    specialty: 'Nội tổng quát',
    address: '42 Nguyễn Oanh, Phường 7, Gò Vấp, TP.HCM',
  },
  {
    id: 'clinic-fallback-3',
    name: 'Phòng khám Family Health',
    specialty: 'Y học gia đình',
    address: '12 Trần Não, An Khánh, TP. Thủ Đức, TP.HCM',
  },
  {
    id: 'clinic-fallback-4',
    name: 'Phòng khám Quốc tế Bình An',
    specialty: 'Khám tổng quát',
    address: '88 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh, TP.HCM',
  },
  {
    id: 'clinic-fallback-5',
    name: 'Phòng khám Đa khoa An Khang',
    specialty: 'Đa khoa',
    address: '150 Lê Văn Việt, Hiệp Phú, TP. Thủ Đức, TP.HCM',
  },
  {
    id: 'clinic-fallback-6',
    name: 'Phòng khám Chuyên khoa Nhi Sài Gòn',
    specialty: 'Nhi khoa',
    address: '63 Phạm Viết Chánh, Phường 19, Bình Thạnh, TP.HCM',
  },
]

function getDoctorName(doctor) {
  return doctor.fullName || doctor.name || 'Bác sĩ'
}

function getDoctorLocation(doctor) {
  return doctor.workplace || doctor.hospital || doctor.clinicName || 'Cơ sở liên kết'
}

function getHospitalName(doctor) {
  return doctor.hospital || doctor.workplace || ''
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function mergeUniqueByName(primaryItems, fallbackItems) {
  const seen = new Set()

  return [...primaryItems, ...fallbackItems].filter((item) => {
    const key = normalizeText(item?.name)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function resolveImage(entity, fallbackImage) {
  return entity?.logo || entity?.logoUrl || entity?.image || entity?.imageUrl || entity?.avatar || fallbackImage
}

function resolveLogo(entity, fallbackImage) {
  return entity?.logo || entity?.logoUrl || entity?.avatar || entity?.image || entity?.imageUrl || fallbackImage
}

function findClinicByName(name, clinics) {
  const normalizedName = normalizeText(name)
  if (!normalizedName) return null

  return (
    clinics.find((clinic) => normalizedName.includes(normalizeText(clinic?.name))) ||
    clinics.find((clinic) => normalizeText(clinic?.name).includes(normalizedName)) ||
    null
  )
}

function resolveDoctorAddress(doctor, clinics) {
  const directAddress = [doctor?.hospitalAddress, doctor?.clinicAddress, doctor?.address]
    .map((value) => String(value || '').trim())
    .find(Boolean)

  if (directAddress) return directAddress

  return findClinicByName(getHospitalName(doctor), clinics)?.address || 'Đang cập nhật địa chỉ'
}

function resolveClinicSpecialty(clinic) {
  return clinic?.specialty || clinic?.specialization || clinic?.type || 'Đa khoa'
}

function getModeRoute(modeKey) {
  if (modeKey === 'all') return '/find-doctors'
  if (modeKey === 'specialization') return '/find-doctors'
  return `/find-doctors?scope=${modeKey}`
}

function getSpecializationIcon(specialization) {
  const normalized = String(specialization || '').toLowerCase()

  if (normalized.includes('da')) return Droplets
  if (normalized.includes('nhi')) return Baby
  if (normalized.includes('nội tiết')) return Activity
  if (normalized.includes('tim')) return HeartPulse
  if (normalized.includes('thần kinh')) return Brain
  if (normalized.includes('tai') || normalized.includes('mũi') || normalized.includes('họng')) return Ear
  if (normalized.includes('sản')) return Flower2

  return Stethoscope
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-semibold text-sage-500">{eyebrow}</div>
        <h2 className="mt-1 text-2xl font-bold text-sage-950">{title}</h2>
      </div>
      {action}
    </div>
  )
}

const darkButtonClass =
  '!rounded-[6px] border-[#0f4f2a] bg-[#0f4f2a] text-white shadow-none hover:bg-[#0b3f21]'

const darkOutlineButtonClass =
  '!rounded-[6px] border-[#0f4f2a] text-[#0f4f2a] shadow-none hover:bg-[#edf4ef] hover:text-[#0f4f2a]'

export default function PatientHome() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [keyword, setKeyword] = useState('')
  const [bookingMode, setBookingMode] = useState('all')
  const [featuredDoctors, setFeaturedDoctors] = useState([])
  const [clinicDirectory, setClinicDirectory] = useState([])
  const [featuredClinics, setFeaturedClinics] = useState([])
  const [specializations, setSpecializations] = useState([])

  useEffect(() => {
    let mounted = true

    async function loadData() {
      if (!user?.id) return

      const [doctorResult, specializationResult, clinicResult] =
        await Promise.allSettled([
          userApi.searchDoctors({ size: 8, page: 0, sort: 'rating,desc' }),
          userApi.getSpecializations(),
          clinicApi.getClinics({ active: true }),
        ])

      if (!mounted) return

      const doctors =
        doctorResult.status === 'fulfilled' ? doctorResult.value?.content || doctorResult.value || [] : []
      const clinics = clinicResult.status === 'fulfilled' ? clinicResult.value || [] : []
      const activeClinics = clinics.filter((clinic) => clinic?.active !== false)
      const mergedClinics = mergeUniqueByName(
        activeClinics.map((clinic, index) => ({
          ...clinic,
          image: resolveImage(clinic, clinicImages[index % clinicImages.length]),
          logo: resolveLogo(clinic, clinicImages[index % clinicImages.length]),
        })),
        fallbackClinics.map((clinic, index) => ({
          ...clinic,
          image: clinicImages[(activeClinics.length + index) % clinicImages.length],
          logo: clinicImages[(activeClinics.length + index) % clinicImages.length],
        }))
      )

      setFeaturedDoctors(doctors.slice(0, 8))
      setClinicDirectory(mergedClinics)
      setFeaturedClinics(mergedClinics.slice(0, 8))
      setSpecializations((specializationResult.status === 'fulfilled' ? specializationResult.value : []).slice(0, 8))
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [user?.id])

  const patientName = useMemo(() => {
    const fullName = String(user?.name || user?.fullName || '').trim()
    return fullName ? fullName.split(' ').slice(-1)[0] : 'bạn'
  }, [user?.fullName, user?.name])

  const featuredHospitals = useMemo(() => {
    const seen = new Set()
    const derived = featuredDoctors
      .map((doctor, index) => ({
        id: doctor.id,
        name: getHospitalName(doctor),
        specialty: doctor.specialization || 'Chuyên khoa nổi bật',
        address: resolveDoctorAddress(doctor, clinicDirectory),
        logo:
          findClinicByName(getHospitalName(doctor), clinicDirectory)?.logo ||
          findClinicByName(getHospitalName(doctor), clinicDirectory)?.image ||
          hospitalImages[index % hospitalImages.length],
        image:
          findClinicByName(getHospitalName(doctor), clinicDirectory)?.image ||
          hospitalImages[index % hospitalImages.length],
      }))
      .filter((item) => {
        if (!item.name || seen.has(item.name)) return false
        seen.add(item.name)
        return true
      })
      .slice(0, 6)

    const fallbackItems = fallbackHospitals
      .filter((hospital) => !seen.has(hospital.name))
      .map((hospital, index) => ({
      ...hospital,
      logo: resolveLogo(hospital, hospitalImages[(derived.length + index) % hospitalImages.length]),
      image: resolveImage(hospital, hospitalImages[(derived.length + index) % hospitalImages.length]),
    }))

    return [...derived, ...fallbackItems].slice(0, 6)
  }, [clinicDirectory, featuredDoctors])

  const handleSearch = (event) => {
    event.preventDefault()
    const normalizedKeyword = keyword.trim()
    navigate(normalizedKeyword ? `/find-doctors?keyword=${encodeURIComponent(normalizedKeyword)}` : '/find-doctors')
  }

  const handleSpecializationClick = (specialization) => {
    navigate(`/find-doctors?specialization=${encodeURIComponent(specialization)}`)
  }

  return (
    <div className="space-y-5">
      <section
        className="relative overflow-hidden rounded-2xl border border-emerald-950 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(8, 47, 26, 0.92) 0%, rgba(14, 86, 47, 0.88) 48%, rgba(18, 113, 60, 0.66) 100%), url(${clinicImages[1]})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_28%)]" />
        <div className="relative px-6 py-7 sm:px-8 sm:py-8 lg:px-10">
          <div className="text-sm font-medium text-white/85">Chào {patientName}</div>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-[2.5rem]">
            Tìm nơi khám phù hợp,
            <br />
            đặt lịch nhanh hơn.
          </h1>

          <form onSubmit={handleSearch} className="mt-6">
            <div className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-sm sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-lg px-4 py-3">
                <Search className="h-5 w-5 text-sage-400" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tên bác sĩ, bệnh viện, phòng khám"
                  className="w-full bg-transparent text-base outline-none placeholder:text-sage-400"
                />
              </div>
              <Button type="submit" size="lg" className={`${darkButtonClass} px-7`}>
                Tìm kiếm
              </Button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {specializations.map((specialization) => (
              <button
                key={specialization}
                type="button"
                onClick={() => handleSpecializationClick(specialization)}
                className="rounded-md border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
              >
                {specialization}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-sage-200 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-lg bg-[#eef2ee] p-1">
            {bookingModes.map((mode) => {
              const Icon = mode.icon

              return (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setBookingMode(mode.key)}
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                    bookingMode === mode.key
                      ? 'bg-white text-sage-950 shadow-sm'
                      : 'text-sage-600 hover:text-sage-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {mode.label}
                </button>
              )
            })}
          </div>

          <Button variant="outline" className={darkOutlineButtonClass} onClick={() => navigate(getModeRoute(bookingMode))}>
            {bookingMode === 'all'
              ? 'Xem tất cả nổi bật'
              : `Đặt lịch khám ${bookingModes.find((mode) => mode.key === bookingMode)?.label.toLowerCase()}`}
          </Button>
        </div>
      </section>

      {(bookingMode === 'all' || bookingMode === 'doctor') && (
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Bác sĩ nổi bật"
            title="Đặt khám nhanh với bác sĩ"
            action={
              <Link to="/find-doctors">
                <Button variant="outline" className={darkOutlineButtonClass}>Xem tất cả</Button>
              </Link>
            }
          />

          <div className="patient-carousel -mx-4 overflow-x-auto px-4 pb-2">
            <div className="flex min-w-max gap-4">
              {featuredDoctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex h-full w-[320px] shrink-0 flex-col overflow-hidden rounded-xl border border-sage-200 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex min-h-[206px] flex-1 flex-col border-b border-sage-100 px-5 py-4 text-center">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-[8px] bg-sage-50">
                      <Avatar src={doctor.avatarUrl || doctor.avatar} name={getDoctorName(doctor)} size="2xl" />
                    </div>
                    <div className="mt-3 min-h-[42px] line-clamp-2 text-base font-semibold leading-snug text-sage-950">{getDoctorName(doctor)}</div>
                    <div className="mt-1 min-h-[20px] line-clamp-1 text-sm font-semibold text-[#0f4f2a]">{doctor.specialization}</div>
                    <div className="mt-1 min-h-[20px] line-clamp-1 text-sm text-sage-600">{getDoctorLocation(doctor)}</div>
                    <div className="mt-auto inline-flex min-h-[40px] items-start justify-center gap-1.5 pt-2 text-sm text-sage-500">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage-400" />
                      <span className="line-clamp-2">{getDoctorLocation(doctor)}</span>
                    </div>
                  </div>

                  <div className="px-5 py-3">
                    <div className="flex">
                      <Button
                        className={`w-full ${darkButtonClass}`}
                        onClick={() => navigate(`/appointments/book?doctorId=${doctor.id}`)}
                      >
                        Đặt khám
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(bookingMode === 'all' || bookingMode === 'hospital') && (
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Bệnh viện nổi bật"
            title="Đặt khám bệnh viện"
            action={
              <Link to="/find-doctors?scope=hospital">
                <Button variant="outline" className={darkOutlineButtonClass}>Xem tất cả</Button>
              </Link>
            }
          />

          <div className="patient-carousel -mx-4 overflow-x-auto px-4 pb-2">
            <div className="flex min-w-max gap-4">
              {featuredHospitals.map((hospital) => (
                <div
                  key={hospital.id || hospital.name}
                  className="flex h-full w-[320px] shrink-0 flex-col overflow-hidden rounded-xl border border-sage-200 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.04)]"
                >
                  <img
                    src={hospital.image}
                    alt={hospital.name}
                    className="h-40 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = facilityCardFallbackImage
                    }}
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="inline-flex items-center gap-2 rounded-md bg-sage-50 px-3 py-1.5 text-sm text-sage-700">
                      <Building2 className="h-4 w-4 text-sage-500" />
                      {hospital.specialty}
                    </div>
                    <div className="mt-4 flex items-start gap-3">
                      <img
                        src={hospital.logo || hospital.image}
                        alt={hospital.name}
                        className="h-12 w-12 shrink-0 rounded-xl border border-sage-200 object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = facilityCardFallbackImage
                        }}
                      />
                      <div className="min-h-[48px] text-lg font-semibold text-sage-950">{hospital.name}</div>
                    </div>
                    <div className="mt-3 min-h-[48px] flex items-start gap-1.5 text-sm text-sage-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage-400" />
                      <span className="line-clamp-2">{hospital.address}</span>
                    </div>
                    <Button className={`mt-auto w-full ${darkButtonClass}`} onClick={() => navigate(`/hospitals/${encodeURIComponent(hospital.name)}`)}>
                      Đặt lịch tại đây
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(bookingMode === 'all' || bookingMode === 'clinic') && (
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Phòng khám nổi bật"
            title="Đặt khám phòng khám"
            action={
              <Link to="/find-doctors?scope=clinic">
                <Button variant="outline" className={darkOutlineButtonClass}>Xem tất cả</Button>
              </Link>
            }
          />

          <div className="patient-carousel -mx-4 overflow-x-auto px-4 pb-2">
            <div className="flex min-w-max gap-4">
              {featuredClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="flex h-full w-[320px] shrink-0 flex-col overflow-hidden rounded-xl border border-sage-200 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.04)]"
                >
                  <img
                    src={clinic.image}
                    alt={clinic.name}
                    className="h-40 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = facilityCardFallbackImage
                    }}
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="inline-flex items-center gap-2 rounded-md bg-sage-50 px-3 py-1.5 text-sm text-sage-700">
                      <Building2 className="h-4 w-4 text-sage-500" />
                      {resolveClinicSpecialty(clinic)}
                    </div>
                    <div className="mt-4 flex items-start gap-3">
                      <img
                        src={clinic.logo || clinic.image}
                        alt={clinic.name}
                        className="h-12 w-12 shrink-0 rounded-xl border border-sage-200 object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = facilityCardFallbackImage
                        }}
                      />
                      <div className="min-h-[56px] line-clamp-2 text-lg font-semibold text-sage-950">{clinic.name}</div>
                    </div>
                    <div className="mt-3 min-h-[48px] flex items-start gap-1.5 text-sm text-sage-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage-400" />
                      <span className="line-clamp-2">{clinic.address}</span>
                    </div>
                    <Button className={`mt-auto w-full ${darkButtonClass}`} onClick={() => navigate(`/clinics/${clinic.id}`)}>
                      Đặt lịch tại đây
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(bookingMode === 'all' || bookingMode === 'specialization') && (
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Theo chuyên khoa"
            title="Đặt khám chuyên khoa"
            action={
              <Link to="/find-doctors">
                <Button variant="outline" className={darkOutlineButtonClass}>Xem tất cả</Button>
              </Link>
            }
          />

          <div className="patient-carousel -mx-4 overflow-x-auto px-4 pb-2">
            <div className="flex min-w-max gap-4">
              {specializations.map((specialization, index) => {
                const Icon = getSpecializationIcon(specialization)

                return (
                  <button
                    key={specialization}
                    type="button"
                    onClick={() => handleSpecializationClick(specialization)}
                    className="w-[260px] shrink-0 overflow-hidden rounded-xl border border-sage-200 bg-white p-5 text-left shadow-[0_6px_16px_rgba(15,23,42,0.04)] transition-transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-sage-100 text-sage-800">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-semibold text-sage-400">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="mt-4 text-lg font-semibold text-sage-950">{specialization}</div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sage-800">
                      Xem bác sĩ
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
