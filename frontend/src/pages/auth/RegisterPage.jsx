import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const { showToast } = useUIStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT',
    specialization: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      showToast('Mật khẩu không khớp', 'error')
      return
    }

    if (formData.password.length < 8) {
      showToast('Mat khau phai co it nhat 8 ky tu', 'error')
      return
    }

    if (formData.role === 'DOCTOR' && !formData.specialization?.trim()) {
      showToast('Vui long nhap chuyen khoa cho bac si', 'error')
      return
    }

    try {
      // Map to backend format
      const { confirmPassword, name, ...rest } = formData
      const registerData = {
        ...rest,
        fullName: name, // Backend expects fullName
        role: formData.role,
      }

      await register(registerData)
      showToast('Đăng ký thành công!', 'success')
      navigate('/dashboard')
    } catch (error) {
      showToast(error.message || 'Đăng ký thất bại', 'error')
    }
  }

  const roleOptions = [
    { value: 'PATIENT', label: 'Bệnh nhân - Đặt lịch khám và quản lý sức khỏe' },
    { value: 'DOCTOR', label: 'Bác sĩ - Cung cấp dịch vụ y tế' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-terra-400 via-terra-500 to-sage-600 p-12 items-center justify-center relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-sage-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-lg text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-display font-bold mb-6"
          >
            Join our wellness community
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-white/90 leading-relaxed mb-12"
          >
            Experience healthcare reimagined with our modern platform designed for your convenience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            {[
              'Easy online appointment booking',
              'Secure medical records storage',
              'Real-time chat with doctors',
              'Family health management',
              'AI-powered health insights',
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Form */}
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
              Tạo tài khoản
            </h1>
            <p className="text-sage-600 dark:text-sage-400">
              Bắt đầu hành trình sức khỏe của bạn cùng chúng tôi ngay hôm nay
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Họ và tên"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Anderson"
              leftIcon={<User className="w-5 h-5" />}
              required
            />

            <Input
              label="Địa chỉ Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Số điện thoại"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              leftIcon={<Phone className="w-5 h-5" />}
              required
            />

            <Select
              label="I am a"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={roleOptions}
            />

            {formData.role === 'DOCTOR' && (
              <Input
                label="Chuyen khoa"
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Vi du: Noi tong quat"
                leftIcon={<User className="w-5 h-5" />}
                required
              />
            )}

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              helperText="Must be at least 8 characters"
              required
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              required
            />

            <div className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 rounded border-sage-300" required />
              <span className="text-sm text-sage-600 dark:text-sage-400">
                I agree to the{' '}
                <Link to="/terms" className="text-sage-900 dark:text-cream-100 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-sage-900 dark:text-cream-100 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Create Account
            </Button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sage-600 dark:text-sage-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-sage-900 dark:text-cream-100 hover:text-sage-700">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
