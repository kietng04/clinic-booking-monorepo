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
    <div className="min-h-screen bg-cream-100 dark:bg-sage-950">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="hidden lg:flex lg:flex-col lg:justify-between">
          <div className="max-w-xl pt-12">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
              Set up your workspace
            </p>
            <h2 className="mt-4 text-5xl font-semibold tracking-tight text-sage-900 dark:text-cream-100">
              Tạo tài khoản để bắt đầu đặt lịch, theo dõi hồ sơ và phối hợp chăm sóc sức khỏe.
            </h2>
            <p className="mt-5 text-lg leading-8 text-sage-600 dark:text-sage-300">
              Form đăng ký được ưu tiên khả năng đọc và điền nhanh, giảm các khối trang trí không phục vụ thao tác.
            </p>
          </div>

          <div className="space-y-4">
            {[
              'Đăng ký bệnh nhân hoặc bác sĩ trong cùng một luồng nhất quán',
              'Giữ các trường quan trọng trong một chiều đọc rõ ràng',
              'Tương thích với dashboard và patient flows sau khi đăng nhập',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-sage-100 bg-white/80 p-5 shadow-soft dark:border-sage-800 dark:bg-sage-900/70">
                <p className="text-sm text-sage-700 dark:text-sage-300">{item}</p>
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
              Tạo tài khoản
            </h1>
            <p className="text-sage-600 dark:text-sage-300">
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
              label="Vai trò"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={roleOptions}
            />

            {formData.role === 'DOCTOR' && (
              <Input
                label="Chuyên khoa"
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Ví dụ: Nội tổng quát"
                leftIcon={<User className="w-5 h-5" />}
                required
              />
            )}

            <Input
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              helperText="Tối thiểu 8 ký tự"
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
                <input type="checkbox" className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" required />
                <span className="text-sm text-sage-600 dark:text-sage-300">
                Tôi đồng ý với{' '}
                  <Link to="/terms" className="text-sage-900 hover:underline dark:text-cream-100">
                  Điều khoản dịch vụ
                </Link>{' '}
                và{' '}
                  <Link to="/privacy" className="text-sage-900 hover:underline dark:text-cream-100">
                  Chính sách riêng tư
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
              Tạo tài khoản
            </Button>
          </form>

          {/* Sign in link */}
            <p className="mt-6 text-center text-sage-600 dark:text-sage-300">
            Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-sage-900 hover:text-brand-700 dark:text-cream-100 dark:hover:text-brand-300">
              Đăng nhập
            </Link>
          </p>
        </motion.div>
      </div>
      </div>
    </div>
  )
}
