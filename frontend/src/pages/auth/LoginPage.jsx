import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getQuickDemoLogins } from '@/config/demoAccounts'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const { showToast } = useUIStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [quickLoginLoading, setQuickLoginLoading] = useState(null)
  const quickDemoLogins = getQuickDemoLogins()

  const handleSubmit = async (e) => {
    e?.preventDefault()
    try {
      await login(formData.email, formData.password)
      showToast({ type: 'success', message: 'Đăng nhập thành công!' })
      navigate('/dashboard')
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Thông tin đăng nhập không hợp lệ' })
    }
  }

  const handleQuickLogin = async (demo) => {
    setQuickLoginLoading(demo.role)
    try {
      const loginAttempts = [
        { email: demo.email, password: demo.password },
        ...(demo.fallbacks || []),
      ]

      let lastError = null
      for (const credentials of loginAttempts) {
        try {
          await login(credentials.email, credentials.password)
          showToast({ type: 'success', message: 'Đăng nhập thành công!' })
          navigate('/dashboard')
          return
        } catch (error) {
          lastError = error
        }
      }

      throw lastError || new Error('Đăng nhập thất bại')
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Đăng nhập thất bại' })
    } finally {
      setQuickLoginLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sage-500 to-terra-400 flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="font-display font-bold text-2xl text-sage-900 dark:text-cream-100">
              HealthFlow
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-sage-900 dark:text-cream-100 mb-2">
              Chào mừng trở lại
            </h1>
            <p className="text-sage-600 dark:text-sage-400">
              Đăng nhập vào tài khoản của bạn để tiếp tục
            </p>
          </div>

          {/* Quick login buttons */}
          <div className="mb-6 p-4 bg-sage-50 dark:bg-sage-900/50 rounded-soft border border-sage-200 dark:border-sage-800">
            <p className="text-xs font-medium text-sage-600 dark:text-sage-400 mb-3">Đăng nhập nhanh để Demo:</p>
            <div className="flex flex-wrap gap-2">
              {quickDemoLogins.map((demo) => (
                <button
                  key={demo.role}
                  data-testid={`quick-login-${String(demo.role).toLowerCase()}`}
                  onClick={() => handleQuickLogin(demo)}
                  disabled={quickLoginLoading !== null}
                  className="px-3 py-1.5 bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-lg text-xs font-medium text-sage-700 dark:text-sage-300 hover:bg-sage-100 dark:hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {quickLoginLoading === demo.role && <Loader2 className="w-3 h-3 animate-spin" />}
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email hoặc Số điện thoại"
              type="text"
              data-testid="login-email-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              data-testid="login-password-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-sage-300" />
                <span className="text-sm text-sage-600 dark:text-sage-400">Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-sage-600 dark:text-sage-400 hover:text-sage-900 dark:hover:text-cream-100">
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              data-testid="login-submit-button"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Đăng nhập
            </Button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sage-600 dark:text-sage-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-sage-900 dark:text-cream-100 hover:text-sage-700">
              Đăng ký
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Decorative */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-sage-500 via-sage-600 to-terra-500 p-12 items-center justify-center relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-terra-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-lg text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-display font-bold mb-6"
          >
            Sức khỏe của bạn, ưu tiên của chúng tôi
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-white/90 leading-relaxed"
          >
            Kết nối với các chuyên gia y tế, quản lý lịch hẹn và kiểm soát hành trình chăm sóc sức khỏe của bạn.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 grid grid-cols-2 gap-6"
          >
            {[
              { value: '50K+', label: 'Bệnh nhân hài lòng' },
              { value: '200+', label: 'Bác sĩ chuyên gia' },
              { value: '98%', label: 'Tỷ lệ hài lòng' },
              { value: '24/7', label: 'Hỗ trợ luôn sẵn sàng' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-soft p-4">
                <div className="text-3xl font-display font-bold">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
