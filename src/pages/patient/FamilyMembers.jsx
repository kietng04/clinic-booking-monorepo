import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Edit2, Trash2, Calendar, Phone, User, Inbox } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { familyMemberApi } from '@/api/mockApi'
import { vi } from '@/lib/translations'

const FamilyMembers = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'MALE',
    relationship: 'SON',
    phone: '',
    medicalNotes: '',
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const data = await familyMemberApi.getFamilyMembers(user.id)
      setMembers(data)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải danh sách thành viên' })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleSave = async () => {
    try {
      if (editingMember) {
        await familyMemberApi.updateFamilyMember(editingMember.id, formData)
        showToast({ type: 'success', message: vi.family.memberUpdated })
      } else {
        await familyMemberApi.addFamilyMember({ ...formData, userId: user.id })
        showToast({ type: 'success', message: vi.family.memberAdded })
      }
      setShowModal(false)
      setEditingMember(null)
      setFormData({
        name: '',
        dateOfBirth: '',
        gender: 'MALE',
        relationship: 'SON',
        phone: '',
        medicalNotes: '',
      })
      fetchMembers()
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể lưu thông tin' })
    }
  }

  const handleEdit = (member) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender || 'MALE',
      relationship: member.relationship,
      phone: member.phone || '',
      medicalNotes: member.medicalNotes || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (memberId) => {
    if (!confirm(vi.family.confirmDelete)) return
    try {
      await familyMemberApi.deleteFamilyMember(memberId)
      showToast({ type: 'success', message: vi.family.memberDeleted })
      fetchMembers()
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể xóa thành viên' })
    }
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
            {vi.family.title}
          </h1>
          <p className="text-sage-600">Quản lý thông tin gia đình của bạn</p>
        </div>
        <Button onClick={() => setShowModal(true)} leftIcon={<Plus />}>
          {vi.family.addMember}
        </Button>
      </div>

      {members.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-sage-600" />
              </div>
              <h3 className="text-lg font-semibold text-sage-900 mb-2">
                {vi.family.noMembers}
              </h3>
              <p className="text-sage-600 mb-6">{vi.family.addFirst}</p>
              <Button onClick={() => setShowModal(true)}>
                {vi.family.addMember}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Avatar
                      src={member.avatar || `https://i.pravatar.cc/150?u=${member.id}`}
                      alt={member.name}
                      size="lg"
                    />
                    <Badge className="bg-sage-100 text-sage-800">
                      {vi.family.relationships[member.relationship] || member.relationship}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-sage-900 mb-1">
                    {member.name}
                  </h3>

                  <div className="space-y-2 text-sm text-sage-600 mb-4">
                    {member.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{calculateAge(member.dateOfBirth)} tuổi</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(member)}
                      leftIcon={<Edit2 className="w-4 h-4" />}
                      className="flex-1"
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingMember(null)
          setFormData({
            name: '',
            dateOfBirth: '',
            gender: 'MALE',
            relationship: 'SON',
            phone: '',
            medicalNotes: '',
          })
        }}
        title={editingMember ? vi.family.editMember : vi.family.addMember}
      >
        <div className="space-y-4">
          <Input
            label={vi.family.name}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label={vi.family.dateOfBirth}
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            required
          />

          <Select
            label={vi.family.gender}
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            options={[
              { value: 'MALE', label: vi.family.genders.MALE },
              { value: 'FEMALE', label: vi.family.genders.FEMALE },
            ]}
          />

          <Select
            label={vi.family.relationship}
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            options={Object.keys(vi.family.relationships).map(key => ({
              value: key,
              label: vi.family.relationships[key]
            }))}
          />

          <Input
            label={vi.family.phone}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label={vi.family.medicalNotes}
            as="textarea"
            rows={3}
            value={formData.medicalNotes}
            onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
          />

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

export default FamilyMembers
