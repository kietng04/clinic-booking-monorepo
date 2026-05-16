import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Calendar,
  Clock3,
  FileText,
  Home,
  Loader2,
  MapPin,
  RefreshCcw,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { paymentApi } from '@/api/paymentApiWrapper'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { repairReactNode } from '@/utils/repairReactMojibake'
import { loadPaymentBookingSummary } from '@/utils/paymentBookingSummary'

const POLL_INTERVAL_MS = 2500
const POLL_TIMEOUT_MS = 120000
const STATUS_SYNC_INTERVAL_MS = 7500

const normalizeStatus = (status) => {
  const value = String(status || '')
    .trim()
    .toUpperCase()

  if (value === 'SUCCESS' || value === 'PAID') return 'COMPLETED'
  if (value === 'FAIL' || value === 'ERROR') return 'FAILED'
  return value
}

const isTerminalStatus = (status) =>
  ['COMPLETED', 'FAILED', 'EXPIRED', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(
    normalizeStatus(status),
  )

const formatDateLabel = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN')
}

const formatGenderLabel = (value) => {
  switch (String(value || '').toUpperCase()) {
    case 'MALE':
      return 'Nam'
    case 'FEMALE':
      return 'Nữ'
    case 'OTHER':
      return 'Khác'
    default:
      return value || '--'
  }
}

