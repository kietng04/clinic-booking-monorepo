import { useEffect, useState } from 'react'
import { Download, RefreshCw, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Loading'
import { useUIStore } from '@/store/uiStore'
import { adminApi } from '@/api/realApis/adminApi'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(Number(value ?? 0))

const formatDateTime = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString('vi-VN')
}

const displayValue = (value) => {
  if (value === null || value === undefined) return 'Chua cap nhat'
  const normalized = String(value).trim()
  return normalized ? normalized : 'Chua cap nhat'
}

const AdminRefunds = () => {
  const { showToast } = useUIStore()
  const [entries, setEntries] = useState([])
  const [summary, setSummary] = useState({ totalItems: 0, totalAmount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState('')

  const fetchRefundQueue = async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await adminApi.getRefundQueue({ page: 0, size: 200 })
      const items = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []
      const totalItems = Number(data?.totalElements ?? items.length)
      const totalAmount = items.reduce((sum, item) => sum + Number(item?.amount ?? 0), 0)

      setEntries(items)
      setSummary({ totalItems, totalAmount })
    } catch (fetchError) {
      const message = extractApiErrorMessage(fetchError, 'Khong the tai danh sach hoan tien')
      setEntries([])
      setSummary({ totalItems: 0, totalAmount: 0 })
      setError(message)
      showToast({ type: 'error', message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRefundQueue()
  }, [])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await adminApi.exportRefundQueue()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `refund-queue-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showToast({ type: 'success', message: 'Xuat danh sach hoan tien thanh cong' })
    } catch (exportError) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(exportError, 'Khong the xuat danh sach hoan tien'),
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">Hoan tien</h1>
          <p className="text-sage-600">Danh sach giao dich da thanh toan nhung can xu ly hoan tien.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRefundQueue}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Lam moi
          </Button>
          <Button size="sm" onClick={handleExport} isLoading={isExporting}>
            {!isExporting && <Download className="w-4 h-4 mr-1" />}
            Xuat CSV
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-100">
                <Wallet className="h-5 w-5 text-sage-700" />
              </div>
              <div>
                <p className="text-sm text-sage-500">So giao dich can hoan</p>
                <p className="text-2xl font-bold text-sage-900">{summary.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-terra-100">
                <Wallet className="h-5 w-5 text-terra-700" />
              </div>
              <div>
                <p className="text-sm text-sage-500">Tong so tien dang cho hoan</p>
                <p className="text-2xl font-bold text-sage-900">{formatCurrency(summary.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sach can hoan tien</CardTitle>
            <p className="mt-1 text-sm text-sage-500">Chi role ADMIN moi co quyen xem va export trang nay.</p>
          </div>
          <Badge className="bg-amber-100 text-amber-800">{summary.totalItems} muc</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : entries.length === 0 ? (
            <div className="px-6 py-12 text-center text-sage-500">
              Chua co giao dich nao can hoan tien.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-sage-100 text-sm">
                <thead className="bg-sage-50/80 text-left text-sage-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Lich hen</th>
                    <th className="px-4 py-3 font-medium">Benh nhan</th>
                    <th className="px-4 py-3 font-medium">Thong tin STK</th>
                    <th className="px-4 py-3 font-medium">So tien</th>
                    <th className="px-4 py-3 font-medium">Nguoi huy</th>
                    <th className="px-4 py-3 font-medium">Thoi diem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="align-top">
                      <td className="px-4 py-4 text-sage-800">
                        <p className="font-medium">#{entry.appointmentId}</p>
                        <p className="text-xs text-sage-500">Order: {entry.paymentOrderCode}</p>
                        <p className="text-xs text-sage-500">
                          {displayValue(entry.appointmentDate)} {entry.appointmentTime ? `- ${entry.appointmentTime}` : ''}
                        </p>
                        <p className="mt-2 text-xs text-sage-500">Ly do: {displayValue(entry.cancelReason)}</p>
                      </td>
                      <td className="px-4 py-4 text-sage-800">
                        <p className="font-medium">{displayValue(entry.patientName)}</p>
                        <p className="text-xs text-sage-500">ID: {displayValue(entry.patientId)}</p>
                        <p className="text-xs text-sage-500">SDT: {displayValue(entry.patientPhone)}</p>
                        <p className="text-xs text-sage-500">{displayValue(entry.patientEmail)}</p>
                      </td>
                      <td className="px-4 py-4 text-sage-800">
                        <p className="font-medium">STK: {displayValue(entry.bankAccountNumber)}</p>
                        <p className="text-xs text-sage-500">Chu TK: {displayValue(entry.bankAccountName)}</p>
                        <p className="text-xs text-sage-500">Ngan hang: {displayValue(entry.bankName)}</p>
                      </td>
                      <td className="px-4 py-4 text-sage-800">
                        <p className="font-semibold">{formatCurrency(entry.amount)}</p>
                        <p className="text-xs text-sage-500">{displayValue(entry.paymentMethod)}</p>
                        <Badge className="mt-2 bg-amber-100 text-amber-800">{displayValue(entry.status)}</Badge>
                      </td>
                      <td className="px-4 py-4 text-sage-800">
                        <p className="font-medium">{displayValue(entry.cancelledByRole)}</p>
                        <p className="text-xs text-sage-500">User ID: {displayValue(entry.cancelledByUserId)}</p>
                        <p className="text-xs text-sage-500">Bac si: {displayValue(entry.doctorName)}</p>
                      </td>
                      <td className="px-4 py-4 text-sage-800">
                        <p>{formatDateTime(entry.cancelledAt)}</p>
                        <p className="text-xs text-sage-500">Tao: {formatDateTime(entry.createdAt)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminRefunds
