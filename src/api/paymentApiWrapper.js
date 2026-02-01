import { paymentApi as realPaymentApi } from './realApis/paymentApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

// Mock payment history data
const mockPayments = [
  {
    id: '1',
    appointmentId: 'APT001',
    patientId: '1',
    amount: 500000,
    discount: 0,
    finalAmount: 500000,
    currency: 'VND',
    method: 'Momo',
    status: 'Success',
    description: 'Tư vấn tim mạch - BS. Nguyễn Văn A',
    createdAt: '2026-01-25T10:30:00',
    paidAt: '2026-01-25T10:31:15',
    invoiceNumber: 'INV-2026-001',
  },
  {
    id: '2',
    appointmentId: 'APT002',
    patientId: '1',
    amount: 200000,
    discount: 20000,
    finalAmount: 180000,
    currency: 'VND',
    method: 'VNPay',
    status: 'Success',
    description: 'Khám sức khỏe tổng quát - BS. Trần Thị B',
    createdAt: '2026-01-20T14:00:00',
    paidAt: '2026-01-20T14:01:30',
    invoiceNumber: 'INV-2026-002',
    voucherCode: 'HEALTH20',
  },
  {
    id: '3',
    appointmentId: 'APT003',
    patientId: '1',
    amount: 350000,
    discount: 0,
    finalAmount: 350000,
    currency: 'VND',
    method: 'Cash',
    status: 'Success',
    description: 'Xét nghiệm máu toàn phần',
    createdAt: '2026-01-15T09:00:00',
    paidAt: '2026-01-15T11:20:00',
    invoiceNumber: 'INV-2026-003',
  },
  {
    id: '4',
    appointmentId: 'APT004',
    patientId: '1',
    amount: 450000,
    discount: 0,
    finalAmount: 450000,
    currency: 'VND',
    method: 'ZaloPay',
    status: 'Pending',
    description: 'Tư vấn nội tiết - BS. Lê Văn C',
    createdAt: '2026-01-28T16:45:00',
    invoiceNumber: 'INV-2026-004',
  },
  {
    id: '5',
    appointmentId: 'APT005',
    patientId: '1',
    amount: 600000,
    discount: 60000,
    finalAmount: 540000,
    currency: 'VND',
    method: 'Momo',
    status: 'Failed',
    description: 'Khám tim mạch chuyên sâu - BS. Phạm Thị D',
    createdAt: '2026-01-10T11:00:00',
    invoiceNumber: 'INV-2026-005',
    voucherCode: 'SAVE10',
    failureReason: 'Insufficient balance',
  },
]

const mockVouchers = [
  {
    code: 'HEALTH20',
    type: 'Percentage',
    value: 10,
    minOrderAmount: 150000,
    maxDiscount: 50000,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    usageLimit: 100,
    usageCount: 15,
    active: true,
  },
  {
    code: 'SAVE10',
    type: 'Percentage',
    value: 10,
    minOrderAmount: 500000,
    maxDiscount: 100000,
    validFrom: '2026-01-01',
    validTo: '2026-06-30',
    usageLimit: 50,
    usageCount: 20,
    active: true,
  },
  {
    code: 'FIRST50',
    type: 'Fixed',
    value: 50000,
    minOrderAmount: 200000,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    usageLimit: 1000,
    usageCount: 450,
    active: true,
  },
]

const mockPaymentApi = {
  createPayment: async (data) => {
    await new Promise((r) => setTimeout(r, 1000))

    // Simulate payment gateway redirect
    const paymentId = `PAY-${Date.now()}`
    const mockPaymentUrl = `/payment/result?paymentId=${paymentId}&status=success`

    return {
      paymentId,
      status: 'Pending',
      redirectUrl: mockPaymentUrl,
      qrCode: data.method === 'Momo' || data.method === 'VNPay' ? 'mock-qr-code-url' : null,
    }
  },

  getPaymentHistory: async (patientId, filters = {}) => {
    await new Promise((r) => setTimeout(r, 500))

    let payments = [...mockPayments].filter((p) => p.patientId === patientId)

    // Filter by status
    if (filters.status) {
      payments = payments.filter((p) => p.status === filters.status)
    }

    // Filter by method
    if (filters.method) {
      payments = payments.filter((p) => p.method === filters.method)
    }

    // Filter by date range
    if (filters.fromDate) {
      payments = payments.filter((p) => new Date(p.createdAt) >= new Date(filters.fromDate))
    }

    if (filters.toDate) {
      payments = payments.filter((p) => new Date(p.createdAt) <= new Date(filters.toDate))
    }

    // Sort by date descending
    payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return payments
  },

  getPaymentResult: async (paymentId) => {
    await new Promise((r) => setTimeout(r, 300))

    // Simulate successful payment result
    return {
      id: paymentId,
      status: 'Success',
      amount: 500000,
      finalAmount: 450000,
      discount: 50000,
      currency: 'VND',
      method: 'Momo',
      transactionId: `TXN-${Date.now()}`,
      paidAt: new Date().toISOString(),
      appointmentId: 'APT-NEW',
      description: 'Thanh toán lịch hẹn khám bệnh',
    }
  },

  validateVoucher: async (code, amount) => {
    await new Promise((r) => setTimeout(r, 500))

    const voucher = mockVouchers.find((v) => v.code === code)

    if (!voucher) {
      throw new Error('Mã voucher không tồn tại')
    }

    if (!voucher.active) {
      throw new Error('Mã voucher đã hết hạn')
    }

    const now = new Date()
    const validFrom = new Date(voucher.validFrom)
    const validTo = new Date(voucher.validTo)

    if (now < validFrom || now > validTo) {
      throw new Error('Mã voucher không trong thời gian hiệu lực')
    }

    if (amount < voucher.minOrderAmount) {
      throw new Error(`Đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString('vi-VN')} VND`)
    }

    if (voucher.usageCount >= voucher.usageLimit) {
      throw new Error('Mã voucher đã hết lượt sử dụng')
    }

    // Calculate discount
    let discount = 0
    if (voucher.type === 'Percentage') {
      discount = Math.floor((amount * voucher.value) / 100)
      if (voucher.maxDiscount) {
        discount = Math.min(discount, voucher.maxDiscount)
      }
    } else {
      discount = voucher.value
    }

    return {
      valid: true,
      voucher: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
      },
      discount,
      finalAmount: amount - discount,
    }
  },

  applyVoucher: async (appointmentId, code) => {
    // Reuse validation logic
    const amount = 500000 // Mock amount
    return await mockPaymentApi.validateVoucher(code, amount)
  },

  downloadReceipt: async (paymentId) => {
    await new Promise((r) => setTimeout(r, 500))

    // Create mock PDF blob
    const blob = new Blob(['Mock receipt PDF content'], { type: 'application/pdf' })
    return blob
  },

  exportHistory: async (patientId, filters = {}) => {
    await new Promise((r) => setTimeout(r, 500))

    // Create mock CSV blob
    const csv = mockPayments
      .map(
        (p) =>
          `${p.invoiceNumber},${p.createdAt},${p.description},${p.amount},${p.method},${p.status}`
      )
      .join('\n')

    const blob = new Blob([`Invoice,Date,Description,Amount,Method,Status\n${csv}`], {
      type: 'text/csv',
    })
    return blob
  },
}

export const paymentApi = USE_MOCK_BACKEND ? mockPaymentApi : realPaymentApi
export default paymentApi
