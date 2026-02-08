import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  Edit2,
  Copy,
  Check,
  Percent,
  DollarSign,
  Clock,
  Inbox,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Loading'
import { useUIStore } from '@/store/uiStore'
import { adminApi } from '@/api/adminApiWrapper'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'

const defaultForm = {
  code: '',
  description: '',
  type: 'Percentage',
  value: 10,
  minOrderAmount: 0,
  maxDiscount: 0,
  usageLimit: 100,
  validFrom: '',
  validTo: '',
}

const generateCode = () => {
  return 'PROMO' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(price)

const VoucherManagement = () => {
  const { showToast } = useUIStore()
  const [vouchers, setVouchers] = useState([])
  const [filteredVouchers, setFilteredVouchers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [formData, setFormData] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)

  useEffect(() => {
    fetchVouchers()
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredVouchers(vouchers)
    } else {
      setFilteredVouchers(
        vouchers.filter(v =>
          v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }
  }, [vouchers, searchQuery])

  const fetchVouchers = async () => {
    setIsLoading(true)
    try {
      const data = await adminApi.getVouchers()
      setVouchers(data || [])
    } catch (error) {
      showToast({ type: 'error', message: extractApiErrorMessage(error, 'Không thể tải danh sách voucher') })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.code.trim()) {
      showToast({ type: 'error', message: 'Mã voucher là bắt buộc' })
      return
    }
    if (formData.value <= 0) {
      showToast({ type: 'error', message: 'Giá trị phải lớn hơn 0' })
      return
    }

    setIsSubmitting(true)
    try {
      if (editingVoucher) {
        await adminApi.updateVoucher(editingVoucher.id, formData)
        showToast({ type: 'success', message: 'Đã cập nhật voucher' })
      } else {
        await adminApi.createVoucher(formData)
        showToast({ type: 'success', message: 'Đã thêm voucher' })
      }
      setShowModal(false)
      setEditingVoucher(null)
      setFormData(defaultForm)
      fetchVouchers()
    } catch (error) {
      showToast({ type: 'error', message: extractApiErrorMessage(error, 'Không thể lưu voucher') })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (voucher) => {
    try {
      await adminApi.updateVoucher(voucher.id, { active: !voucher.active })
      setVouchers(prev =>
        prev.map(v => v.id === voucher.id ? { ...v, active: !v.active } : v)
      )
      showToast({ type: 'success', message: voucher.active ? 'Đã vô hiệu hóa voucher' : 'Đã kích hoạt voucher' })
    } catch (error) {
      showToast({ type: 'error', message: extractApiErrorMessage(error, 'Không thể thay đổi trạng thái') })
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid md:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">Quản lý Voucher</h1>
          <p className="text-sage-600">Tạo và quản lý mã khuyến mãi</p>
        </div>
        <Button onClick={() => setShowModal(true)} leftIcon={<Plus />}>Thêm voucher</Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <Input
            type="text"
            placeholder="Tìm theo mã hoặc mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </CardContent>
      </Card>

      {/* Voucher Grid */}
      {filteredVouchers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-sage-600" />
            </div>
            <h3 className="text-lg font-semibold text-sage-900 mb-2">Chưa có voucher</h3>
            <p className="text-sage-600 text-sm">Tạo voucher đầu tiên bằng cách nhấn nút trên</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredVouchers.map((voucher, index) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="overflow-hidden">
                {/* Dashed top border decoration */}
                <div className="h-2 bg-gradient-to-r from-sage-500 to-terra-400" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-bold text-sage-900 bg-sage-50 px-3 py-1 rounded">
                        {voucher.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(voucher.code)}
                        className="p-1 rounded hover:bg-sage-100 text-sage-500 hover:text-sage-700 transition-colors"
                      >
                        {copiedCode === voucher.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <button onClick={() => handleToggleStatus(voucher)} className="text-sage-400 hover:text-sage-600">
                      {voucher.active ? <ToggleRight className="w-5 h-5 text-sage-600" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </div>

                  {voucher.description && (
                    <p className="text-sm text-sage-600 mb-3">{voucher.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={voucher.type === 'Percentage' ? 'bg-sage-100 text-sage-800' : 'bg-terra-100 text-terra-800'}>
                      {voucher.type === 'Percentage' ? <Percent className="w-3 h-3 mr-1" /> : <DollarSign className="w-3 h-3 mr-1" />}
                      {voucher.type === 'Percentage' ? `${voucher.value}%` : formatPrice(voucher.value)}
                    </Badge>
                    <Badge className={voucher.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                      {voucher.active ? 'Hoạt động' : 'Tạm ngừng'}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-sage-500 mb-4">
                    {voucher.minOrderAmount > 0 && (
                      <p>Đặt mua tối thiểu: {formatPrice(voucher.minOrderAmount)}</p>
                    )}
                    {voucher.usageLimit > 0 && (
                      <p className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Sử dụng: {voucher.usedCount || 0}/{voucher.usageLimit} lần
                      </p>
                    )}
                    {voucher.validFrom && (
                      <p>Từ: {new Date(voucher.validFrom).toLocaleDateString('vi-VN')}</p>
                    )}
                    {voucher.validTo && (
                      <p>Đến: {new Date(voucher.validTo).toLocaleDateString('vi-VN')}</p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setEditingVoucher(voucher)
                      setFormData({
                        code: voucher.code,
                        description: voucher.description || '',
                        type: voucher.type || 'Percentage',
                        value: voucher.value || 10,
                        minOrderAmount: voucher.minOrderAmount || 0,
                        maxDiscount: voucher.maxDiscount || 0,
                        usageLimit: voucher.usageLimit || 100,
                        validFrom: voucher.validFrom || '',
                        validTo: voucher.validTo || '',
                      })
                      setShowModal(true)
                    }}
                    leftIcon={<Edit2 className="w-4 h-4" />}
                  >
                    Chỉnh sửa
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingVoucher(null); setFormData(defaultForm) }}
        title={editingVoucher ? 'Chỉnh sửa Voucher' : 'Thêm Voucher mới'}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label="Mã voucher *"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={!!editingVoucher}
                required
              />
            </div>
            {!editingVoucher && (
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={() => setFormData({ ...formData, code: generateCode() })}>
                  Tạo tự động
                </Button>
              </div>
            )}
          </div>

          <Input
            label="Mô tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Loại giảm giá"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'Percentage', label: 'Phần trăm (%)' },
                { value: 'Fixed', label: 'Cố định (VND)' },
              ]}
            />
            <Input
              label="Giá trị *"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              min="1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Đặt mua tối thiểu (VND)"
              type="number"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
              min="0"
            />
            {formData.type === 'Percentage' && (
              <Input
                label="Giảm tối đa (VND)"
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                min="0"
              />
            )}
          </div>

          <Input
            label="Giới hạn sử dụng"
            type="number"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
            min="1"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Từ ngày"
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
            />
            <Input
              label="Đến ngày"
              type="date"
              value={formData.validTo}
              onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : editingVoucher ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default VoucherManagement
