import { adminApi as realAdminApi } from './realApis/adminApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

// Mock implementations for development
const mockAdminApi = {
  getClinics: async () => {
    await new Promise(r => setTimeout(r, 500))
    return [
      { id: '1', name: 'Phòng khám Trung tâm', address: '123 Đường Đinh Tiên Hoàng, Q1, TP.HCM', phone: '028-1234-5678', email: 'center@clinic.com', active: true, servicesCount: 12, doctorsCount: 8, roomsCount: 5 },
      { id: '2', name: 'Chi nhánh Quận 3', address: '456 Đường Trần Phú, Q3, TP.HCM', phone: '028-8765-4321', email: 'q3@clinic.com', active: true, servicesCount: 8, doctorsCount: 5, roomsCount: 3 },
      { id: '3', name: 'Chi nhánh Bình Thạnh', address: '789 Đường Đinh Tiên Hoàng, BT, TP.HCM', phone: '028-1111-2222', email: 'bt@clinic.com', active: false, servicesCount: 6, doctorsCount: 4, roomsCount: 2 },
    ]
  },
  createClinic: async (data) => { await new Promise(r => setTimeout(r, 800)); return { id: Date.now().toString(), ...data, active: true, servicesCount: 0, doctorsCount: 0, roomsCount: 0 } },
  updateClinic: async (id, data) => { await new Promise(r => setTimeout(r, 800)); return { id, ...data } },
  toggleClinic: async () => { await new Promise(r => setTimeout(r, 500)); return { success: true } },

  getServices: async () => {
    await new Promise(r => setTimeout(r, 500))
    return [
      { id: '1', name: 'Khám sức khỏe tổng quát', clinicId: '1', clinicName: 'Phòng khám Trung tâm', category: 'General', duration: 45, basePrice: 200000, active: true },
      { id: '2', name: 'Xét nghiệm máu toàn phần', clinicId: '1', clinicName: 'Phòng khám Trung tâm', category: 'Lab', duration: 30, basePrice: 350000, active: true },
      { id: '3', name: 'Tư vấn tim mạch', clinicId: '2', clinicName: 'Chi nhánh Quận 3', category: 'Specialist', duration: 60, basePrice: 500000, active: true },
      { id: '4', name: 'Chụp X-quang ngực', clinicId: '1', clinicName: 'Phòng khám Trung tâm', category: 'Imaging', duration: 20, basePrice: 150000, active: true },
      { id: '5', name: 'Điều trị da liễu', clinicId: '2', clinicName: 'Chi nhánh Quận 3', category: 'Specialist', duration: 30, basePrice: 300000, active: false },
      { id: '6', name: 'Siêu âm ổ bụng', clinicId: '3', clinicName: 'Chi nhánh Bình Thạnh', category: 'Imaging', duration: 40, basePrice: 250000, active: true },
    ]
  },
  createService: async (data) => { await new Promise(r => setTimeout(r, 800)); return { id: Date.now().toString(), ...data } },
  updateService: async (id, data) => { await new Promise(r => setTimeout(r, 800)); return { id, ...data } },

  getAllRooms: async () => {
    await new Promise(r => setTimeout(r, 500))
    return [
      { id: '1', name: 'Phòng tư vấn A', roomNumber: '101', clinicId: '1', clinicName: 'Phòng khám Trung tâm', type: 'Consultation', capacity: 3, active: true },
      { id: '2', name: 'Phòng xét nghiệm', roomNumber: '102', clinicId: '1', clinicName: 'Phòng khám Trung tâm', type: 'Lab', capacity: 5, active: true },
      { id: '3', name: 'Phòng hình ảnh', roomNumber: '201', clinicId: '2', clinicName: 'Chi nhánh Quận 3', type: 'Imaging', capacity: 2, active: true },
      { id: '4', name: 'Phòng thủ thuật B', roomNumber: '202', clinicId: '1', clinicName: 'Phòng khám Trung tâm', type: 'Procedure', capacity: 4, active: false },
    ]
  },
  getRooms: async (clinicId) => {
    const all = await mockAdminApi.getAllRooms()
    return all.filter(r => r.clinicId === clinicId)
  },
  createRoom: async (data) => { await new Promise(r => setTimeout(r, 800)); return { id: Date.now().toString(), ...data } },
  updateRoom: async (id, data) => { await new Promise(r => setTimeout(r, 800)); return { id, ...data } },

  getAppointmentReport: async () => { throw new Error('Use mock') },
  getRevenueReport: async () => { throw new Error('Use mock') },
  getPatientReport: async () => { throw new Error('Use mock') },
  exportReport: async () => { throw new Error('Not implemented') },

  getVouchers: async () => {
    await new Promise(r => setTimeout(r, 500))
    return [
      { id: '1', code: 'SUMMER20', description: 'Giảm 20% hè 2024', type: 'Percentage', value: 20, minOrderAmount: 100000, maxDiscount: 200000, usageLimit: 500, usedCount: 123, validFrom: '2024-06-01', validTo: '2024-09-01', active: true },
      { id: '2', code: 'NEW50K', description: 'Giảm 50K cho khách mới', type: 'Fixed', value: 50000, minOrderAmount: 150000, maxDiscount: 0, usageLimit: 1000, usedCount: 456, validFrom: '2024-01-01', validTo: '2024-12-31', active: true },
      { id: '3', code: 'PROMO10', description: 'Khuyến mãi 10% mới nhất', type: 'Percentage', value: 10, minOrderAmount: 0, maxDiscount: 100000, usageLimit: 200, usedCount: 89, validFrom: '2024-03-01', validTo: '2024-06-30', active: false },
    ]
  },
  createVoucher: async (data) => { await new Promise(r => setTimeout(r, 800)); return { id: Date.now().toString(), ...data, usedCount: 0, active: true } },
  updateVoucher: async (id, data) => { await new Promise(r => setTimeout(r, 800)); return { id, ...data } },
  getVoucherStats: async () => { await new Promise(r => setTimeout(r, 500)); return { totalUsed: 668, totalDiscount: 45000000 } },
}

const api = USE_MOCK_BACKEND ? mockAdminApi : realAdminApi

export const adminApi = {
  getClinics: (filters) => api.getClinics(filters),
  createClinic: (data) => api.createClinic(data),
  updateClinic: (id, data) => api.updateClinic(id, data),
  toggleClinic: (id) => api.toggleClinic(id),

  getServices: (filters) => api.getServices(filters),
  createService: (data) => api.createService(data),
  updateService: (id, data) => api.updateService(id, data),

  getAllRooms: (filters) => api.getAllRooms(filters),
  getRooms: (clinicId) => api.getRooms(clinicId),
  createRoom: (data) => api.createRoom(data),
  updateRoom: (id, data) => api.updateRoom(id, data),

  getAppointmentReport: (params) => api.getAppointmentReport(params),
  getRevenueReport: (params) => api.getRevenueReport(params),
  getPatientReport: (params) => api.getPatientReport(params),
  exportReport: (type, params) => api.exportReport(type, params),

  getVouchers: (filters) => api.getVouchers(filters),
  createVoucher: (data) => api.createVoucher(data),
  updateVoucher: (id, data) => api.updateVoucher(id, data),
  getVoucherStats: (id) => api.getVoucherStats(id),
}

console.log(`🏥 Admin Backend: ${USE_MOCK_BACKEND ? 'MOCK (Demo Mode)' : 'REAL (Production)'}`)

export default adminApi
