import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordStrengthBar } from '@/components/PasswordStrengthBar'
import apiClient from '@/api/authApi'

export function ResetPassword() {
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [state, setState] = useState({ newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      apiClient.get('/api/auth/validate-reset-token', { params: { token } })
        .then((res) => setTokenValid(res.data.valid))
        .catch(() => setTokenValid(false))
    } else {
      setTokenValid(false)
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (state.newPassword !== state.confirmPassword) {
      showToast({ type: 'error', message: 'Mật khẩu không khớp' })
      return
    }
    if (state.newPassword.length < 8) {
      showToast({ type: 'error', message: 'Mật khẩu phải có ít nhất 8 ký tự' })
      return
    }
    setLoading(true)
    try {
      await apiClient.post('/api/auth/reset-password', { token, newPassword: state.newPassword })
      setSuccess(true)
      showToast({ type: 'success', message: 'Mật khẩu đã được đặt lại thành công!' })
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Token hết hiệu lực' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-display font-bold text-sage-900 dark:text-cream-100 mb-2">Thành công!</h1>
            <p className="text-sage-600 dark:text-sage-400 mb-6">Mật khẩu đã được đặt lại. Đăng nhập bằng mật khẩu mới.</p>
            <Button className="w-full" onClick={() => navigate('/login')}>Đăng nhập</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-display font-bold text-sage-900 dark:text-cream-100 mb-2">Link hết hiệu lực</h1>
            <p className="text-sage-600 dark:text-sage-400 mb-6">Link đặt lại mật khẩu đã hết hiệu lực hoặc đã được sử dụng.</p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/forgot-password')}>Yêu cầu link mới</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sage-600 dark:text-sage-400 hover:text-sage-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Quay lại đăng nhập</span>
        </Link>
        <div className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-8 shadow-lg">
          <div className="w-16 h-16 bg-sage-100 dark:bg-sage-700 rounded-2xl flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-sage-600 dark:text-sage-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-sage-900 dark:text-cream-100 mb-2">Đặt lại mật khẩu</h1>
          <p className="text-sage-600 dark:text-sage-400 mb-6">Nhập mật khẩu mới của bạn.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Mật khẩu mới" type="password" value={state.newPassword} onChange={(e) => setState({ ...state, newPassword: e.target.value })} placeholder="••••••••" leftIcon={<Lock className="w-5 h-5" />} required />
            <PasswordStrengthBar password={state.newPassword} />
            <Input label="Xác nhận mật khẩu" type="password" value={state.confirmPassword} onChange={(e) => setState({ ...state, confirmPassword: e.target.value })} placeholder="••••••••" leftIcon={<Lock className="w-5 h-5" />} required />
            {state.newPassword && state.confirmPassword && state.newPassword !== state.confirmPassword && (
              <p className="text-sm text-red-600">Mật khẩu không khớp</p>
            )}
            <Button type="submit" className="w-full" size="lg" isLoading={loading}>Đặt lại mật khẩu</Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
