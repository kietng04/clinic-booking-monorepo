import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CreditCard,
  Download,
  FileText,
  Filter,
  Inbox,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { Select } from '@/components/ui/Select'
import { paymentApi } from '@/api/paymentApiWrapper'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { loadAllPaymentBookingSummaries } from '@/utils/paymentBookingSummary'

const primaryButtonClass =
  '!rounded-[6px] border-[#0f4f2a] bg-[#0f4f2a] px-5 py-3 text-base font-semibold text-white shadow-none hover:bg-[#0b3f21]'
const secondaryButtonClass =
  '!rounded-[6px] border-[#cfd9d1] bg-white px-5 py-3 text-base font-semibold text-[#173925] shadow-none hover:bg-[#f5f8f5]'
const labelBaseClass = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold'

const emptyFilters = {
  startDate: '',
  endDate: '',
  status: 'ALL',
}

const statusOptions = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'COMPLETED', label: 'Đã thanh toán' },
  { value: 'FAILED', label: 'Thanh toán lỗi' },
  { value: 'PENDING', label: 'Đang xử lý' },
  { value: 'EXPIRED', label: 'Hết hạn' },
]

const statusMap = {
  COMPLETED: { label: 'Đã thanh toán', className: 'border-green-200 bg-green-50 text-green-700' },
  FAILED: { label: 'Thanh toán lỗi', className: 'border-red-200 bg-red-50 text-red-700' },
  PENDING: { label: 'Đang xử lý', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  EXPIRED: { label: 'Hết hạn', className: 'border-red-200 bg-red-50 text-red-700' },
  REFUNDED: { label: 'Đã hoàn tiền', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  PARTIALLY_REFUNDED: { label: 'Hoàn tiền một phần', className: 'border-blue-200 bg-blue-50 text-blue-700' },
}

const formatDateLabel = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toLocaleDateString('vi-VN')
}

const formatDateTimeLabel = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

const formatCurrency = (amount, currency = 'VND') => {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '--'

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency || 'VND',
  }).format(value)
}

const formatPaymentMethodLabel = (method) => {
  switch (String(method || '').trim().toUpperCase()) {
    case 'MOMO':
    case 'MOMO_WALLET':
      return 'Ví MoMo'
    case 'CASH':
      return 'Tiền mặt'
    case 'BANK_TRANSFER':
      return 'Chuyển khoản'
    case 'CARD_AT_COUNTER':
      return 'Thẻ tại quầy'
    default:
      return method || '--'
  }
}

const normalizeStatus = (status) => {
  const normalized = String(status || '').trim().toUpperCase()
  if (!normalized) return 'PENDING'
  if (['SUCCESS', 'PAID'].includes(normalized)) return 'COMPLETED'
  return normalized
}

const getStatusMeta = (status) => statusMap[normalizeStatus(status)] || statusMap.PENDING

const buildRecordId = (payment) =>
  `payment-${payment.orderId || payment.invoiceNumber || payment.resourceType || 'record'}-${payment.resourceId || payment.appointmentId || payment.consultationId || '0'}`

const normalizePaymentRecord = (payment, summary) => {
  const normalizedStatus = normalizeStatus(
    payment?.status || summary?.status || summary?.paymentStatus || 'PENDING',
  )
  const resourceType = String(
    payment?.resourceType ||
      summary?.resourceType ||
      (payment?.appointmentId || summary?.appointmentId ? 'APPOINTMENT' : 'CONSULTATION'),
  )
    .trim()
    .toUpperCase()
  const createdAt = payment?.createdAt || payment?.completedAt || summary?.createdAt || summary?.date || ''

  return {
    ...payment,
    summary,
    recordId: buildRecordId({
      ...payment,
      resourceType,
      resourceId:
        payment?.resourceId ||
        summary?.resourceId ||
        summary?.appointmentId ||
        summary?.consultationId,
      appointmentId: payment?.appointmentId || summary?.appointmentId,
      consultationId: summary?.consultationId,
    }),
    resourceType,
    resourceId:
      payment?.resourceId ||
      summary?.resourceId ||
      payment?.appointmentId ||
      summary?.appointmentId ||
      summary?.consultationId ||
      '',
    appointmentId: payment?.appointmentId || summary?.appointmentId || '',
    consultationId: summary?.consultationId || '',
    orderId: payment?.orderId || summary?.orderId || '',
    invoiceNumber: payment?.invoiceNumber || payment?.orderId || summary?.orderId || '--',
    transactionCode:
      payment?.transactionId || payment?.invoiceNumber || payment?.orderId || summary?.orderId || '--',
    serviceName:
      summary?.topic ||
      payment?.description ||
      summary?.description ||
      (resourceType === 'CONSULTATION' ? 'Đặt lịch tư vấn' : 'Đặt lịch khám bác sĩ'),
    patientName: payment?.patientName || summary?.patientName || '--',
    patientPhone: payment?.patientPhone || summary?.patientPhone || '--',
    doctorName: payment?.doctorName || summary?.doctorName || '--',
    clinicName: payment?.clinicName || summary?.clinicName || '--',
    paymentMethod: payment?.paymentMethod || summary?.paymentMethod || '--',
    status: normalizedStatus,
    amount: payment?.finalAmount ?? payment?.amount ?? summary?.paymentAmount ?? 0,
    currency: payment?.currency || 'VND',
    createdAt,
    appointmentDate: summary?.date || payment?.appointmentDate || payment?.date || '',
    appointmentTime: summary?.time || payment?.appointmentTime || payment?.time || '',
    patientDateOfBirth: summary?.patientDateOfBirth || '--',
    patientGender: summary?.patientGender || '--',
    patientAddress: summary?.patientAddress || '--',
    failureReason: payment?.failureReason || payment?.errorMessage || '',
    payUrl: payment?.payUrl || payment?.redirectUrl || '',
  }
}

