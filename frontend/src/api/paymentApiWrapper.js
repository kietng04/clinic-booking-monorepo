import { paymentApi as realPaymentApi } from './realApis/paymentApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

// Mock payment history data
const mockPayments = [
  {
    id: '1',
    appointmentId: 'APT001',
    patientId: '1',
    amount: 500000,
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
    finalAmount: 200000,
    currency: 'VND',
    method: 'VNPay',
    status: 'Success',
    description: 'Khám sức khỏe tổng quát - BS. Trần Thị B',
    createdAt: '2026-01-20T14:00:00',
    paidAt: '2026-01-20T14:01:30',
    invoiceNumber: 'INV-2026-002',
  },
  {
    id: '3',
    appointmentId: 'APT003',
    patientId: '1',
    amount: 350000,
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
    finalAmount: 600000,
    currency: 'VND',
    method: 'Momo',
    status: 'Failed',
    description: 'Khám tim mạch chuyên sâu - BS. Phạm Thị D',
    createdAt: '2026-01-10T11:00:00',
    invoiceNumber: 'INV-2026-005',
    failureReason: 'Insufficient balance',
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
      finalAmount: 500000,
      currency: 'VND',
      method: 'Momo',
      transactionId: `TXN-${Date.now()}`,
      paidAt: new Date().toISOString(),
      appointmentId: 'APT-NEW',
      description: 'Thanh toán lịch hẹn khám bệnh',
    }
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
