import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageSquare,
  Search,
  X,
} from 'lucide-react'
import { userApi } from '@/api/userApiWrapper'
import { clinicApi } from '@/api/clinicApiWrapper'
import { Avatar } from '@/components/ui/Avatar'
import { Loading } from '@/components/ui/Loading'

const PAGE_SIZE = 12
const CLIENT_FILTER_SIZE = 200
const CONSULTATION_BOOKING_FEE = 100000
const FACILITY_CARD_FALLBACK_IMAGE =
  'https://placehold.co/1200x800/e8f3eb/143c26?text=HealthFlow'
const HOSPITAL_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80',
]
const CLINIC_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
]
const HOSPITAL_DIRECTORY = [
  {
    id: 'hospital-1',
    name: 'Bệnh viện Nhi đồng 2',
    specialty: 'Nhi khoa',
    address: '14 Lý Tự Trọng, Phường Sài Gòn, TP. Hồ Chí Minh',
  },
  {
    id: 'hospital-2',
    name: 'Bệnh viện Y Học Cổ Truyền TP.HCM',
    specialty: 'Y học cổ truyền',
    address: '179 -187 Nam Kỳ Khởi Nghĩa, Phường Xuân Hoà, TP. Hồ Chí Minh',
  },
  {
    id: 'hospital-3',
    name: 'Bệnh viện Lê Văn Thịnh',
    specialty: 'Đa khoa',
    address: 'Số 130 Lê Văn Thịnh, Phường Bình Trưng, TP. Hồ Chí Minh',
  },
  {
    id: 'hospital-4',
    name: 'Bệnh viện Răng Hàm Mặt TP.HCM',
    specialty: 'Răng - Hàm - Mặt',
    address: '263-265 Trần Hưng Đạo, Phường Cầu Ông Lãnh, TP. Hồ Chí Minh',
  },
  {
    id: 'hospital-5',
    name: 'Bệnh viện Đa Khoa Khánh Hội',
    specialty: 'Đa khoa',
    address: '63-65 Bến Vân Đồn, Phường Xóm Chiếu, TP. Hồ Chí Minh',
  },
  {
    id: 'hospital-6',
    name: 'Bệnh viện Đa Khoa Củ Chi',
    specialty: 'Đa khoa',
    address: '1307 Tỉnh lộ 7, Ấp Chợ Cũ 2, Xã An Nhơn Tây, Thành phố Hồ Chí Minh',
  },
  {
    id: 'hospital-7',
    name: 'Bệnh viện Đa Khoa Chánh Hưng',
    specialty: 'Đa khoa',
    address: '82 Cao Lỗ, Phường Chánh Hưng, TP. Hồ Chí Minh',
  },
  {
    id: 'hospital-8',
    name: 'Bệnh viện Đa Khoa Nhà Bè',
    specialty: 'Đa khoa',
    address: '281A Lê Văn Lương, Xã Nhà Bè, TP. Hồ Chí Minh',
  },
  {
    id: 'hospital-9',
    name: 'Bệnh viện Đa Khoa Gò Vấp',
    specialty: 'Đa khoa',
    address: '641 Quang Trung, Phường Thông Tây Hội, TP. Hồ Chí Minh',
  },
  {
    id: 'hospital-10',
    name: 'Bệnh viện Đa Khoa Nguyễn Thị Thập',
    specialty: 'Đa khoa',
    address: '101 Nguyễn Thị Thập, Phường Tân Mỹ, TP. Hồ Chí Minh',
  },
]
const CLINIC_DIRECTORY_FALLBACK = [
  {
    id: 'clinic-fallback-1',
    name: 'Phòng khám Đa khoa MedCare Sài Gòn',
    specialty: 'Đa khoa',
    address: '256 Điện Biên Phủ, Phường Võ Thị Sáu, TP. Hồ Chí Minh',
  },
  {
    id: 'clinic-fallback-2',
    name: 'Phòng khám Chuyên khoa Việt Phúc',
    specialty: 'Nội tổng quát',
    address: '42 Nguyễn Oanh, Phường Gò Vấp, TP. Hồ Chí Minh',
  },
  {
    id: 'clinic-fallback-3',
    name: 'Phòng khám Family Health',
    specialty: 'Y học gia đình',
    address: '12 Trần Não, Phường An Khánh, TP. Hồ Chí Minh',
  },
  {
    id: 'clinic-fallback-4',
    name: 'Phòng khám Quốc tế Bình An',
    specialty: 'Khám tổng quát',
    address: '88 Nguyễn Hữu Cảnh, Phường Thạnh Mỹ Tây, TP. Hồ Chí Minh',
  },
  {
    id: 'clinic-fallback-5',
    name: 'Phòng khám Đa khoa An Khang',
    specialty: 'Đa khoa',
    address: '150 Lê Văn Việt, Phường Hiệp Phú, TP. Hồ Chí Minh',
  },
  {
    id: 'clinic-fallback-6',
    name: 'Phòng khám Chuyên khoa Nhi Sài Gòn',
    specialty: 'Nhi khoa',
    address: '63 Phạm Viết Chánh, Phường Gia Định, TP. Hồ Chí Minh',
  },
  {
    id: 'clinic-fallback-7',
    name: 'Phòng khám Đa khoa Tâm Đức',
    specialty: 'Tim mạch',
    address: '219 Nguyễn Văn Cừ, Phường Chợ Quán, TP. Hồ Chí Minh',
  },
  {
    id: 'clinic-fallback-8',
    name: 'Phòng khám Chuyên khoa Da liễu Saigon Derma',
    specialty: 'Da liễu',
    address: '91 Võ Thị Sáu, Phường Xuân Hoà, TP. Hồ Chí Minh',
  },
]

