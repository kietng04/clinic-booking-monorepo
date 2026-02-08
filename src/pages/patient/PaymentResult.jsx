import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  Download,
  Calendar,
  FileText,
  Home,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { paymentApi } from '@/api/paymentApiWrapper'
import { formatDate } from '@/lib/utils'

const PaymentResult = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()

  const [isLoading, setIsLoading] = useState(true)
  const [paymentResult, setPaymentResult] = useState(null)

  const paymentId = searchParams.get('paymentId') || searchParams.get('orderId')
  const status = searchParams.get('status')

  useEffect(() => {
    if (paymentId) {
      fetchPaymentResult()
    } else {
      setIsLoading(false)
    }
  }, [paymentId])

  const fetchPaymentResult = async () => {
    setIsLoading(true)
    try {
      const data = await paymentApi.getPaymentResult(paymentId)
      setPaymentResult(data)
    } catch (error) {
      console.error('Failed to fetch payment result:', error)
      setPaymentResult({
        status: 'Failed',
        error: 'Không thể tải thông tin thanh toán',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReceipt = async () => {
    try {
      const blob = await paymentApi.downloadReceipt(paymentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${paymentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download receipt:', error)
    }
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
          <p className="text-sage-600">Đang xử lý thanh toán...</p>
        </div>
      </div>
    )
  }

  const isSuccess = paymentResult?.status === 'COMPLETED'

  const getMethodLabel = (method) => {
    switch (method) {
      case 'MOMO_WALLET':
        return 'Momo'
      case 'CASH':
        return 'Tiền mặt'
      default:
        return method || 'Không xác định'
    }
  }

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
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isSuccess
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </motion.div>

            {/* Title & Message */}
            <h1
              className={`text-3xl font-display font-bold mb-3 ${
                isSuccess ? 'text-green-900' : 'text-red-900'
              }`}
            >
              {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
            </h1>

            <p className="text-sage-600 mb-8">
              {isSuccess
                ? 'Lịch hẹn của bạn đã được xác nhận. Chúng tôi đã gửi thông tin chi tiết đến email của bạn.'
                : paymentResult?.error || 'Giao dịch không thành công. Vui lòng thử lại.'}
            </p>

            {/* Payment Details */}
            {isSuccess && paymentResult && (
              <div className="bg-sage-50 rounded-soft p-6 mb-8 text-left">
                <h3 className="font-semibold text-sage-900 mb-4">Thông tin thanh toán</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sage-600">Mã giao dịch:</span>
                    <span className="font-medium text-sage-900 font-mono">
                      {paymentResult.transactionId || paymentId}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sage-600">Phương thức:</span>
                  <span className="font-medium text-sage-900">
                    {getMethodLabel(paymentResult.paymentMethod)}
                  </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sage-600">Thời gian:</span>
                    <span className="font-medium text-sage-900">
                    {formatDate(paymentResult.completedAt || paymentResult.createdAt || new Date().toISOString())}
                    </span>
                  </div>

                  {paymentResult.discount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sage-600">Tổng tiền:</span>
                        <span className="text-sage-700">
                          {formatAmount(paymentResult.amount, paymentResult.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sage-600">Giảm giá:</span>
                        <span className="text-green-600">
                          -{formatAmount(paymentResult.discount, paymentResult.currency)}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between pt-3 border-t border-sage-200">
                    <span className="font-semibold text-sage-900">Đã thanh toán:</span>
                    <span className="font-bold text-xl text-sage-900">
                      {formatAmount(paymentResult.finalAmount, paymentResult.currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
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

                  <Link to={`/appointments/${paymentResult?.appointmentId}`}>
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

            {/* Help Text */}
            <div className="mt-8 pt-8 border-t border-sage-200">
              <p className="text-sm text-sage-500">
                Nếu bạn cần hỗ trợ, vui lòng liên hệ{' '}
                <a href="tel:028-1234-5678" className="text-sage-700 hover:text-sage-900 font-medium">
                  028-1234-5678
                </a>{' '}
                hoặc email{' '}
                <a href="mailto:support@clinic.com" className="text-sage-700 hover:text-sage-900 font-medium">
                  support@clinic.com
                </a>
              </p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentResult
