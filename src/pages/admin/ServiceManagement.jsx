import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  Edit2,
  Clock,
  DollarSign,
  Building2,
  Tag,
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

const CATEGORIES = [
  { value: 'all', label: 'Tất cả danh mục' },
  { value: 'GENERAL', label: 'Đa khoa' },
  { value: 'SPECIALIST', label: 'Chuyên khoa' },
  { value: 'LAB', label: 'Xét nghiệm' },
  { value: 'IMAGING', label: 'Hình ảnh' },
]

const defaultForm = {
  name: '',
  clinicId: '',
  category: 'GENERAL',
  duration: 30,
  basePrice: 0,
  description: '',
  active: true,
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(price)
}

const ServiceManagement = () => {
  const { showToast } = useUIStore()
  const [services, setServices] = useState([])
  const [clinics, setClinics] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [clinicFilter, setClinicFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = [...services]
    if (clinicFilter !== 'all') filtered = filtered.filter(s => s.clinicId === clinicFilter)
    if (categoryFilter !== 'all') filtered = filtered.filter(s => s.category === categoryFilter)
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.clinicName || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredServices(filtered)
  }, [services, searchQuery, clinicFilter, categoryFilter])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [servicesData, clinicsData] = await Promise.all([
        adminApi.getServices(),
        adminApi.getClinics(),
      ])
      setServices(servicesData || [])
      setClinics(clinicsData || [])
    } catch {
      showToast({ type: 'error', message: 'Không thể tải dữ liệu' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast({ type: 'error', message: 'Tên dịch vụ là bắt buộc' })
      return
    }

    if (!formData.clinicId || formData.clinicId === '') {
      showToast({ type: 'error', message: 'Vui lòng chọn phòng khám' })
      return
    }

    setIsSubmitting(true)
    try {
      // Transform form data to match backend DTO field names and types
      const payload = {
        name: formData.name,
        clinicId: parseInt(formData.clinicId, 10),
        category: formData.category,
        durationMinutes: formData.duration,
        description: formData.description,
        basePrice: formData.basePrice,
        isActive: formData.active,
      }

      if (editingService) {
        await adminApi.updateService(editingService.id, payload)
        showToast({ type: 'success', message: 'Đã cập nhật dịch vụ' })
      } else {
        await adminApi.createService(payload)
        showToast({ type: 'success', message: 'Đã thêm dịch vụ' })
      }
      setShowModal(false)
      setEditingService(null)
      setFormData(defaultForm)
      fetchData()
    } catch {
      showToast({ type: 'error', message: 'Không thể lưu dịch vụ' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (service) => {
    try {
      await adminApi.updateService(service.id, { isActive: !service.isActive })
      setServices(prev =>
        prev.map(s => s.id === service.id ? { ...s, isActive: !s.isActive } : s)
      )
      showToast({ type: 'success', message: service.isActive ? 'Đã vô hiệu hóa dịch vụ' : 'Đã kích hoạt dịch vụ' })
    } catch {
      showToast({ type: 'error', message: 'Không thể thay đổi trạng thái' })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    )
  }

  const clinicOptions = [
    { value: 'all', label: 'Tất cả phòng khám' },
    ...clinics.map(c => ({ value: c.id, label: c.name }))
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">Quản lý Dịch vụ</h1>
          <p className="text-sage-600">Quản lý các dịch vụ y tế trong hệ thống</p>
        </div>
        <Button onClick={() => setShowModal(true)} leftIcon={<Plus />}>Thêm dịch vụ</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Tìm dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
            <Select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              options={clinicOptions}
            />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={CATEGORIES}
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Grid */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-sage-600" />
            </div>
            <h3 className="text-lg font-semibold text-sage-900 mb-2">Chưa có dịch vụ</h3>
            <p className="text-sage-600 text-sm">Thêm dịch vụ đầu tiên bằng cách nhấn nút trên</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sage-900">{service.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge className="bg-sage-100 text-sage-700 text-xs">{service.category}</Badge>
                        <Badge className={service.isActive ? 'bg-green-100 text-green-800 text-xs' : 'bg-gray-100 text-gray-600 text-xs'}>
                          {service.isActive ? 'Hoạt động' : 'Tạm ngừng'}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(service)}
                      className="text-sage-400 hover:text-sage-600"
                    >
                      {service.isActive ? <ToggleRight className="w-5 h-5 text-sage-600" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-sage-600 mb-4">
                    {service.clinicName && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{service.clinicName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{service.durationMinutes} phút</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium text-sage-900">{formatPrice(service.currentPrice || 0)}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setEditingService(service)
                      setFormData({
                        name: service.name,
                        clinicId: service.clinicId || '',
                        category: service.category || 'GENERAL',
                        duration: service.durationMinutes || 30,
                        basePrice: service.currentPrice || 0,
                        description: service.description || '',
                        active: service.isActive !== false,
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
        onClose={() => { setShowModal(false); setEditingService(null); setFormData(defaultForm) }}
        title={editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
      >
        <div className="space-y-4">
          <Input
            label="Tên dịch vụ *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Select
            label="Phòng khám *"
            value={formData.clinicId}
            onChange={(e) => setFormData({ ...formData, clinicId: e.target.value })}
            options={clinics.map(c => ({ value: c.id, label: c.name }))}
            placeholder="-- Chọn phòng khám --"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Danh mục"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={CATEGORIES.slice(1)}
            />
            <Input
              label="Thời gian (phút)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              min="10"
              max="240"
            />
          </div>
          <Input
            label="Giá cơ sở (VND)"
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
            min="0"
            leftIcon={<DollarSign className="w-4 h-4" />}
          />
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none text-sm resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : editingService ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ServiceManagement
