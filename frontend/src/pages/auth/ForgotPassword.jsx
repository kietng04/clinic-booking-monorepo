import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import apiClient from '@/api/authApi'

export function ForgotPassword() {
  const { showToast } = useUIStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.post('/api/auth/forgot-password', { email })
      setSuccess(true)
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Có lỗi xảy ra' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-sage-600 dark:text-sage-400 hover:text-sage-900 dark:hover:text-cream-100 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Quay lại đăng nhập</span>
        </Link>

        <div className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-8 shadow-lg">
          {!success ? (
            <>
              <div className="w-16 h-16 bg-sage-100 dark:bg-sage-700 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-sage-600 dark:text-sage-400" />
              </div>
              <h1 className="text-2xl font-display font-bold text-sage-900 dark:text-cream-100 mb-2">
                Quên mật khẩu?
              </h1>
              <p className="text-sage-600 dark:text-sage-400 mb-6">
                Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  leftIcon={<Mail className="w-5 h-5" />}
                  required
                />
                <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                  Gửi link đặt lại
                </Button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-display font-bold text-sage-900 dark:text-cream-100 mb-2">
                Email đã gửi!
              </h1>
              <p className="text-sage-600 dark:text-sage-400 mb-6">
                Kiểm tra inbox của bạn. Link đặt lại mật khẩu sẽ hết hiệu lực sau 24 giờ.
              </p>
              <Button variant="outline" className="w-full" onClick={() => { setSuccess(false); setEmail('') }}>
                Thử lại với email khác
              </Button>
            </motion.div>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-sage-500 dark:text-sage-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-sage-700 dark:text-sage-300 font-medium hover:underline">
            Đăng ký
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
