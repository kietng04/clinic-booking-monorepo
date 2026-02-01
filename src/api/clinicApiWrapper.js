import { clinicApi as realClinicApi } from './realApis/clinicApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

// Mock data for development
const mockClinics = [
  {
    id: '1',
    name: 'Phòng khám Đa khoa Trung tâm',
    address: '123 Đường Đinh Tiên Hoàng, Quận 1, TP.HCM',
    phone: '028-1234-5678',
    email: 'center@clinic.com',
    description: 'Phòng khám đa khoa hàng đầu với đội ngũ bác sĩ giàu kinh nghiệm',
    openingHours: {
      mon: '08:00-17:00',
      tue: '08:00-17:00',
      wed: '08:00-17:00',
      thu: '08:00-17:00',
      fri: '08:00-17:00',
      sat: '08:00-12:00',
      sun: 'Closed',
    },
    rating: 4.8,
    servicesCount: 15,
    doctorsCount: 12,
    distance: '2.5 km',
    active: true,
  },
  {
    id: '2',
    name: 'Chi nhánh Quận 3',
    address: '456 Đường Trần Phú, Quận 3, TP.HCM',
    phone: '028-8765-4321',
    email: 'q3@clinic.com',
    description: 'Chi nhánh hiện đại với trang thiết bị y tế tiên tiến',
    openingHours: {
      mon: '08:00-17:00',
      tue: '08:00-17:00',
      wed: '08:00-17:00',
      thu: '08:00-17:00',
      fri: '08:00-17:00',
      sat: '08:00-12:00',
      sun: 'Closed',
    },
    rating: 4.6,
    servicesCount: 10,
    doctorsCount: 8,
    distance: '5.1 km',
    active: true,
  },
  {
    id: '3',
    name: 'Chi nhánh Bình Thạnh',
    address: '789 Đường Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM',
    phone: '028-1111-2222',
    email: 'bt@clinic.com',
    description: 'Phòng khám chuyên khoa tim mạch và nội tiết',
    openingHours: {
      mon: '08:00-17:00',
      tue: '08:00-17:00',
      wed: '08:00-17:00',
      thu: '08:00-17:00',
      fri: '08:00-17:00',
      sat: '08:00-12:00',
      sun: 'Closed',
    },
    rating: 4.7,
    servicesCount: 8,
    doctorsCount: 6,
    distance: '7.3 km',
    active: true,
  },
]

const mockServices = [
  {
    id: '1',
    clinicId: '1',
    name: 'Khám sức khỏe tổng quát',
    description: 'Khám toàn diện bao gồm xét nghiệm máu, đo huyết áp, kiểm tra sức khỏe',
    category: 'General',
    duration: 45,
    price: 200000,
    currency: 'VND',
    active: true,
  },
  {
    id: '2',
    clinicId: '1',
    name: 'Tư vấn tim mạch',
    description: 'Tư vấn chuyên sâu về các vấn đề tim mạch',
    category: 'Specialist',
    duration: 60,
    price: 500000,
    currency: 'VND',
    active: true,
  },
  {
    id: '3',
    clinicId: '1',
    name: 'Xét nghiệm máu toàn phần',
    description: 'Xét nghiệm máu bao gồm các chỉ số cơ bản',
    category: 'Lab',
    duration: 30,
    price: 350000,
    currency: 'VND',
    active: true,
  },
  {
    id: '4',
    clinicId: '1',
    name: 'Chụp X-quang',
    description: 'Chụp X-quang ngực, xương',
    category: 'Imaging',
    duration: 20,
    price: 150000,
    currency: 'VND',
    active: true,
  },
  {
    id: '5',
    clinicId: '2',
    name: 'Khám nội tổng quát',
    description: 'Khám và tư vấn về các bệnh nội khoa',
    category: 'General',
    duration: 45,
    price: 180000,
    currency: 'VND',
    active: true,
  },
  {
    id: '6',
    clinicId: '2',
    name: 'Siêu âm ổ bụng',
    description: 'Siêu âm ổ bụng tổng quát',
    category: 'Imaging',
    duration: 40,
    price: 250000,
    currency: 'VND',
    active: true,
  },
  {
    id: '7',
    clinicId: '3',
    name: 'Khám tim mạch chuyên sâu',
    description: 'Khám tim mạch với điện tâm đồ',
    category: 'Specialist',
    duration: 60,
    price: 600000,
    currency: 'VND',
    active: true,
  },
  {
    id: '8',
    clinicId: '3',
    name: 'Tư vấn nội tiết',
    description: 'Tư vấn về tiểu đường, tuyến giáp',
    category: 'Specialist',
    duration: 45,
    price: 450000,
    currency: 'VND',
    active: true,
  },
]

const mockClinicApi = {
  getClinics: async (filters = {}) => {
    await new Promise((r) => setTimeout(r, 500))
    let clinics = [...mockClinics]

    if (filters.active !== undefined) {
      clinics = clinics.filter((c) => c.active === filters.active)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      clinics = clinics.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.address.toLowerCase().includes(search)
      )
    }

    return clinics
  },

  getClinicById: async (id) => {
    await new Promise((r) => setTimeout(r, 300))
    const clinic = mockClinics.find((c) => c.id === id)
    if (!clinic) throw new Error('Clinic not found')
    return clinic
  },

  getClinicServices: async (clinicId, filters = {}) => {
    await new Promise((r) => setTimeout(r, 500))
    let services = mockServices.filter((s) => s.clinicId === clinicId)

    if (filters.category) {
      services = services.filter((s) => s.category === filters.category)
    }

    if (filters.active !== undefined) {
      services = services.filter((s) => s.active === filters.active)
    }

    return services
  },

  getClinicRooms: async (clinicId) => {
    await new Promise((r) => setTimeout(r, 300))
    // Mock rooms data
    return [
      {
        id: '1',
        clinicId,
        name: 'Phòng khám 101',
        roomNumber: '101',
        type: 'Consultation',
        capacity: 3,
        active: true,
      },
      {
        id: '2',
        clinicId,
        name: 'Phòng xét nghiệm',
        roomNumber: '102',
        type: 'Lab',
        capacity: 5,
        active: true,
      },
    ]
  },
}

export const clinicApi = USE_MOCK_BACKEND ? mockClinicApi : realClinicApi
export default clinicApi
