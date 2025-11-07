import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  Download,
  Calendar,
  Home,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { paymentApi } from '@/api/paymentApiWrapper'
import { formatDate } from '@/lib/utils'

const POLL_INTERVAL_MS = 2500
const POLL_TIMEOUT_MS = 90000
const STATUS_SYNC_INTERVAL_MS = 10000

const normalizeStatus = (status) => {
  const value = (status || '').toString().trim().toUpperCase()
  if (value === 'SUCCESS') return 'COMPLETED'
  if (value === 'FAIL' || value === 'ERROR') return 'FAILED'
  return value
}

const isTerminalStatus = (status) => {
  const normalized = normalizeStatus(status)
  return ['COMPLETED', 'FAILED', 'EXPIRED', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(normalized)
}

const PaymentResult = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [paymentResult, setPaymentResult] = useState(null)
  const [pollTimedOut, setPollTimedOut] = useState(false)

  const inFlightRef = useRef(false)

  const orderId = searchParams.get('orderId') || searchParams.get('paymentId')

  const fetchPaymentResult = async ({ forceSync = false, silent = true } = {}) => {
    if (!orderId || inFlightRef.current) return null

    inFlightRef.current = true
    if (!silent) {
      setIsLoading(true)
    }

    try {
      let data = await paymentApi.getPaymentResult(orderId)
      if (forceSync && normalizeStatus(data?.status) === 'PENDING') {
        try {
          data = await paymentApi.queryPaymentStatus(orderId)
        } catch (syncError) {
          console.warn('Payment status sync failed:', syncError)
        }
      }

      const normalized = {
        ...data,
        status: normalizeStatus(data?.status),
      }
      setPaymentResult(normalized)
      return normalized
    } catch (error) {
      console.error('Failed to fetch payment result:', error)
      const fallback = {
        orderId,
        status: 'FAILED',
        error: 'Không thể tải thông tin thanh toán',
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

      const elapsed = Date.now() - startedAt
      if (elapsed >= POLL_TIMEOUT_MS) {
        setPollTimedOut(true)
        setIsLoading(false)
        return
      }

      const shouldForceSync = tick > 0 && tick % Math.max(1, Math.floor(STATUS_SYNC_INTERVAL_MS / POLL_INTERVAL_MS)) === 0
      const result = await fetchPaymentResult({
        forceSync: shouldForceSync,
        silent: tick !== 0,
      })

      const status = normalizeStatus(result?.status)
      if (isTerminalStatus(status)) {
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
  }, [orderId])

  const handleDownloadReceipt = async () => {
    if (!orderId) return
    try {
      const blob = await paymentApi.downloadReceipt(orderId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download receipt:', error)
    }
  }

  const handleManualRefresh = async () => {
    setPollTimedOut(false)
    await fetchPaymentResult({ forceSync: true, silent: false })
  }

  const formatAmount = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sage-600 animate-spin mx-auto mb-4" />
          <p className="text-sage-600">Đang xác nhận thanh toán...</p>
        </div>
      </div>
    )
  }

  const normalizedStatus = normalizeStatus(paymentResult?.status)
  const isSuccess = normalizedStatus === 'COMPLETED'
  const isPending = normalizedStatus === 'PENDING'

  const getMethodLabel = (method) => {
    switch (method) {
      case 'MOMO_WALLET':
        return 'Momo'
      case 'CASH':
        return 'Tiền mặt'
      case 'BANK_TRANSFER':
        return 'Chuyển khoản'
      case 'CARD_AT_COUNTER':
        return 'Thẻ tại quầy'
      default:
        return method || 'Không xác định'
    }
  }

  const title = isSuccess
    ? 'Thanh toán thành công!'
    : isPending
      ? 'Đang chờ xác nhận thanh toán'
      : 'Thanh toán thất bại'

  const message = isSuccess
    ? 'Lịch hẹn của bạn đã được xác nhận. Chúng tôi đã gửi thông tin chi tiết đến email của bạn.'
    : isPending
      ? (pollTimedOut
          ? 'Hệ thống chưa nhận được xác nhận cuối cùng. Vui lòng bấm kiểm tra lại sau vài giây.'
          : 'Hệ thống đang chờ webhook từ cổng thanh toán. Vui lòng chờ trong giây lát...')
      : paymentResult?.error || 'Giao dịch không thành công. Vui lòng thử lại.'

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isSuccess
                  ? 'bg-green-100'
                  : isPending
                    ? 'bg-yellow-100'
                    : 'bg-red-100'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              ) : isPending ? (
                <Loader2 className="w-12 h-12 text-yellow-700 animate-spin" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </motion.div>

            <h1
              className={`text-3xl font-display font-bold mb-3 ${
                isSuccess
                  ? 'text-green-900'
                  : isPending
                    ? 'text-yellow-800'
                    : 'text-red-900'
              }`}
            >
              {title}
            </h1>

            <p className="text-sage-600 mb-8">{message}</p>

            {paymentResult && (
              <div className="bg-sage-50 rounded-soft p-6 mb-8 text-left">
                <h3 className="font-semibold text-sage-900 mb-4">Thông tin thanh toán</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sage-600">Mã đơn:</span>
                    <span className="font-medium text-sage-900 font-mono">
                      {paymentResult.orderId || orderId}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sage-600">Mã giao dịch:</span>
                    <span className="font-medium text-sage-900 font-mono">
                      {paymentResult.transactionId || '--'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sage-600">Phương thức:</span>
                    <span className="font-medium text-sage-900">
                      {getMethodLabel(paymentResult.paymentMethod)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sage-600">Trạng thái:</span>
                    <span className="font-medium text-sage-900">{normalizedStatus || '--'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sage-600">Thời gian:</span>
                    <span className="font-medium text-sage-900">
                      {formatDate(paymentResult.completedAt || paymentResult.createdAt || new Date().toISOString())}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-sage-200">
                    <span className="font-semibold text-sage-900">Số tiền:</span>
                    <span className="font-bold text-xl text-sage-900">
                      {formatAmount(paymentResult.finalAmount ?? paymentResult.amount ?? 0, paymentResult.currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isSuccess ? (
                <>
                  <Button
                    onClick={handleDownloadReceipt}
                    leftIcon={<Download className="w-4 h-4" />}
                    variant="outline"
                  >
                    Tải hóa đơn
                  </Button>

                  <Link to={paymentResult?.appointmentId ? `/appointments/${paymentResult.appointmentId}` : '/appointments'}>
                    <Button leftIcon={<Calendar className="w-4 h-4" />}>
                      Xem lịch hẹn
                    </Button>
                  </Link>

                  <Link to="/dashboard">
                    <Button variant="outline" leftIcon={<Home className="w-4 h-4" />}>
                      Về trang chủ
                    </Button>
                  </Link>
                </>
              ) : isPending ? (
                <>
                  <Button onClick={handleManualRefresh} leftIcon={<RotateCcw className="w-4 h-4" />}>
                    Kiểm tra lại
                  </Button>

                  <Link to="/appointments">
                    <Button variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
                      Xem lịch hẹn
                    </Button>
                  </Link>

                  <Link to="/dashboard">
                    <Button variant="ghost" leftIcon={<Home className="w-4 h-4" />}>
                      Về trang chủ
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate(-1)}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Thử lại
                  </Button>

                  <Link to="/appointments/book">
                    <Button variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
                      Đặt lịch mới
                    </Button>
                  </Link>

                  <Link to="/dashboard">
                    <Button variant="ghost" leftIcon={<Home className="w-4 h-4" />}>
                      Về trang chủ
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentResult
