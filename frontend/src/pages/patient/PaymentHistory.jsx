import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CreditCard,
  Download,
  Filter,
  Search,
  X,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Inbox,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { paymentApi } from '@/api/paymentApiWrapper'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'
import { formatDate } from '@/lib/utils'

const PaymentHistory = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()

  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, statusFilter, methodFilter, searchQuery, dateRange])

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const data = await paymentApi.getPaymentHistory(user.id, {})
      setPayments(data)
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể tải lịch sử thanh toán'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = [...payments]

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    // Filter by method
    if (methodFilter) {
      filtered = filtered.filter((p) => p.paymentMethod === methodFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter((p) => new Date(p.createdAt) >= new Date(dateRange.from))
    }
    if (dateRange.to) {
      filtered = filtered.filter((p) => new Date(p.createdAt) <= new Date(dateRange.to))
    }

    setFilteredPayments(filtered)
  }

  const handleDownloadReceipt = async (orderId) => {
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
      showToast({
        type: 'success',
        message: 'Đã tải hóa đơn',
      })
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể tải hóa đơn'),
      })
    }
  }

  const handleExportCSV = async () => {
    try {
      const blob = await paymentApi.exportHistory(user.id, dateRange)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payment-history-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showToast({
        type: 'success',
        message: 'Đã xuất dữ liệu',
      })
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể xuất dữ liệu'),
      })
    }
  }

  const formatAmount = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'FAILED':
        return <XCircle className="w-4 h-4" />
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return <CheckCircle2 className="w-4 h-4" />
      case 'EXPIRED':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'Thành công'
      case 'PENDING':
        return 'Đang xử lý'
      case 'FAILED':
        return 'Thất bại'
      case 'REFUNDED':
        return 'Đã hoàn tiền'
      case 'PARTIALLY_REFUNDED':
        return 'Hoàn tiền một phần'
      case 'EXPIRED':
        return 'Hết hạn'
      default:
        return status || 'Không xác định'
    }
  }

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
            Lịch sử thanh toán
          </h1>
          <p className="text-sage-600">Quản lý và theo dõi các giao dịch thanh toán</p>
        </div>

        <Button
          onClick={handleExportCSV}
          leftIcon={<Download className="w-4 h-4" />}
          variant="outline"
        >
          Xuất CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'COMPLETED', label: 'Thành công' },
                { value: 'PENDING', label: 'Đang xử lý' },
                { value: 'FAILED', label: 'Thất bại' },
                { value: 'REFUNDED', label: 'Đã hoàn tiền' },
                { value: 'PARTIALLY_REFUNDED', label: 'Hoàn tiền một phần' },
                { value: 'EXPIRED', label: 'Hết hạn' },
              ]}
            />

            <Select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              options={[
                { value: '', label: 'Tất cả phương thức' },
                { value: 'MOMO_WALLET', label: 'Momo' },
                { value: 'CASH', label: 'Tiền mặt' },
              ]}
            />

            <Input
              type="date"
              placeholder="Từ ngày"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            />

            <Input
              type="date"
              placeholder="Đến ngày"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sage-400" />
            <Input
              type="text"
              placeholder="Tìm theo mã hóa đơn hoặc mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sage-400 hover:text-sage-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment List */}
      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-sage-600" />
              </div>
              <h3 className="text-lg font-semibold text-sage-900 mb-2">
                Không có giao dịch nào
              </h3>
              <p className="text-sage-600">
                {searchQuery || statusFilter || methodFilter || dateRange.from || dateRange.to
                  ? 'Không tìm thấy giao dịch nào phù hợp'
                  : 'Bạn chưa có giao dịch thanh toán nào'}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPayments.map((payment, index) => (
              <motion.div
                key={payment.orderId || payment.invoiceNumber || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Payment Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-6 h-6 text-sage-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg text-sage-900 mb-1">
                                {payment.description}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-sage-600">
                                <span className="font-mono">{payment.invoiceNumber}</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(payment.createdAt)}
                                </span>
                                <span>Phương thức: {getMethodLabel(payment.paymentMethod)}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex flex-col items-start lg:items-end gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-sage-900">
                            {formatAmount(payment.finalAmount ?? payment.amount, payment.currency)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(payment.status)} flex items-center gap-1`}>
                            {getStatusIcon(payment.status)}
                            {getStatusLabel(payment.status)}
                          </Badge>

                          {payment.status === 'COMPLETED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReceipt(payment.orderId)}
                              leftIcon={<FileText className="w-4 h-4" />}
                            >
                              Tải hóa đơn
                            </Button>
                          )}
                        </div>

                        {(payment.failureReason || payment.errorMessage) && (
                          <p className="text-sm text-red-600">
                            Lý do: {payment.failureReason || payment.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default PaymentHistory