const mergePaymentsWithSummaries = (payments, summaries) => {
  const summaryByOrderId = new Map(
    summaries.map((summary) => [String(summary.orderId || ''), summary]),
  )
  const merged = payments.map((payment) =>
    normalizePaymentRecord(payment, summaryByOrderId.get(String(payment?.orderId || ''))),
  )

  const existingOrderIds = new Set(merged.map((payment) => String(payment.orderId || '')))

  const summaryOnlyRecords = summaries
    .filter((summary) => summary?.orderId && !existingOrderIds.has(String(summary.orderId)))
    .map((summary) =>
      normalizePaymentRecord(
        {
          orderId: summary.orderId,
          status: 'PENDING',
          resourceType: summary.resourceType,
          resourceId: summary.resourceId || summary.consultationId || summary.appointmentId,
          createdAt: summary.createdAt,
        },
        summary,
      ),
    )

  return [...merged, ...summaryOnlyRecords].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
}

const StatusLabel = ({ meta }) => (
  <span className={`${labelBaseClass} ${meta.className}`}>{meta.label}</span>
)

const PaymentHistory = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()

  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState('')

  useEffect(() => {
    if (!user?.id) return

    const fetchPayments = async () => {
      setIsLoading(true)
      try {
        const [history, summaries] = await Promise.all([
          paymentApi.getPaymentHistory(user.id, { page: 0, size: 100 }),
          Promise.resolve(loadAllPaymentBookingSummaries()),
        ])
        setPayments(mergePaymentsWithSummaries(Array.isArray(history) ? history : [], summaries))
      } catch (error) {
        showToast({
          type: 'error',
          message: extractApiErrorMessage(error, 'Không thể tải lịch sử thanh toán'),
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [showToast, user?.id])

  const filteredPayments = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    return payments.filter((payment) => {
      const haystack = [
        payment.transactionCode,
        payment.serviceName,
        payment.patientName,
        payment.patientPhone,
        payment.doctorName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const transactionDate = String(payment.createdAt || '').slice(0, 10)

      if (keyword && !haystack.includes(keyword)) return false
      if (filters.startDate && (!transactionDate || transactionDate < filters.startDate)) return false
      if (filters.endDate && (!transactionDate || transactionDate > filters.endDate)) return false
      if (filters.status !== 'ALL' && normalizeStatus(payment.status) !== filters.status) return false
      return true
    })
  }, [filters, payments, searchQuery])

  useEffect(() => {
    if (!filteredPayments.length) {
      setSelectedRecordId('')
      return
    }

    if (!filteredPayments.some((payment) => payment.recordId === selectedRecordId)) {
      setSelectedRecordId(filteredPayments[0].recordId)
    }
  }, [filteredPayments, selectedRecordId])

  const selectedPayment =
    filteredPayments.find((payment) => payment.recordId === selectedRecordId) || null

  const handleApplyFilters = () => {
    if (
      draftFilters.startDate &&
      draftFilters.endDate &&
      draftFilters.startDate > draftFilters.endDate
    ) {
      showToast({
        type: 'error',
        message: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc',
      })
      return
    }

    setFilters(draftFilters)
    setFilterOpen(false)
  }

  const handleResetFilters = () => {
    setDraftFilters(emptyFilters)
    setFilters(emptyFilters)
    setFilterOpen(false)
  }

  const handleDownloadReceipt = async (orderId) => {
    if (!orderId) return

    try {
      const blob = await paymentApi.downloadReceipt(orderId)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `receipt-${orderId}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(anchor)
      showToast({ type: 'success', message: 'Đã tải hóa đơn' })
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể tải hóa đơn'),
      })
    }
  }

  const handleContinuePayment = async (payment) => {
    try {
      let payUrl = payment?.payUrl

      if (!payUrl && payment?.orderId) {
        const latest = await paymentApi.getPaymentResult(payment.orderId)
        payUrl = latest?.payUrl || latest?.redirectUrl
      }

      if (!payUrl && payment?.orderId) {
        const synced = await paymentApi.queryPaymentStatus(payment.orderId)
        payUrl = synced?.payUrl || synced?.redirectUrl
      }

      if (!payUrl) {
        throw new Error('Không tìm thấy link thanh toán')
      }

      window.location.href = payUrl
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể tiếp tục thanh toán'),
      })
    }
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold tracking-[-0.02em] text-[#143c26]">
          Lịch sử thanh toán
        </h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <section className="overflow-hidden border border-[#d7e2da] bg-white">
          <div className="border-b border-[#d7e2da] px-5 py-4">
            <div className="relative flex items-stretch gap-3">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Mã giao dịch, tên dịch vụ, tên bệnh nhân, số điện thoại ..."
                leftIcon={<Search className="h-4 w-4" />}
                containerClassName="min-w-0 flex-1"
                className="!rounded-[6px] border-[#d7e2da] pr-4"
              />

              <button
                type="button"
                onClick={() => {
                  setDraftFilters(filters)
                  setFilterOpen((current) => !current)
                }}
                className={`flex min-w-[102px] items-center justify-center gap-2 rounded-[6px] border px-4 text-sm font-semibold transition ${
                  filterOpen
                    ? 'border-[#0f4f2a] bg-[#f1f6f2] text-[#0f4f2a]'
                    : 'border-[#d7e2da] bg-white text-[#173925]'
                }`}
              >
                <Filter className="h-4 w-4" />
                Lọc
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-20 w-[340px] border border-[#d7e2da] bg-white p-5 shadow-[0_18px_48px_rgba(15,79,42,0.14)]">
                  <div className="space-y-5">
                    <div>
                      <div className="mb-2 text-sm font-semibold text-[#173925]">
                        Ngày khám
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={draftFilters.startDate}
                          onChange={(event) =>
                            setDraftFilters((current) => ({
                              ...current,
                              startDate: event.target.value,
                            }))
                          }
                          className="h-11 w-full rounded-[6px] border border-[#d7e2da] px-3 text-sm text-[#173925] outline-none focus:border-[#0f4f2a]"
                        />
                        <input
                          type="date"
                          value={draftFilters.endDate}
                          onChange={(event) =>
                            setDraftFilters((current) => ({
                              ...current,
                              endDate: event.target.value,
                            }))
                          }
                          className="h-11 w-full rounded-[6px] border border-[#d7e2da] px-3 text-sm text-[#173925] outline-none focus:border-[#0f4f2a]"
                        />
                      </div>
                    </div>

                    <Select
                      label="Trạng thái"
                      value={draftFilters.status}
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                      options={statusOptions}
                      className="!rounded-[6px] !border-[#d7e2da] !py-3"
                    />

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <Button
                        className={`${primaryButtonClass} justify-center`}
                        onClick={handleApplyFilters}
                      >
                        Áp dụng
                      </Button>
                      <Button
                        variant="outline"
                        className={`${secondaryButtonClass} justify-center`}
                        onClick={handleResetFilters}
                      >
                        Bỏ lọc
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-[calc(100vh-220px)] min-h-[520px] overflow-y-scroll pr-1">
            {filteredPayments.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-[#5f7363]">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ef]">
                    <Inbox className="h-7 w-7 text-[#5f7363]" />
                  </div>
                </div>
                Chưa có thông tin thanh toán
              </div>
            ) : (
              filteredPayments.map((payment) => {
                const isActive = payment.recordId === selectedRecordId
                const statusMeta = getStatusMeta(payment.status)

                return (
                  <button
                    key={payment.recordId}
                    type="button"
                    onClick={() => setSelectedRecordId(payment.recordId)}
                    className={`w-full border-b border-[#e5ece6] px-5 py-4 text-left transition ${
                      isActive ? 'bg-[#f4faf5]' : 'bg-white hover:bg-[#f8fbf8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 inline-flex rounded-full bg-[#ecf4ff] px-2.5 py-1 text-[11px] font-semibold text-[#1f5fa8]">
                          {payment.resourceType === 'CONSULTATION'
                            ? 'Thanh toán lịch tư vấn'
                            : 'Thanh toán lịch khám'}
                        </div>
                        <div className="truncate text-[18px] font-semibold leading-6 text-[#143c26]">
                          {payment.serviceName}
                        </div>
                        <div className="mt-1 text-sm text-[#51685a]">
                          {payment.transactionCode}
                        </div>
                        <div className="mt-2 text-sm font-semibold uppercase tracking-[0.01em] text-[#173925]">
                          {payment.patientName}
                        </div>
                        <div className="mt-3">
                          <StatusLabel meta={statusMeta} />
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7f72]">
                          Số tiền
                        </div>
                        <div className="mt-2 text-lg font-bold leading-none text-[#0f4f2a]">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>
        <section className="overflow-hidden border border-[#d7e2da] bg-white">
          {!selectedPayment ? (
            <div className="px-6 py-10 text-sm text-[#5f7363]">
              Chưa có thông tin thanh toán
            </div>
          ) : (
            <div>
              <div className="border-b border-[#d7e2da] px-7 py-6">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7f72]">
                      Mã giao dịch
                    </div>
                    <div className="mt-3 break-all text-[28px] font-bold leading-none text-[#0f4f2a]">
                      {selectedPayment.transactionCode}
                    </div>
                  </div>
                  <StatusLabel meta={getStatusMeta(selectedPayment.status)} />
                </div>
              </div>

              <div className="border-b border-[#d7e2da] px-7 py-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ef]">
                    <CreditCard className="h-7 w-7 text-[#0f4f2a]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[24px] font-semibold leading-7 text-[#143c26]">
                      {selectedPayment.serviceName}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-[#d7e2da] px-7 py-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#0f4f2a]" />
                  <h2 className="text-lg font-semibold text-[#143c26]">
                    Thông tin thanh toán
                  </h2>
                </div>

                <div className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
                  <div>
                    <div className="text-sm text-[#6b7f72]">Mã giao dịch</div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {selectedPayment.transactionCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7f72]">Ngày thanh toán</div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {formatDateTimeLabel(selectedPayment.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7f72]">Tên dịch vụ</div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {selectedPayment.serviceName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7f72]">Phương thức thanh toán</div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {formatPaymentMethodLabel(selectedPayment.paymentMethod)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7f72]">Số tiền</div>
                    <div className="mt-1 text-sm font-semibold text-[#173925]">
                      {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                    </div>
                  </div>
                </div>
              </div>

              {selectedPayment.failureReason && (
                <div className="border-b border-[#d7e2da] px-7 py-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#0f4f2a]" />
                    <h2 className="text-lg font-semibold text-[#143c26]">
                      Ghi chú thanh toán
                    </h2>
                  </div>
                  <div className="mt-4 text-sm text-[#51685a]">
                    {selectedPayment.failureReason}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 border-b border-[#d7e2da] px-7 py-5">
                {normalizeStatus(selectedPayment.status) === 'COMPLETED' && selectedPayment.orderId && (
                  <Button
                    variant="outline"
                    className={`${secondaryButtonClass} justify-center`}
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={() => handleDownloadReceipt(selectedPayment.orderId)}
                  >
                    Tải hóa đơn
                  </Button>
                )}

                {normalizeStatus(selectedPayment.status) === 'PENDING' && (
                  <Button
                    className={`${primaryButtonClass} justify-center`}
                    leftIcon={<CreditCard className="h-4 w-4" />}
                    onClick={() => handleContinuePayment(selectedPayment)}
                  >
                    Tiếp tục thanh toán
                  </Button>
                )}

                {normalizeStatus(selectedPayment.status) === 'COMPLETED' &&
                  selectedPayment.resourceType === 'CONSULTATION' &&
                  selectedPayment.consultationId && (
                  <Link to={`/appointments?bookingId=consultation-${selectedPayment.consultationId}`}>
                    <Button
                      variant="outline"
                      className={`${secondaryButtonClass} justify-center`}
                      leftIcon={<FileText className="h-4 w-4" />}
                    >
                      Xem chi tiết phiếu tư vấn
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default PaymentHistory
