import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, Phone, Shield, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordStrengthBar } from '@/components/PasswordStrengthBar'
import { profileApi } from '@/api/profileApiWrapper'
import apiClient from '@/api/authApi'

export default function SecuritySettings() {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [emailVerified, setEmailVerified] = useState(user?.emailVerified || false)
  const [phoneVerified, setPhoneVerified] = useState(user?.phoneVerified || false)
  const [verifyEmailLoading, setVerifyEmailLoading] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      showToast({ type: 'error', message: 'Mật khẩu không khớp' })
      return
    }
    if (passwords.new.length < 8) {
      showToast({ type: 'error', message: 'Mật khẩu phải có ít nhất 8 ký tự' })
      return
    }
    setPasswordLoading(true)
    try {
      await profileApi.changePassword(passwords.current, passwords.new)
      setPasswords({ current: '', new: '', confirm: '' })
      showToast({ type: 'success', message: 'Mật khẩu đã được thay đổi!' })
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Mật khẩu hiện tại không đúng' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSendEmailVerification = async () => {
    setVerifyEmailLoading(true)
    try {
      await apiClient.post('/api/auth/send-email-verification')
      showToast({ type: 'success', message: 'Email xác minh đã được gửi!' })
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Không thể gửi email' })
    } finally {
      setVerifyEmailLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-sage-900 dark:text-cream-100">Bảo mật tài khoản</h1>
        <p className="text-sage-600 dark:text-sage-400 mt-1">Quản lý mật khẩu và xác minh</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sage-100 dark:bg-sage-700 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-sage-600 dark:text-sage-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sage-900 dark:text-cream-100">Xác minh Email</h3>
                <p className="text-sm text-sage-500 dark:text-sage-400">{user?.email}</p>
              </div>
            </div>
            {emailVerified ? (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" /> Đã xác minh
              </span>
            ) : (
              <Button variant="outline" size="sm" isLoading={verifyEmailLoading} onClick={handleSendEmailVerification}>
                Xác minh ngay
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sage-100 dark:bg-sage-700 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-sage-600 dark:text-sage-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sage-900 dark:text-cream-100">Xác minh Điện thoại</h3>
                <p className="text-sm text-sage-500 dark:text-sage-400">+84 xxx xxx xxx</p>
              </div>
            </div>
            {phoneVerified ? (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" /> Đã xác minh
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                <AlertCircle className="w-3 h-3" /> Chưa xác minh
              </span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sage-100 dark:bg-sage-700 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-sage-600 dark:text-sage-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sage-900 dark:text-cream-100">Thay đổi mật khẩu</h3>
              <p className="text-sm text-sage-500 dark:text-sage-400">Đặt mật khẩu mới</p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input label="Mật khẩu hiện tại" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="••••••••" leftIcon={<Lock className="w-5 h-5" />} required />
            <Input label="Mật khẩu mới" type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} placeholder="••••••••" leftIcon={<Lock className="w-5 h-5" />} required />
            <PasswordStrengthBar password={passwords.new} />
            <Input label="Xác nhận mật khẩu mới" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="••••••••" leftIcon={<Lock className="w-5 h-5" />} required />
            {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
              <p className="text-sm text-red-600">Mật khẩu không khớp</p>
            )}
            <Button type="submit" className="w-full" isLoading={passwordLoading}>Cập nhật mật khẩu</Button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