const formatCurrency = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return '--'
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} đ`
}

const formatPaymentMethodLabel = (value) => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()

  if (normalized === 'MOMO' || normalized === 'MOMO_WALLET') return 'MoMo'
  return value || '--'
}

const getProviderCallbackStatus = (searchParams) => {
  const resultCode = searchParams.get('resultCode')
  const errorCode = searchParams.get('errorCode')
  const status = normalizeStatus(searchParams.get('status'))
  const message = String(searchParams.get('message') || '')
    .trim()
    .toLowerCase()

  if (status === 'COMPLETED' || status === 'SUCCESS') return 'COMPLETED'
  if (status === 'FAILED') return 'FAILED'
  if (resultCode === '0' || errorCode === '0') return 'COMPLETED'
  if (resultCode || errorCode) return 'FAILED'
  if (message.includes('successful') || message.includes('thành công')) return 'COMPLETED'
  if (message.includes('failed') || message.includes('thất bại')) return 'FAILED'
  return ''
}

const buildFallbackTicketCode = (appointmentId, date) => {
  if (!appointmentId) return ''

  const normalizedDate = String(date || '')
    .slice(2, 10)
    .replaceAll('-', '')
  const normalizedId = String(appointmentId).replace(/\D/g, '').slice(-4).padStart(4, '0')

  if (!normalizedDate || !normalizedId) return ''
  return `YMA${normalizedDate}${normalizedId}`
}

const normalizeTimeLabel = (time, fallbackLabel) => {
  if (fallbackLabel) return fallbackLabel
  const normalized = String(time || '').slice(0, 5)
  return normalized || '--'
}

const resolveResourceType = (paymentResult, cachedSummary) =>
  String(
    paymentResult?.resourceType ||
      cachedSummary?.resourceType ||
      (paymentResult?.appointmentId || cachedSummary?.appointmentId ? 'APPOINTMENT' : ''),
  )
    .trim()
    .toUpperCase()

const buildBookingViewModel = ({ paymentResult, appointmentDetail, cachedSummary, orderId }) => {
  const resourceType = resolveResourceType(paymentResult, cachedSummary)
  const appointmentId = paymentResult?.appointmentId || appointmentDetail?.id || cachedSummary?.appointmentId
  const consultationId =
    resourceType === 'CONSULTATION'
      ? paymentResult?.resourceId || cachedSummary?.consultationId || cachedSummary?.resourceId
      : null
  const bookingDate = appointmentDetail?.date || appointmentDetail?.appointmentDate || cachedSummary?.date
  const ticketCode =
    paymentResult?.appointmentCode ||
    paymentResult?.invoiceNumber ||
    appointmentDetail?.appointmentCode ||
    cachedSummary?.appointmentCode ||
    (resourceType === 'APPOINTMENT' ? buildFallbackTicketCode(appointmentId, bookingDate) : '') ||
    paymentResult?.orderId ||
    orderId

  return {
    resourceType,
    appointmentId,
    consultationId,
    ticketCode,
    queueNumber:
      paymentResult?.queueNumber || appointmentDetail?.queueNumber || cachedSummary?.queueNumber || '--',
    doctorName:
      appointmentDetail?.doctorName || cachedSummary?.doctorName || paymentResult?.doctorName || 'Bác sĩ',
    doctorAvatar: appointmentDetail?.doctorAvatar || cachedSummary?.doctorAvatar || '',
    doctorAddress:
      appointmentDetail?.clinicAddress ||
      appointmentDetail?.clinicName ||
      cachedSummary?.doctorAddress ||
      cachedSummary?.clinicName ||
      '--',
    doctorSpecialization:
      appointmentDetail?.doctorSpecialization || cachedSummary?.doctorSpecialization || 'Chưa cập nhật',
    bookingDate,
    bookingTime: normalizeTimeLabel(
      appointmentDetail?.time || appointmentDetail?.appointmentTime || cachedSummary?.time,
      cachedSummary?.slotLabel,
    ),
    periodLabel: cachedSummary?.periodLabel || 'Buổi chiều',
    patientName:
      appointmentDetail?.patientName || cachedSummary?.patientName || paymentResult?.patientName || '--',
    patientDateOfBirth:
      cachedSummary?.patientDateOfBirth || appointmentDetail?.patientDateOfBirth || '--',
    patientGender: cachedSummary?.patientGender || appointmentDetail?.patientGender || '--',
    patientPhone:
      cachedSummary?.patientPhone || appointmentDetail?.patientPhone || paymentResult?.patientPhone || '--',
    patientAddress:
      cachedSummary?.patientAddress ||
      appointmentDetail?.patientAddress ||
      appointmentDetail?.address ||
      '--',
    patientCode: cachedSummary?.patientCode || paymentResult?.patientCode || '--',
    topic: cachedSummary?.topic || paymentResult?.topic || '--',
    description: cachedSummary?.description || '',
    paymentAmount: paymentResult?.finalAmount || paymentResult?.amount || cachedSummary?.paymentAmount || 0,
    paymentMethod: formatPaymentMethodLabel(
      cachedSummary?.paymentMethod || paymentResult?.paymentMethod || '--',
    ),
  }
}

const actionButtonClass =
  '!rounded-[6px] border-[#0f4f2a] bg-[#0f4f2a] px-6 py-3 text-base font-semibold text-white shadow-none hover:bg-[#0b3f21]'
const outlineButtonClass =
  '!rounded-[6px] border-[#0f4f2a] px-6 py-3 text-base font-semibold text-[#0f4f2a] shadow-none hover:bg-[#eef5f0] hover:text-[#0f4f2a]'

const PaymentResult = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId') || searchParams.get('paymentId')

  const providerStatus = useMemo(() => getProviderCallbackStatus(searchParams), [searchParams])
  const cachedSummary = useMemo(() => loadPaymentBookingSummary(orderId), [orderId])

  const [isLoading, setIsLoading] = useState(true)
  const [pollTimedOut, setPollTimedOut] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)
  const [appointmentDetail, setAppointmentDetail] = useState(null)

  const inFlightRef = useRef(false)

  const fetchPaymentResult = async ({ forceSync = false, silent = true } = {}) => {
    if (!orderId || inFlightRef.current) return null

    inFlightRef.current = true
    if (!silent) {
      setIsLoading(true)
    }

    try {
      let data = await paymentApi.getPaymentResult(orderId)
      const backendStatus = normalizeStatus(data?.status)
      const shouldSync = forceSync || providerStatus === 'COMPLETED'

      if (shouldSync && backendStatus === 'PENDING') {
        try {
          data = await paymentApi.queryPaymentStatus(orderId)
        } catch (syncError) {
          console.warn('Payment status sync failed:', syncError)
        }
      }

      const resolvedBackendStatus = normalizeStatus(data?.status)
      const resolvedStatus =
        !isTerminalStatus(resolvedBackendStatus) && providerStatus
          ? providerStatus
          : resolvedBackendStatus

      const normalized = {
        ...data,
        orderId: data?.orderId || orderId,
        status: resolvedStatus,
        backendStatus: resolvedBackendStatus,
        syncPending: providerStatus === 'COMPLETED' && resolvedBackendStatus !== 'COMPLETED',
        resourceType: String(data?.resourceType || (data?.appointmentId ? 'APPOINTMENT' : ''))
          .trim()
          .toUpperCase(),
      }

      setPaymentResult(normalized)
      return normalized
    } catch (error) {
      console.error('Failed to fetch payment result:', error)

      const fallbackStatus = providerStatus || 'FAILED'
      const fallback = {
        orderId,
        status: fallbackStatus,
        backendStatus: 'PENDING',
        syncPending: providerStatus === 'COMPLETED',
        appointmentId: cachedSummary?.appointmentId,
        resourceId: cachedSummary?.consultationId || cachedSummary?.resourceId,
        resourceType: resolveResourceType(null, cachedSummary) || 'APPOINTMENT',
        error:
          fallbackStatus === 'FAILED'
            ? 'Không thể tải thông tin thanh toán'
            : undefined,
      }

      setPaymentResult(fallback)
      return fallback
    } finally {
      inFlightRef.current = false
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false)
      return undefined
    }

    let cancelled = false
    let timeoutId = null
    let tick = 0
    const startedAt = Date.now()

    const run = async () => {
      if (cancelled) return

      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
        setPollTimedOut(true)
        setIsLoading(false)
        return
      }

      const shouldForceSync =
        providerStatus === 'COMPLETED' ||
        (tick > 0 && tick % Math.max(1, Math.floor(STATUS_SYNC_INTERVAL_MS / POLL_INTERVAL_MS)) === 0)

      const result = await fetchPaymentResult({
        forceSync: shouldForceSync,
        silent: tick !== 0,
      })

      if (isTerminalStatus(result?.status) || result?.syncPending) {
        setPollTimedOut(false)
        setIsLoading(false)
        return
      }

      tick += 1
      timeoutId = window.setTimeout(run, POLL_INTERVAL_MS)
    }

    run()

    return () => {
      cancelled = true
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [orderId, providerStatus])

  useEffect(() => {
    const resourceType = resolveResourceType(paymentResult, cachedSummary)
    if (resourceType !== 'APPOINTMENT') return

    const appointmentId = paymentResult?.appointmentId || cachedSummary?.appointmentId
    if (!appointmentId) return

    let ignore = false

    const fetchAppointment = async () => {
      try {
        const data = await appointmentApi.getAppointment(appointmentId)
        if (!ignore) {
          setAppointmentDetail(data)
        }
      } catch (error) {
        console.warn('Failed to fetch appointment detail:', error)
      }
    }

    fetchAppointment()

    return () => {
      ignore = true
    }
  }, [cachedSummary, paymentResult])

  const handleDownloadReceipt = async () => {
    if (!orderId) return
    try {
      const blob = await paymentApi.downloadReceipt(orderId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to download receipt:', error)
    }
  }

  const handleManualRefresh = async () => {
    setPollTimedOut(false)
    await fetchPaymentResult({ forceSync: true, silent: false })
  }

  if (isLoading) {
    return repairReactNode(
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#0f4f2a]" />
          <p className="text-sm font-medium text-[#365543]">Đang xác nhận thanh toán...</p>
        </div>
      </div>,
    )
  }

  const normalizedStatus = normalizeStatus(paymentResult?.status)
  const isSuccess = normalizedStatus === 'COMPLETED'
  const isPending = normalizedStatus === 'PENDING'

  const bookingViewModel = buildBookingViewModel({
    paymentResult,
    appointmentDetail,
    cachedSummary,
    orderId,
  })
  const isConsultation = bookingViewModel.resourceType === 'CONSULTATION'
  const detailLink = isConsultation
    ? bookingViewModel.consultationId
      ? `/appointments?bookingId=consultation-${bookingViewModel.consultationId}`
      : '/appointments'
    : paymentResult?.appointmentId || cachedSummary?.appointmentId
      ? `/appointments?bookingId=appointment-${paymentResult?.appointmentId || cachedSummary?.appointmentId}`
      : '/appointments'

  const statusMessage = isPending
    ? pollTimedOut
      ? 'Hệ thống chưa nhận được xác nhận cuối cùng. Vui lòng bấm kiểm tra lại sau vài giây.'
      : 'Hệ thống đang đợi phản hồi xác nhận cuối cùng từ cổng thanh toán.'
    : paymentResult?.error || 'Thanh toán không thành công. Vui lòng thử lại.'

  return repairReactNode(
    <div className="mx-auto max-w-5xl space-y-5">
      {isSuccess ? (
        <section className="mx-auto max-w-3xl border border-[#d7e2da] bg-white">
          <div className="border-b border-[#d7e2da] px-5 py-4 sm:px-6">
            <div className="inline-flex rounded-[6px] bg-[#eff7f1] px-3 py-1 text-sm font-semibold text-[#0f4f2a]">
              {isConsultation ? 'Đặt lịch tư vấn thành công' : 'Đặt lịch khám thành công'}
            </div>
            {isConsultation ? (
              <div className="mt-4">
                <div className="text-base font-semibold text-[#476252]">Mã yêu cầu:</div>
                <div className="mt-1 text-3xl font-bold leading-none text-[#0f4f2a]">
                  {bookingViewModel.ticketCode || orderId || '--'}
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-end gap-3">
                <span className="text-base font-semibold text-[#476252]">STT:</span>
                <span className="text-4xl font-bold leading-none text-[#0f4f2a]">
                  {bookingViewModel.queueNumber}
                </span>
              </div>
            )}
          </div>

          <div className="border-b border-[#d7e2da] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-4">
              <Avatar src={bookingViewModel.doctorAvatar} name={bookingViewModel.doctorName} size="xl" />
              <div className="min-w-0">
                <div className="text-xl font-semibold text-[#143c26]">{bookingViewModel.doctorName}</div>
                <div className="mt-1 text-sm font-medium text-[#143c26]">{bookingViewModel.doctorName}</div>
                <div className="mt-2 text-sm leading-6 text-[#4f6557]">
                  {isConsultation ? 'Nơi tư vấn' : 'Phòng mạch'}: {bookingViewModel.doctorAddress}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-[#d7e2da] px-5 py-5 sm:px-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0f4f2a]" />
              <h2 className="text-lg font-semibold text-[#143c26]">
                {isConsultation ? 'Thông tin tư vấn' : 'Thông tin đặt khám'}
              </h2>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <div className="text-[#6b7f72]">{isConsultation ? 'Mã yêu cầu' : 'Mã phiếu khám'}</div>
                <div className="mt-1 font-semibold text-[#173925]">{bookingViewModel.ticketCode || '--'}</div>
              </div>
              {isConsultation ? (
                <>
                  <div>
                    <div className="text-[#6b7f72]">Chủ đề</div>
                    <div className="mt-1 font-semibold text-[#173925]">{bookingViewModel.topic}</div>
                  </div>
                  <div>
                    <div className="text-[#6b7f72]">Mô tả</div>
                    <div className="mt-1 font-semibold text-[#173925]">
                      {bookingViewModel.description || 'Không có mô tả thêm'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#6b7f72]">Phương thức thanh toán</div>
                    <div className="mt-1 font-semibold text-[#173925]">{bookingViewModel.paymentMethod}</div>
                  </div>
                  <div>
                    <div className="text-[#6b7f72]">Phí tư vấn</div>
                    <div className="mt-1 font-semibold text-[#173925]">
                      {formatCurrency(bookingViewModel.paymentAmount)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-[#6b7f72]">Ngày khám</div>
                    <div className="mt-1 font-semibold text-[#173925]">
                      {formatDateLabel(bookingViewModel.bookingDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#6b7f72]">Giờ khám</div>
                    <div className="mt-1 font-semibold text-[#173925]">
                      {bookingViewModel.bookingTime}
                      {bookingViewModel.periodLabel ? ` (${bookingViewModel.periodLabel})` : ''}
                    </div>
                  </div>
                </>
              )}
              <div>
                <div className="text-[#6b7f72]">Chuyên khoa</div>
                <div className="mt-1 font-semibold text-[#173925]">{bookingViewModel.doctorSpecialization}</div>
              </div>
            </div>
          </div>

          <div className="border-b border-[#d7e2da] px-5 py-5 sm:px-6">
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-[#0f4f2a]" />
              <h2 className="text-lg font-semibold text-[#143c26]">Thông tin bệnh nhân</h2>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <div className="text-[#6b7f72]">Mã bệnh nhân</div>
                <div className="mt-1 font-semibold text-[#173925]">{bookingViewModel.patientCode || '--'}</div>
              </div>
              <div>
                <div className="text-[#6b7f72]">Họ và tên</div>
                <div className="mt-1 font-semibold uppercase text-[#173925]">{bookingViewModel.patientName}</div>
              </div>
              <div>
                <div className="text-[#6b7f72]">Năm sinh</div>
                <div className="mt-1 font-semibold text-[#173925]">
                  {formatDateLabel(bookingViewModel.patientDateOfBirth)}
                </div>
              </div>
              <div>
                <div className="text-[#6b7f72]">Số điện thoại</div>
                <div className="mt-1 font-semibold text-[#173925]">{bookingViewModel.patientPhone || '--'}</div>
              </div>
              <div>
                <div className="text-[#6b7f72]">Giới tính</div>
                <div className="mt-1 font-semibold text-[#173925]">
                  {formatGenderLabel(bookingViewModel.patientGender)}
                </div>
              </div>
              <div>
                <div className="text-[#6b7f72]">Địa chỉ</div>
                <div className="mt-1 font-semibold uppercase text-[#173925]">
                  {bookingViewModel.patientAddress || '--'}
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to={detailLink} className="flex-1">
                <Button className={`${actionButtonClass} w-full justify-center`}>
                  {isConsultation ? 'Xem phiếu tư vấn' : 'Xem phiếu khám'}
                </Button>
              </Link>

              <Button
                variant="outline"
                className={`${outlineButtonClass} w-full flex-1 justify-center`}
                onClick={handleDownloadReceipt}
              >
                Lưu lại phiếu
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="border border-[#d7e2da] bg-white">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] ${
                    isPending ? 'bg-[#efe6c9] text-[#765b12]' : 'bg-[#f7dedd] text-[#b53b2f]'
                  }`}
                >
                  {isPending ? (
                    <Loader2 className="h-7 w-7 animate-spin" />
                  ) : (
                    <XCircle className="h-7 w-7" />
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5f7363]">
                    Kết quả thanh toán
                  </div>
                  <h1 className="mt-1 text-[28px] font-bold leading-tight text-[#143c26]">
                    {isPending ? 'Đang chờ xác nhận thanh toán' : 'Thanh toán thất bại'}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4f6557]">{statusMessage}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="border border-[#d7e2da] bg-white p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div>
                <div className="space-y-3 text-sm text-[#4f6557]">
                  {paymentResult?.orderId && (
                    <div className="flex items-center gap-2 text-[#173925]">
                      <FileText className="h-4 w-4 text-[#0f4f2a]" />
                      <span className="font-semibold">Mã đơn:</span>
                      <span className="font-mono">{paymentResult.orderId}</span>
                    </div>
                  )}
                  {!isConsultation && bookingViewModel.bookingDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#0f4f2a]" />
                      <span>{formatDateLabel(bookingViewModel.bookingDate)}</span>
                    </div>
                  )}
                  {!isConsultation && bookingViewModel.bookingTime && bookingViewModel.bookingTime !== '--' && (
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-[#0f4f2a]" />
                      <span>{bookingViewModel.bookingTime}</span>
                    </div>
                  )}
                  {bookingViewModel.doctorAddress && bookingViewModel.doctorAddress !== '--' && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#0f4f2a]" />
                      <span>{bookingViewModel.doctorAddress}</span>
                    </div>
                  )}
                  {isConsultation && bookingViewModel.topic && bookingViewModel.topic !== '--' && (
                    <div className="flex items-center gap-2 text-[#173925]">
                      <FileText className="h-4 w-4 text-[#0f4f2a]" />
                      <span>{bookingViewModel.topic}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  className={actionButtonClass}
                  leftIcon={<RefreshCcw className="h-4 w-4" />}
                  onClick={handleManualRefresh}
                >
                  Kiểm tra lại
                </Button>

                <Link to={detailLink}>
                  <Button
                    variant="outline"
                    className={outlineButtonClass}
                    leftIcon={<FileText className="h-4 w-4" />}
                  >
                    {isConsultation ? 'Xem phiếu tư vấn' : 'Xem lịch khám'}
                  </Button>
                </Link>

                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    className={outlineButtonClass}
                    leftIcon={<Home className="h-4 w-4" />}
                  >
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>,
  )
}

export default PaymentResult