const SCOPE_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'doctor', label: 'Bác sĩ' },
  { value: 'hospital', label: 'Bệnh viện' },
  { value: 'clinic', label: 'Phòng khám' },
]

const BOOKING_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'appointment', label: 'Đặt lịch khám' },
  { value: 'consultation', label: 'Đặt lịch tư vấn' },
]

const SPECIALIZATION_FALLBACKS = [
  'Dị ứng - miễn dịch',
  'Y học cổ truyền',
  'Lao - bệnh phổi',
  'Y học thể thao',
  'Cơ xương khớp',
  'Sản phụ khoa',
  'Nhãn khoa',
  'Nam khoa',
  'Vô sinh hiếm muộn',
  'Ngoại tiết niệu',
  'Ngoại thần kinh',
  'Nội tổng quát',
  'Ngoại niệu',
  'Dinh dưỡng',
  'Tiêu hoá',
  'Nhi khoa',
  'Da liễu',
  'Ngoại lồng ngực - mạch máu',
  'Chẩn đoán hình ảnh',
  'Ngôn ngữ trị liệu',
  'Răng - Hàm - Mặt',
  'Nội thần kinh',
  'Tai - Mũi - Họng',
  'Ung bướu',
  'Tim mạch',
  'Lão khoa',
  'Chấn thương chỉnh hình',
  'Hồi sức - cấp cứu',
  'Ngoại tổng quát',
  'Gây mê hồi sức',
  'Y học dự phòng',
  'Truyền nhiễm',
  'Nội thận',
  'Nội tiết',
  'Tâm thần',
  'Hô hấp',
  'Xét nghiệm',
  'Huyết học',
  'Tâm lý',
  'Phẫu thuật tạo hình (Thẩm mỹ)',
  'Đa khoa',
  'Phục hồi chức năng - Vật lý trị liệu',
]

const SUPPORTED_SCOPE_VALUES = new Set(SCOPE_OPTIONS.map((item) => item.value))
const SUPPORTED_BOOKING_TYPE_VALUES = new Set(BOOKING_TYPE_OPTIONS.map((item) => item.value))

const getScopeFromParams = (searchParams) => {
  const scope = searchParams.get('scope') || 'all'
  return SUPPORTED_SCOPE_VALUES.has(scope) ? scope : 'all'
}

const getKeywordFromParams = (searchParams) =>
  searchParams.get('keyword') || searchParams.get('q') || ''

const getSpecializationFromParams = (searchParams) =>
  searchParams.get('specialization') || ''

const getBookingTypeFromParams = (searchParams) => {
  const bookingType = searchParams.get('bookingType') || 'all'
  return SUPPORTED_BOOKING_TYPE_VALUES.has(bookingType) ? bookingType : 'all'
}

