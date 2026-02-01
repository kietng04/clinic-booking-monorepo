import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Camera, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { profileApi } from '@/api/profileApiWrapper'

export default function ProfileSettings() {
  const { user, updateUser } = useAuthStore()
  const { showToast } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    avatarUrl: '',
  })

  useEffect(() => {
    profileApi.getProfile().then((data) => {
      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        avatarUrl: data.avatarUrl || '',
      })
      setLoading(false)
    }).catch(() => {
      setFormData({ fullName: user?.name || '', phone: '', dateOfBirth: '', gender: '', avatarUrl: user?.avatar || '' })
      setLoading(false)
    })
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await profileApi.updateProfile(formData)
      updateUser({ name: updated.fullName, avatar: updated.avatarUrl })
      showToast({ type: 'success', message: 'Thông tin đã được cập nhật!' })
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Cập nhật thất bại' })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const url = reader.result
      setFormData({ ...formData, avatarUrl: url })
      profileApi.uploadAvatar(url).catch(() => {})
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-sage-900 dark:text-cream-100">Cài đặt tài khoản</h1>
        <p className="text-sage-600 dark:text-sage-400 mt-1">Quản lý thông tin hồ sơ của bạn</p>
      </div>

      <div className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-8 space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 group">
            <img
              src={formData.avatarUrl || `https://i.pravatar.cc/150?u=${user?.email}`}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-sage-700 shadow-lg"
            />
            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <p className="text-sm text-sage-500 mt-2">Hover để thay đổi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Họ tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Nguyễn Văn A"
            leftIcon={<User className="w-5 h-5" />}
          />
          <Input
            label="Số điện thoại"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0912345678"
          />
          <Input
            label="Ngày sinh"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2">Giới tính</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-sage-300 dark:border-sage-600 bg-white dark:bg-sage-700 text-sage-900 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="">Chọn giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <Button type="submit" className="w-full" size="lg" isLoading={saving}>
            Lưu thay đổi
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
