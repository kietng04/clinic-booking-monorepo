import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  Edit2,
  MapPin,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight,
  Building2,
  X
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Loading'
import { useUIStore } from '@/store/uiStore'
import { adminApi } from '@/api/adminApiWrapper'

const defaultForm = {
  name: '',
  address: '',
  phone: '',
  email: '',
  description: '',
}

const ClinicManagement = () => {
  const { showToast } = useUIStore()
  const [clinics, setClinics] = useState([])
  const [filteredClinics, setFilteredClinics] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClinic, setEditingClinic] = useState(null)
  const [formData, setFormData] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchClinics()
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredClinics(clinics)
    } else {
      setFilteredClinics(
        clinics.filter(c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.address || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }
  }, [clinics, searchQuery])

  const fetchClinics = async () => {
    setIsLoading(true)
    try {
      const data = await adminApi.getClinics()
      setClinics(data || [])
    } catch {
      showToast({ type: 'error', message: 'Không thể tải danh sách phòng khám' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast({ type: 'error', message: 'Tên phòng khám là bắt buộc' })
      return
    }

    setIsSubmitting(true)
    try {
      if (editingClinic) {
        await adminApi.updateClinic(editingClinic.id, formData)
        showToast({ type: 'success', message: 'Đã cập nhật phòng khám' })
      } else {
        await adminApi.createClinic(formData)
        showToast({ type: 'success', message: 'Đã thêm phòng khám' })
      }
      setShowModal(false)
      setEditingClinic(null)
      setFormData(defaultForm)
      fetchClinics()
    } catch {
      showToast({ type: 'error', message: 'Không thể lưu phòng khám' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (clinic) => {
    try {
      await adminApi.toggleClinic(clinic.id)
      setClinics(prev =>
        prev.map(c => c.id === clinic.id ? { ...c, active: !c.active } : c)
      )
      showToast({ type: 'success', message: clinic.active ? 'Đã vô hiệu hóa phòng khám' : 'Đã kích hoạt phòng khám' })
    } catch {
      showToast({ type: 'error', message: 'Không thể thay đổi trạng thái' })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">Quản lý Phòng khám</h1>
          <p className="text-sage-600">Quản lý các chi nhánh phòng khám trong hệ thống</p>
        </div>
        <Button onClick={() => setShowModal(true)} leftIcon={<Plus />}>
          Thêm phòng khám
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <Input
            type="text"
            placeholder="Tìm theo tên hoặc địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </CardContent>
      </Card>

      {/* Clinic Grid */}
      {filteredClinics.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-sage-600" />
            </div>
            <h3 className="text-lg font-semibold text-sage-900 mb-2">Chưa có phòng khám</h3>
            <p className="text-sage-600 text-sm">Thêm phòng khám đầu tiên bằng cách nhấn nút trên</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClinics.map((clinic, index) => (
            <motion.div
              key={clinic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-sage-900">{clinic.name}</h3>
                      <Badge className={clinic.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                        {clinic.active ? 'Hoạt động' : 'Tạm ngừng'}
                      </Badge>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(clinic)}
                      className="text-sage-400 hover:text-sage-600 transition-colors"
                    >
                      {clinic.active ? <ToggleRight className="w-5 h-5 text-sage-600" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-sage-600 mb-4">
                    {clinic.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{clinic.address}</span>
                      </div>
                    )}
                    {clinic.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{clinic.phone}</span>
                      </div>
                    )}
                    {clinic.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{clinic.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-sage-100">
                    <div className="flex-1 text-center">
                      <p className="text-xs text-sage-500">Dịch vụ</p>
                      <p className="text-sm font-semibold text-sage-900">{clinic.servicesCount || 0}</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-xs text-sage-500">Bác sĩ</p>
                      <p className="text-sm font-semibold text-sage-900">{clinic.doctorsCount || 0}</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-xs text-sage-500">Phòng</p>
                      <p className="text-sm font-semibold text-sage-900">{clinic.roomsCount || 0}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => {
                      setEditingClinic(clinic)
                      setFormData({
                        name: clinic.name,
                        address: clinic.address || '',
                        phone: clinic.phone || '',
                        email: clinic.email || '',
                        description: clinic.description || '',
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
        onClose={() => { setShowModal(false); setEditingClinic(null); setFormData(defaultForm) }}
        title={editingClinic ? 'Chỉnh sửa phòng khám' : 'Thêm phòng khám mới'}
      >
        <div className="space-y-4">
          <Input
            label="Tên phòng khám *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              leftIcon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none text-sm resize-none"
              placeholder="Mô tả phòng khám..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : editingClinic ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ClinicManagement