const getPageFromParams = (searchParams) => {
  const rawPage = Number(searchParams.get('page') || 1)
  return Number.isFinite(rawPage) && rawPage > 0 ? rawPage - 1 : 0
}

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const mergeUniqueByName = (items) => {
  const seen = new Set()

  return items.filter((item) => {
    const key = normalizeText(item?.name)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const resolveFacilityImage = (facility, fallbackImage) =>
  facility?.image || facility?.imageUrl || facility?.logo || facility?.logoUrl || fallbackImage

const resolveFacilityLogo = (facility, fallbackImage) =>
  facility?.logo || facility?.logoUrl || facility?.avatar || facility?.image || facility?.imageUrl || fallbackImage

const decorateFacilities = (items, imagePool) =>
  items.map((item, index) => ({
    ...item,
    image: resolveFacilityImage(item, imagePool[index % imagePool.length]),
    logo: resolveFacilityLogo(item, imagePool[index % imagePool.length]),
    specialty: item?.specialty || item?.specialization || item?.type || 'Đa khoa',
  }))

const getFacilityScopeTitle = (scope) =>
  scope === 'hospital'
    ? 'Đặt khám trực tuyến với các Bệnh viện'
    : 'Đặt khám trực tuyến với các Phòng khám'

const getFacilityRoute = (facility, scope) =>
  scope === 'hospital'
    ? `/hospitals/${encodeURIComponent(facility.name)}`
    : `/clinics/${facility.id}`

const mergeSpecializations = (apiSpecializations) => {
  const merged = [...SPECIALIZATION_FALLBACKS, ...(apiSpecializations || [])]
  return Array.from(
    new Map(
      merged
        .map((item) => String(item || '').trim())
        .filter(Boolean)
        .map((item) => [normalizeText(item), item])
    ).values()
  )
}

const formatCurrency = (amount) => {
  if (!amount) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const formatDoctorName = (name) => {
  const trimmed = String(name || '').trim()
  if (!trimmed) return 'Bác sĩ đang cập nhật'
  return /^bác sĩ/i.test(trimmed) || /^(bs|ths\.?\s*bs|ts\.?\s*bs)/i.test(trimmed)
    ? trimmed
    : `Bác sĩ ${trimmed}`
}

const getDoctorAddress = (doctor) =>
  doctor?.workplace ||
  doctor?.hospital ||
  doctor?.clinicName ||
  doctor?.address ||
  'Địa chỉ đang cập nhật'

const getScopeLabel = (scope) =>
  SCOPE_OPTIONS.find((item) => item.value === scope)?.label || 'Tất cả'

const getBookingTypeLabel = (bookingType) =>
  BOOKING_TYPE_OPTIONS.find((item) => item.value === bookingType)?.label || 'Tất cả'

const doctorSupportsConsultation = (doctor) => Number(doctor?.consultationFee || 0) > 0

const doctorSupportsAppointment = (doctor) =>
  Boolean(doctor?.id && (doctor?.specialization || doctor?.workplace || doctor?.hospital || doctor?.clinicName || doctor?.fullName))

const doctorMatchesBookingType = (doctor, bookingType) => {
  if (bookingType === 'consultation') return doctorSupportsConsultation(doctor)
  if (bookingType === 'appointment') return doctorSupportsAppointment(doctor)
  return true
}

export default function DoctorSearch() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [scope, setScope] = useState(() => getScopeFromParams(searchParams))
  const [keyword, setKeyword] = useState(() => getKeywordFromParams(searchParams))
  const [keywordInput, setKeywordInput] = useState(() => getKeywordFromParams(searchParams))
  const [specialization, setSpecialization] = useState(() => getSpecializationFromParams(searchParams))
  const [specializationDraft, setSpecializationDraft] = useState(() => getSpecializationFromParams(searchParams))
  const [bookingType, setBookingType] = useState(() => getBookingTypeFromParams(searchParams))
  const [specializationQuery, setSpecializationQuery] = useState('')
  const [page, setPage] = useState(() => getPageFromParams(searchParams))

  const [doctors, setDoctors] = useState([])
  const [clinics, setClinics] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [showScopeMenu, setShowScopeMenu] = useState(false)
  const [showBookingTypeMenu, setShowBookingTypeMenu] = useState(false)
  const [showSpecializationPopup, setShowSpecializationPopup] = useState(false)

  const scopeMenuRef = useRef(null)
  const bookingTypeMenuRef = useRef(null)

  const specializationOptions = useMemo(
    () => mergeSpecializations(specializations),
    [specializations]
  )

  const hospitalDirectory = useMemo(
    () => decorateFacilities(HOSPITAL_DIRECTORY, HOSPITAL_COVER_IMAGES),
    []
  )

  const clinicDirectory = useMemo(() => {
    const mergedClinics = mergeUniqueByName([
      ...decorateFacilities(clinics, CLINIC_COVER_IMAGES),
      ...decorateFacilities(CLINIC_DIRECTORY_FALLBACK, CLINIC_COVER_IMAGES),
    ])

    return mergedClinics
  }, [clinics])

  const filteredSpecializations = useMemo(() => {
    const normalizedQuery = normalizeText(specializationQuery)
    if (!normalizedQuery) return specializationOptions
    return specializationOptions.filter((item) => normalizeText(item).includes(normalizedQuery))
  }, [specializationOptions, specializationQuery])

  const isFacilityScope = scope === 'hospital' || scope === 'clinic'

  const facilityResults = useMemo(() => {
    if (!isFacilityScope) return []

    const source = scope === 'hospital' ? hospitalDirectory : clinicDirectory
    const normalizedKeyword = normalizeText(keyword)
    const normalizedSpecialization = normalizeText(specialization)

    return source.filter((facility) => {
      const haystack = normalizeText(`${facility.name} ${facility.address} ${facility.specialty}`)
      const matchesKeyword = !normalizedKeyword || haystack.includes(normalizedKeyword)
      const matchesSpecialization =
        !normalizedSpecialization || normalizeText(facility.specialty).includes(normalizedSpecialization)

      return matchesKeyword && matchesSpecialization
    })
  }, [clinicDirectory, hospitalDirectory, isFacilityScope, keyword, scope, specialization])

  const searchPlaceholder = isFacilityScope
    ? `Tìm theo tên ${scope === 'hospital' ? 'bệnh viện' : 'phòng khám'}, địa chỉ...`
    : 'Tìm theo tên bác sĩ, chuyên khoa...'

  useEffect(() => {
    const nextScope = getScopeFromParams(searchParams)
    const nextKeyword = getKeywordFromParams(searchParams)
    const nextSpecialization = getSpecializationFromParams(searchParams)
    const nextBookingType = getBookingTypeFromParams(searchParams)
    const nextPage = getPageFromParams(searchParams)

    setScope(nextScope)
    setKeyword(nextKeyword)
    setKeywordInput(nextKeyword)
    setSpecialization(nextSpecialization)
    setSpecializationDraft(nextSpecialization)
    setBookingType(nextBookingType)
    setPage(nextPage)
  }, [searchParams])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (scopeMenuRef.current && !scopeMenuRef.current.contains(event.target)) {
        setShowScopeMenu(false)
      }
      if (bookingTypeMenuRef.current && !bookingTypeMenuRef.current.contains(event.target)) {
        setShowBookingTypeMenu(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowScopeMenu(false)
        setShowBookingTypeMenu(false)
        setShowSpecializationPopup(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const data = await userApi.getSpecializations()
        setSpecializations(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load specializations:', error)
      }
    }

    loadSpecializations()
  }, [])

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const data = await clinicApi.getClinics({ active: true })
        const nextClinics = Array.isArray(data)
          ? data.filter((clinic) => clinic?.active !== false)
          : []
        setClinics(nextClinics)
      } catch (error) {
        console.error('Failed to load clinics:', error)
        setClinics([])
      }
    }

    loadClinics()
  }, [])

  const updateUrl = useCallback((nextState) => {
    const nextParams = new URLSearchParams()
    if (nextState.scope && nextState.scope !== 'all') nextParams.set('scope', nextState.scope)
    if (nextState.keyword) nextParams.set('keyword', nextState.keyword)
    if (nextState.specialization) nextParams.set('specialization', nextState.specialization)
    if (nextState.bookingType && nextState.bookingType !== 'all') nextParams.set('bookingType', nextState.bookingType)
    if (nextState.page > 0) nextParams.set('page', String(nextState.page + 1))
    setSearchParams(nextParams, { replace: true })
  }, [setSearchParams])

  const searchDoctors = useCallback(async () => {
    if (scope === 'hospital' || scope === 'clinic') {
      setLoading(false)
      setDoctors([])
      setTotalPages(0)
      setTotalElements(0)
      return
    }

    try {
      setLoading(true)
      const useClientBookingTypeFilter = bookingType !== 'all'
      const params = {
        page: useClientBookingTypeFilter ? 0 : page,
        size: useClientBookingTypeFilter ? CLIENT_FILTER_SIZE : PAGE_SIZE,
        sort: 'rating,desc',
      }
      if (keyword.trim()) params.keyword = keyword.trim()
      if (specialization) params.specialization = specialization

      const data = await userApi.searchDoctors(params)
      const fetchedDoctors = Array.isArray(data?.content) ? data.content : []
      const filteredDoctors = useClientBookingTypeFilter
        ? fetchedDoctors.filter((doctor) => doctorMatchesBookingType(doctor, bookingType))
        : fetchedDoctors

      if (useClientBookingTypeFilter) {
        const start = page * PAGE_SIZE
        const end = start + PAGE_SIZE
        setDoctors(filteredDoctors.slice(start, end))
        setTotalElements(filteredDoctors.length)
        setTotalPages(Math.ceil(filteredDoctors.length / PAGE_SIZE))
      } else {
        setDoctors(filteredDoctors)
        setTotalPages(Number(data?.totalPages || 0))
        setTotalElements(Number(data?.totalElements || 0))
      }
    } catch (error) {
      console.error('Failed to search doctors:', error)
      setDoctors([])
      setTotalPages(0)
      setTotalElements(0)
    } finally {
      setLoading(false)
    }
  }, [bookingType, keyword, page, scope, specialization])

  useEffect(() => {
    searchDoctors()
  }, [searchDoctors])

  const handleSearchSubmit = (event) => {
    event?.preventDefault()
    updateUrl({
      scope,
      keyword: keywordInput.trim(),
      specialization,
      bookingType,
      page: 0,
    })
  }

  const handleScopeChange = (nextScope) => {
    setShowScopeMenu(false)
    updateUrl({
      scope: nextScope,
      keyword: keyword.trim(),
      specialization,
      bookingType: nextScope === 'hospital' || nextScope === 'clinic' ? 'all' : bookingType,
      page: 0,
    })
  }

  const handleBookingTypeChange = (nextBookingType) => {
    setShowBookingTypeMenu(false)
    updateUrl({
      scope,
      keyword: keyword.trim(),
      specialization,
      bookingType: nextBookingType,
      page: 0,
    })
  }

  const openSpecializationPopup = () => {
    setSpecializationDraft(specialization)
    setSpecializationQuery('')
    setShowSpecializationPopup(true)
  }

  const applySpecialization = () => {
    setShowSpecializationPopup(false)
    updateUrl({
      scope,
      keyword: keyword.trim(),
      specialization: specializationDraft,
      bookingType,
      page: 0,
    })
  }

  const clearAllFilters = () => {
    setKeywordInput('')
    setSpecializationDraft('')
    setSpecializationQuery('')
    updateUrl({
      scope: 'all',
      keyword: '',
      specialization: '',
      bookingType: 'all',
      page: 0,
    })
  }

  const hasActiveFilters = Boolean(keyword || specialization || scope !== 'all' || bookingType !== 'all')

  const handleBookDoctor = (doctorId) => {
    navigate(`/appointments/book?doctorId=${doctorId}`)
  }

  const handleConsultDoctor = (doctorId) => {
    navigate(`/patient/consultations/new?doctorId=${doctorId}`)
  }

  const handleOpenFacility = (facility) => {
    navigate(getFacilityRoute(facility, scope))
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pageItems = Array.from({ length: totalPages }, (_, index) => index)
      .filter((index) => index === 0 || index === totalPages - 1 || Math.abs(index - page) <= 1)
      .reduce((items, current, index, source) => {
        if (index > 0 && current - source[index - 1] > 1) items.push('dots')
        items.push(current)
        return items
      }, [])

    return (
      <div className="mt-8 flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => updateUrl({ scope, keyword, specialization, bookingType, page: page - 1 })}
          className="inline-flex h-10 w-10 items-center justify-center border border-[#d7dde6] bg-white text-[#334155] transition hover:border-[#0f766e] hover:text-[#0f766e] disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:text-[#94a3b8]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageItems.map((item, index) =>
          item === 'dots' ? (
            <span key={`dots-${index}`} className="px-2 text-sm text-[#94a3b8]">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => updateUrl({ scope, keyword, specialization, bookingType, page: item })}
              className={`inline-flex h-10 min-w-10 items-center justify-center border px-3 text-sm font-semibold transition ${
                page === item
                  ? 'border-[#0f766e] bg-[#0f766e] text-white'
                  : 'border-[#d7dde6] bg-white text-[#334155] hover:border-[#0f766e] hover:text-[#0f766e]'
              }`}
            >
              {item + 1}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => updateUrl({ scope, keyword, specialization, bookingType, page: page + 1 })}
          className="inline-flex h-10 w-10 items-center justify-center border border-[#d7dde6] bg-white text-[#334155] transition hover:border-[#0f766e] hover:text-[#0f766e] disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:text-[#94a3b8]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const resultCount = isFacilityScope ? facilityResults.length : totalElements

  return (
    <>
      <div className="mx-auto max-w-[1180px] rounded-[12px] bg-white">
        <section className="overflow-hidden rounded-[12px] border border-[#ebebeb] bg-white shadow-[0_6px_20px_rgba(17,24,39,0.04)]">
          <div className="border-b border-[#f0f0f0] bg-white p-4 md:p-5">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a8a8a]" />
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(event) => setKeywordInput(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-12 w-full rounded-[10px] border border-[#ebebeb] bg-white pl-12 pr-4 text-[15px] text-[#292929] outline-none transition placeholder:text-[#a3a3a3] focus:border-[#d6d6d6]"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-[10px] border border-[#ebebeb] bg-[#f5f5f5] px-6 text-sm font-semibold text-[#292929] transition hover:bg-[#efefef]"
                >
                  Tìm kiếm
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative" ref={scopeMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowScopeMenu((previous) => !previous)}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-transparent bg-[#f5f5f5] px-4 text-sm font-medium text-[#292929] transition hover:bg-[#efefef]"
                  >
                    <span className="text-[#737373]">Nơi khám:</span>
                    <span>{getScopeLabel(scope)}</span>
                    <ChevronDown className={`h-4 w-4 text-[#737373] transition ${showScopeMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showScopeMenu && (
                    <div className="absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-[10px] border border-[#ebebeb] bg-white shadow-[0_14px_32px_rgba(17,24,39,0.08)]">
                      {SCOPE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleScopeChange(option.value)}
                          className={`flex w-full items-center justify-between border-b border-[#f3f3f3] px-4 py-3 text-left text-sm last:border-b-0 ${
                            scope === option.value
                              ? 'bg-[#eef9f7] font-semibold text-[#1c7f72]'
                              : 'text-[#292929] hover:bg-[#fafafa]'
                          }`}
                        >
                          <span>{option.label}</span>
                          {scope === option.value && <span className="text-xs uppercase tracking-[0.18em]">Chọn</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!isFacilityScope && (
                  <div className="relative" ref={bookingTypeMenuRef}>
                    <button
                      type="button"
                      onClick={() => setShowBookingTypeMenu((previous) => !previous)}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-transparent bg-[#f5f5f5] px-4 text-sm font-medium text-[#292929] transition hover:bg-[#efefef]"
                    >
                      <span className="text-[#737373]">Loại hình khám:</span>
                      <span>{getBookingTypeLabel(bookingType)}</span>
                      <ChevronDown className={`h-4 w-4 text-[#737373] transition ${showBookingTypeMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showBookingTypeMenu && (
                      <div className="absolute left-0 top-full z-20 mt-2 w-60 overflow-hidden rounded-[10px] border border-[#ebebeb] bg-white shadow-[0_14px_32px_rgba(17,24,39,0.08)]">
                        {BOOKING_TYPE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleBookingTypeChange(option.value)}
                            className={`flex w-full items-center justify-between border-b border-[#f3f3f3] px-4 py-3 text-left text-sm last:border-b-0 ${
                              bookingType === option.value
                                ? 'bg-[#eef9f7] font-semibold text-[#1c7f72]'
                                : 'text-[#292929] hover:bg-[#fafafa]'
                            }`}
                          >
                            <span>{option.label}</span>
                            {bookingType === option.value && <span className="text-xs uppercase tracking-[0.18em]">Chọn</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={openSpecializationPopup}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-transparent bg-[#f5f5f5] px-4 text-sm font-medium text-[#292929] transition hover:bg-[#efefef]"
                >
                  <Building2 className="h-4 w-4 text-[#737373]" />
                  <span>{specialization || 'Chọn chuyên khoa'}</span>
                </button>

                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-transparent bg-[#f5f5f5] px-4 text-sm font-medium text-[#9a9a9a]"
                >
                  Khu vực
                </button>

                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-transparent bg-[#f5f5f5] px-4 text-sm font-medium text-[#9a9a9a]"
                >
                  Gần nhất
                </button>
              </div>
            </form>
          </div>

          <div className="p-4 md:p-6">
            <div className="mb-5 flex flex-col gap-3 border-b border-[#f0f0f0] pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                {isFacilityScope ? (
                  <>
                    <h1 className="mt-2 text-2xl font-semibold text-[#333333]">
                      {getFacilityScopeTitle(scope)}
                    </h1>
                    <p className="mt-3 text-sm font-semibold text-[#292929]">
                      {resultCount} cơ sở phù hợp
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="mt-2 text-2xl font-semibold text-[#333333]">
                      {loading ? 'Đang tải kết quả...' : `Tìm thấy ${resultCount} kết quả.`}
                    </h1>
                  </>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 self-start rounded-full bg-[#f5f5f5] px-4 py-2 text-sm font-semibold text-[#292929] transition hover:bg-[#efefef]"
                >
                  <X className="h-4 w-4" />
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-16">
                <Loading />
              </div>
            ) : isFacilityScope ? (
              facilityResults.length > 0 ? (
                <div className="space-y-4">
                  {facilityResults.map((facility, index) => (
                    <motion.article
                      key={facility.id || facility.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="overflow-hidden rounded-[8px] border border-[#ebebeb] bg-white shadow-none"
                    >
                      <div className="flex flex-col">
                        <div className="flex flex-1 flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex flex-1 gap-4">
                            <img
                              src={facility.logo}
                              alt={facility.name}
                              className="h-20 w-20 shrink-0 rounded-2xl border border-[#ebebeb] object-cover"
                              onError={(event) => {
                                event.currentTarget.onerror = null
                                event.currentTarget.src = FACILITY_CARD_FALLBACK_IMAGE
                              }}
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border border-[#f0f0f0] bg-[#f5f5f5] px-3 py-1 text-sm text-[#292929]">
                                  {scope === 'hospital' ? 'Bệnh viện' : 'Phòng khám'}
                                </span>
                                <span className="rounded-full border border-[#f0f0f0] bg-[#f5f5f5] px-3 py-1 text-sm text-[#292929]">
                                  {facility.specialty}
                                </span>
                              </div>

                              <h2 className="mt-3 text-xl font-semibold leading-8 text-[#292929]">
                                {facility.name}
                              </h2>

                              <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#616161]">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8a8a8a]" />
                                <span>{facility.address}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex w-full flex-col gap-3 lg:w-[220px]">
                            <button
                              type="button"
                              onClick={() => handleOpenFacility(facility)}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#d8eeea] bg-[#eef9f7] px-4 text-sm font-semibold text-[#1c7f72] transition hover:bg-[#e4f5f1]"
                            >
                              <CalendarPlus className="h-4 w-4" />
                              Đặt lịch tại đây
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[8px] border border-dashed border-[#ebebeb] bg-[#fafafa] px-6 py-16 text-center">
                  <Search className="mx-auto h-12 w-12 text-[#b0b0b0]" />
                  <h2 className="mt-4 text-lg font-semibold text-[#333333]">
                    Không tìm thấy {scope === 'hospital' ? 'bệnh viện' : 'phòng khám'} phù hợp
                  </h2>
                  <p className="mt-2 text-sm text-[#737373]">
                    Hãy thử đổi từ khóa hoặc chọn chuyên khoa khác.
                  </p>
                </div>
              )
            ) : doctors.length > 0 ? (
              <>
                <div className="space-y-4">
                  {doctors.map((doctor, index) => (
                    <motion.article
                      key={doctor.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="rounded-[8px] border border-[#ebebeb] bg-white p-4 shadow-none"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-1 gap-4">
                          <Avatar
                            src={doctor.avatarUrl}
                            name={doctor.fullName}
                            size="xl"
                            shape="square"
                            className="shrink-0"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-lg font-semibold leading-7 text-[#292929]">
                                {formatDoctorName(doctor.fullName)}
                              </h2>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full border border-[#f0f0f0] bg-[#f5f5f5] px-3 py-1 text-sm text-[#292929]">
                                {doctor.specialization || 'Đa khoa'}
                              </span>
                              <span className="rounded-full border border-[#f0f0f0] bg-[#f5f5f5] px-3 py-1 text-sm text-[#292929]">
                                {doctor.title || doctor.position || 'Bác sĩ chuyên khoa'}
                              </span>
                              {doctor.experienceYears ? (
                                <span className="rounded-full border border-[#f0f0f0] bg-[#f5f5f5] px-3 py-1 text-sm text-[#292929]">
                                  {doctor.experienceYears} năm kinh nghiệm
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#616161]">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8a8a8a]" />
                              <span>{getDoctorAddress(doctor)}</span>
                            </div>

                            <div className="mt-4 text-sm text-[#8a8a8a]">
                              <span className="font-semibold text-[#292929]">
                                {bookingType === 'consultation'
                                  ? `Phí tư vấn: ${formatCurrency(CONSULTATION_BOOKING_FEE)}`
                                  : 'Phí khám: Liên hệ'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 lg:w-[220px]">
                          {bookingType !== 'consultation' && doctorSupportsAppointment(doctor) && (
                            <button
                              type="button"
                              onClick={() => handleBookDoctor(doctor.id)}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#ebebeb] bg-[#f5f5f5] px-4 text-sm font-semibold text-[#292929] transition hover:bg-[#efefef]"
                            >
                              <CalendarPlus className="h-4 w-4" />
                              Đặt lịch khám
                            </button>
                          )}
                          {bookingType !== 'appointment' && doctorSupportsConsultation(doctor) && (
                            <button
                              type="button"
                              onClick={() => handleConsultDoctor(doctor.id)}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#d8eeea] bg-[#eef9f7] px-4 text-sm font-semibold text-[#1c7f72] transition hover:bg-[#e4f5f1]"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Đặt lịch tư vấn
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>

                {renderPagination()}
              </>
            ) : (
              <div className="rounded-[8px] border border-dashed border-[#ebebeb] bg-[#fafafa] px-6 py-16 text-center">
                <Search className="mx-auto h-12 w-12 text-[#b0b0b0]" />
                <h2 className="mt-4 text-lg font-semibold text-[#333333]">
                  Không tìm thấy bác sĩ phù hợp
                </h2>
                <p className="mt-2 text-sm text-[#737373]">
                  Hãy thử đổi từ khóa hoặc chọn chuyên khoa khác.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {showSpecializationPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8">
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-[12px] border border-[#ebebeb] bg-white shadow-[0_20px_44px_rgba(17,24,39,0.12)]">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold text-[#333333]">Tìm theo chuyên khoa</h2>
                <p className="mt-1 text-sm text-[#737373]">Chọn chuyên khoa để lọc kết quả giống mẫu YouMed.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSpecializationPopup(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ebebeb] bg-white text-[#737373] transition hover:bg-[#f5f5f5] hover:text-[#292929]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-[#f0f0f0] px-5 py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a8a8a]" />
                <input
                  type="text"
                  value={specializationQuery}
                  onChange={(event) => setSpecializationQuery(event.target.value)}
                  placeholder="Tìm theo tên"
                  className="h-12 w-full rounded-[10px] border border-[#ebebeb] bg-white pl-12 pr-4 text-[15px] text-[#292929] outline-none transition placeholder:text-[#a3a3a3] focus:border-[#d6d6d6]"
                />
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              <div className="grid gap-3 md:grid-cols-2">
                {filteredSpecializations.map((item) => {
                  const selected = specializationDraft === item

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSpecializationDraft(item)}
                      className={`rounded-[8px] border px-4 py-3 text-left transition ${
                        selected
                          ? 'border-[#d8eeea] bg-[#eef9f7]'
                          : 'border-[#ebebeb] bg-white hover:bg-[#fafafa]'
                      }`}
                    >
                      <div className="text-sm font-semibold text-[#292929]">{item}</div>
                    </button>
                  )
                })}
              </div>

              {!filteredSpecializations.length && (
                <div className="rounded-[8px] border border-dashed border-[#ebebeb] bg-[#fafafa] px-4 py-10 text-center text-sm text-[#737373]">
                  Không tìm thấy chuyên khoa phù hợp.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#f0f0f0] px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setSpecializationDraft('')
                  setSpecializationQuery('')
                }}
                className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#ebebeb] bg-white px-4 text-sm font-semibold text-[#292929] transition hover:bg-[#f5f5f5]"
              >
                Xóa bộ lọc
              </button>
              <button
                type="button"
                onClick={applySpecialization}
                className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#d8eeea] bg-[#eef9f7] px-5 text-sm font-semibold text-[#1c7f72] transition hover:bg-[#e4f5f1]"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
