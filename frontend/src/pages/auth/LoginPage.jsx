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
    <div className="min-h-screen bg-cream-100 dark:bg-sage-950">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="hidden lg:flex lg:flex-col lg:justify-between">
          <div className="max-w-xl pt-12">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
              Patient-first booking experience
            </p>
            <h2 className="mt-4 text-5xl font-semibold tracking-tight text-sage-900 dark:text-cream-100">
              Đăng nhập để tiếp tục quản lý lịch hẹn, hồ sơ và chỉ số sức khỏe.
            </h2>
            <p className="mt-5 text-lg leading-8 text-sage-600 dark:text-sage-300">
              HealthFlow ưu tiên giao diện gọn gàng, trạng thái minh bạch và các hành động chính luôn ở đúng chỗ cần thiết.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { value: 'Một tài khoản', label: 'cho đặt lịch, thanh toán và hồ sơ' },
              { value: 'Nhắc lịch rõ ràng', label: 'cho bệnh nhân và gia đình' },
              { value: 'Theo dõi sức khỏe', label: 'với dữ liệu lịch sử gọn gàng' },
              { value: 'Hỗ trợ nhiều vai trò', label: 'bệnh nhân, bác sĩ, quản trị' },
            ].map((item) => (
              <div key={item.value} className="rounded-2xl border border-sage-100 bg-white/80 p-5 shadow-soft dark:border-sage-800 dark:bg-sage-900/70">
                <div className="text-base font-semibold text-sage-900 dark:text-cream-100">{item.value}</div>
                <div className="mt-1 text-sm text-sage-600 dark:text-sage-300">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-3xl border border-sage-100 bg-white/88 p-8 shadow-float dark:border-sage-800 dark:bg-sage-900/88"
        >
          {/* Logo */}
            <Link to="/" className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-terra-400 text-white shadow-soft">
                <span className="text-lg font-semibold">H</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-sage-900 dark:text-cream-100">
              HealthFlow
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-semibold tracking-tight text-sage-900 dark:text-cream-100">
              Chào mừng trở lại
            </h1>
            <p className="text-sage-600 dark:text-sage-300">
              Đăng nhập vào tài khoản của bạn để tiếp tục
            </p>
          </div>

          {/* Quick login buttons */}
            <div className="mb-6 rounded-2xl border border-sage-100 bg-gradient-to-r from-sage-50 to-cream-50 p-4 dark:border-sage-800 dark:from-sage-900 dark:to-sage-950">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-sage-500 dark:text-sage-300">Đăng nhập nhanh để demo</p>
            <div className="flex flex-wrap gap-2">
              {quickDemoLogins.map((demo) => (
                <button
                  key={demo.role}
                  data-testid={`quick-login-${String(demo.role).toLowerCase()}`}
                  onClick={() => handleQuickLogin(demo)}
                  disabled={quickLoginLoading !== null}
                    className="flex items-center gap-1 rounded-xl border border-sage-200 bg-white px-3 py-2 text-xs font-medium text-sage-700 transition-colors hover:bg-sage-50 disabled:opacity-50 dark:border-sage-700 dark:bg-sage-900 dark:text-sage-200 dark:hover:bg-sage-800"
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
                  <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <span className="text-sm text-sage-600 dark:text-sage-300">Ghi nhớ đăng nhập</span>
              </label>
                <Link to="/forgot-password" className="text-sm text-sage-600 hover:text-sage-900 dark:text-sage-300 dark:hover:text-cream-100">
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
            <p className="mt-6 text-center text-sage-600 dark:text-sage-300">
            Chưa có tài khoản?{' '}
              <Link to="/register" className="font-semibold text-sage-900 hover:text-brand-700 dark:text-cream-100 dark:hover:text-brand-300">
              Đăng ký
            </Link>
          </p>
        </motion.div>
      </div>
      </div>
    </div>
  )
}
