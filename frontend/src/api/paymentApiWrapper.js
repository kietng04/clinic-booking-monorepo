import { paymentApi as realPaymentApi } from './realApis/paymentApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

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
    description: 'TÆ° váº¥n tim máº¡ch - BS. Nguyá»…n VÄƒn A',
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
    description: 'KhÃ¡m sá»©c khá»e tá»•ng quÃ¡t - BS. Tráº§n Thá»‹ B',
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
    description: 'XÃ©t nghiá»‡m mÃ¡u toÃ n pháº§n',
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
    description: 'TÆ° váº¥n ná»™i tiáº¿t - BS. LÃª VÄƒn C',
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
    description: 'KhÃ¡m tim máº¡ch chuyÃªn sÃ¢u - BS. Pháº¡m Thá»‹ D',
    createdAt: '2026-01-10T11:00:00',
    invoiceNumber: 'INV-2026-005',
    failureReason: 'Insufficient balance',
  },
]

const mockPaymentApi = {
  createPayment: async (data) => {
    await new Promise((r) => setTimeout(r, 1000))

    const orderId = `PAY-${Date.now()}`
    const mockPaymentUrl = `/payment/result?orderId=${orderId}&status=success`

    return {
      orderId,
      paymentId: orderId,
      status: 'PENDING',
      resourceType: data.resourceType || (data.appointmentId ? 'APPOINTMENT' : undefined),
      resourceId: data.resourceId || data.appointmentId,
      payUrl: mockPaymentUrl,
      redirectUrl: mockPaymentUrl,
      qrCode: data.method === 'Momo' || data.method === 'VNPay' ? 'mock-qr-code-url' : null,
    }
  },

  getPaymentHistory: async (patientId, filters = {}) => {
    await new Promise((r) => setTimeout(r, 500))

    let payments = [...mockPayments].filter((p) => p.patientId === patientId)

    if (filters.status) {
      payments = payments.filter((p) => p.status === filters.status)
    }

    if (filters.method) {
      payments = payments.filter((p) => p.method === filters.method)
    }

    if (filters.fromDate) {
      payments = payments.filter((p) => new Date(p.createdAt) >= new Date(filters.fromDate))
    }

    if (filters.toDate) {
      payments = payments.filter((p) => new Date(p.createdAt) <= new Date(filters.toDate))
    }

    payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return payments
  },

  getPaymentResult: async (paymentId) => {
    await new Promise((r) => setTimeout(r, 300))

    return {
      id: paymentId,
      orderId: paymentId,
      status: 'COMPLETED',
      amount: 500000,
      finalAmount: 500000,
      currency: 'VND',
      paymentMethod: 'MOMO_WALLET',
      transactionId: `TXN-${Date.now()}`,
      completedAt: new Date().toISOString(),
      appointmentId: 'APT-NEW',
      resourceType: 'APPOINTMENT',
      resourceId: 'APT-NEW',
      description: 'Thanh toÃ¡n lá»‹ch háº¹n khÃ¡m bá»‡nh',
    }
  },

  queryPaymentStatus: async (orderId) => {
    return mockPaymentApi.getPaymentResult(orderId)
  },

  getPaymentByAppointment: async (appointmentId) => {
    await new Promise((r) => setTimeout(r, 300))
    const record = mockPayments.find((p) => String(p.appointmentId) === String(appointmentId))
    if (!record) {
      throw new Error('Payment not found')
    }
    const status = (record.status || '').toString().toUpperCase()
    const normalizedStatus = status === 'SUCCESS' ? 'COMPLETED' : status
    return {
      orderId: record.id || `PAY-${appointmentId}`,
      appointmentId: record.appointmentId,
      resourceType: 'APPOINTMENT',
      resourceId: record.appointmentId,
      amount: record.amount,
      finalAmount: record.finalAmount,
      status: normalizedStatus,
      paymentMethod: record.paymentMethod || record.method,
      payUrl: `/payment/result?orderId=${record.id || `PAY-${appointmentId}`}`,
      createdAt: record.createdAt,
    }
  },

  getPaymentByResource: async (resourceType, resourceId) => {
    if ((resourceType || '').toUpperCase() === 'APPOINTMENT') {
      return mockPaymentApi.getPaymentByAppointment(resourceId)
    }

    await new Promise((r) => setTimeout(r, 300))
    return {
      orderId: `PAY-${resourceType}-${resourceId}`,
      resourceType: (resourceType || '').toUpperCase(),
      resourceId,
      amount: 200000,
      finalAmount: 200000,
      status: 'PENDING',
      paymentMethod: 'MOMO_WALLET',
      payUrl: `/payment/result?orderId=PAY-${resourceType}-${resourceId}`,
      createdAt: new Date().toISOString(),
    }
  },

  downloadReceipt: async () => {
    await new Promise((r) => setTimeout(r, 500))
    return new Blob(['Mock receipt PDF content'], { type: 'application/pdf' })
  },

  exportHistory: async () => {
    await new Promise((r) => setTimeout(r, 500))

    const csv = mockPayments
      .map(
        (p) =>
          `${p.invoiceNumber},${p.createdAt},${p.description},${p.amount},${p.method},${p.status}`
      )
      .join('\n')

    return new Blob([`Invoice,Date,Description,Amount,Method,Status\n${csv}`], {
      type: 'text/csv',
    })
  },
}

export const paymentApi = USE_MOCK_BACKEND ? mockPaymentApi : realPaymentApi
export default paymentApi
