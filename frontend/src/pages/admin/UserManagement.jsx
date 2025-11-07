import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Mail, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Loading'
import { useUIStore } from '@/store/uiStore'
import { userApi } from '@/api/userApiWrapper'
import { formatPhone } from '@/lib/utils'
import { vi } from '@/lib/translations'

const UserManagement = () => {
  const { showToast } = useUIStore()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'PATIENT',
    password: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const data = await userApi.getUsers({ size: 200 })
      const normalized = (data || []).map(user => ({
        ...user,
        name: user.name || user.fullName,
        avatar: user.avatar || user.avatarUrl,
      }))
      setUsers(normalized)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải danh sách người dùng' })
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }

  const handleSave = async () => {
    try {
      if (editingUser) {
        const payload = {
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
        }
        await userApi.updateUser(editingUser.id, payload)
        showToast({ type: 'success', message: vi.admin.users.userUpdated })
      } else {
        const payload = {
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password,
        }
        await userApi.createUser(payload)
        showToast({ type: 'success', message: vi.admin.users.userAdded })
      }
      setShowModal(false)
      setEditingUser(null)
      setFormData({ name: '', email: '', phone: '', role: 'PATIENT', password: '' })
      fetchUsers()
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể lưu người dùng' })
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm(vi.admin.users.confirmDelete)) return
    try {
      await userApi.deleteUser(userId)
      showToast({ type: 'success', message: vi.admin.users.userDeleted })
      fetchUsers()
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể xóa người dùng' })
    }
  }

  const getRoleBadge = (role) => {
    const badges = {
      PATIENT: 'bg-sage-100 text-sage-800',
      DOCTOR: 'bg-terra-100 text-terra-800',
      ADMIN: 'bg-purple-100 text-purple-800',
    }
    return badges[role] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
            {vi.admin.users.title}
          </h1>
          <p className="text-sage-600">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <Button onClick={() => setShowModal(true)} leftIcon={<Plus />}>
          {vi.admin.users.addUser}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Tất cả vai trò' },
                { value: 'PATIENT', label: 'Bệnh nhân' },
                { value: 'DOCTOR', label: 'Bác sĩ' },
                { value: 'ADMIN', label: 'Quản trị viên' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar
                    src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
                    alt={user.name}
                    size="lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sage-900">{user.name}</h3>
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-sage-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span className="break-all">{formatPhone(user.phone)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingUser(user)
                      setFormData({
                        name: user.name,
                        email: user.email,
                        phone: user.phone || '',
                        role: user.role,
                        password: '',
                      })
                      setShowModal(true)
                    }}
                    leftIcon={<Edit2 className="w-4 h-4" />}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingUser(null)
          setFormData({ name: '', email: '', phone: '', role: 'PATIENT', password: '' })
        }}
        title={editingUser ? vi.admin.users.editUser : vi.admin.users.addUser}
      >
        <div className="space-y-4">
          <Input
            label="Họ và tên"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Select
            label={vi.admin.users.role}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            disabled={!!editingUser}
            options={[
              { value: 'PATIENT', label: 'Bệnh nhân' },
              { value: 'DOCTOR', label: 'Bác sĩ' },
              { value: 'ADMIN', label: 'Quản trị viên' },
            ]}
          />
          {!editingUser && (
            <Input
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              {vi.common.cancel}
            </Button>
            <Button onClick={handleSave}>{vi.common.save}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default UserManagement
