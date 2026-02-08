import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  Edit2,
  Building2,
  Users,
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

const ROOM_TYPES = [
  { value: 'Consultation', label: 'Tư vấn' },
  { value: 'Lab', label: 'Xét nghiệm' },
  { value: 'Imaging', label: 'Hình ảnh' },
  { value: 'Procedure', label: 'Thủ thuật' },
]

const defaultForm = {
  name: '',
  roomNumber: '',
  clinicId: '',
  type: 'Consultation',
  capacity: 2,
  active: true,
}

const RoomManagement = () => {
  const { showToast } = useUIStore()
  const [rooms, setRooms] = useState([])
  const [clinics, setClinics] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [clinicFilter, setClinicFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [formData, setFormData] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = [...rooms]
    if (clinicFilter !== 'all') {
      filtered = filtered.filter(r => String(r.clinicId) === String(clinicFilter))
    }
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.roomNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredRooms(filtered)
  }, [rooms, searchQuery, clinicFilter])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [clinicsData, roomsData] = await Promise.all([
        adminApi.getClinics(),
        adminApi.getAllRooms(),
      ])
      setClinics(clinicsData || [])
      setRooms(roomsData || [])
    } catch {
      showToast({ type: 'error', message: 'Không thể tải dữ liệu' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast({ type: 'error', message: 'Tên phòng là bắt buộc' })
      return
    }
    if (!formData.clinicId) {
      showToast({ type: 'error', message: 'Phòng khám là bắt buộc' })
      return
    }

    setIsSubmitting(true)
    try {
      if (editingRoom) {
        await adminApi.updateRoom(editingRoom.id, formData)
        showToast({ type: 'success', message: 'Đã cập nhật phòng' })
      } else {
        await adminApi.createRoom(formData)
        showToast({ type: 'success', message: 'Đã thêm phòng' })
      }
      setShowModal(false)
      setEditingRoom(null)
      setFormData(defaultForm)
      fetchData()
    } catch {
      showToast({ type: 'error', message: 'Không thể lưu phòng' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (room) => {
    try {
      await adminApi.updateRoom(room.id, { active: !room.active })
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, active: !r.active } : r))
      showToast({ type: 'success', message: room.active ? 'Đã vô hiệu hóa phòng' : 'Đã kích hoạt phòng' })
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

  const getRoomTypeColor = (type) => {
    const colors = {
      Consultation: 'bg-sage-100 text-sage-800',
      Lab: 'bg-terra-100 text-terra-800',
      Imaging: 'bg-purple-100 text-purple-800',
      Procedure: 'bg-blue-100 text-blue-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">Quản lý Phòng</h1>
          <p className="text-sage-600">Quản lý các phòng khám trong hệ thống</p>
        </div>
        <Button onClick={() => setShowModal(true)} leftIcon={<Plus />}>Thêm phòng</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Tìm theo tên phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
            <Select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              options={clinicOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Room Grid */}
      {filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-sage-600" />
            </div>
            <h3 className="text-lg font-semibold text-sage-900 mb-2">Chưa có phòng</h3>
            <p className="text-sage-600 text-sm">Thêm phòng đầu tiên bằng cách nhấn nút trên</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sage-900">{room.name}</h3>
                      {room.roomNumber && (
                        <p className="text-xs text-sage-500">#{room.roomNumber}</p>
                      )}
                    </div>
                    <button onClick={() => handleToggleActive(room)} className="text-sage-400 hover:text-sage-600">
                      {room.active ? <ToggleRight className="w-5 h-5 text-sage-600" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <Badge className={getRoomTypeColor(room.type)}>{room.type}</Badge>
                    <Badge className={room.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                      {room.active ? 'Hoạt động' : 'Tạm ngừng'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-sage-600 mb-4">
                    {room.clinicName && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{room.clinicName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Sức chứa: {room.capacity} người</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setEditingRoom(room)
                      setFormData({
                        name: room.name,
                        roomNumber: room.roomNumber || '',
                        clinicId: room.clinicId || '',
                        type: room.type || 'Consultation',
                        capacity: room.capacity || 2,
                        active: room.active !== false,
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
        onClose={() => { setShowModal(false); setEditingRoom(null); setFormData(defaultForm) }}
        title={editingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên phòng *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Số phòng"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            />
          </div>
          <Select
            label="Phòng khám"
            value={formData.clinicId}
            onChange={(e) => setFormData({ ...formData, clinicId: e.target.value })}
            options={clinics.map(c => ({ value: c.id, label: c.name }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Loại phòng"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={ROOM_TYPES}
            />
            <Input
              label="Sức chứa (người)"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              min="1"
              max="20"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : editingRoom ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default RoomManagement
