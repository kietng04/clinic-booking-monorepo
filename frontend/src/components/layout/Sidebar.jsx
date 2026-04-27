import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  MessageSquare,
  Heart,
  Settings,
  TrendingUp,
  Clock,
  Stethoscope,
  UserCog,
  Bell,
  Building2,
  Wrench,
  BarChart2,
  CreditCard,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const patientNav = [
  { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Đặt lịch khám', path: '/appointments/book', icon: Calendar },
  { name: 'Tư vấn trực tuyến', path: '/patient/consultations', icon: Stethoscope },
  { name: 'Lịch hẹn', path: '/appointments', icon: Clock },
  { name: 'Hồ sơ bệnh án', path: '/medical-records', icon: FileText },
  { name: 'Lịch sử thanh toán', path: '/payments', icon: CreditCard },
  { name: 'Chỉ số sức khỏe', path: '/health-metrics', icon: Heart },
  { name: 'Thông báo', path: '/notifications', icon: Bell },
  { name: 'Tin nhắn', path: '/patient/consultations', icon: MessageSquare },
  { name: 'Gia đình', path: '/family', icon: Users },
  { name: 'Tài khoản', path: '/profile', icon: Settings },
]

const doctorNav = [
  { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Lịch hẹn', path: '/doctor/appointments', icon: Calendar },
  { name: 'Lịch làm việc', path: '/schedule', icon: Clock },
  { name: 'Bệnh nhân', path: '/patients', icon: Users },
  { name: 'Tư vấn', path: '/consultations', icon: Stethoscope },
  { name: 'Tin nhắn', path: '/consultations', icon: MessageSquare },
  { name: 'Thống kê', path: '/doctor/analytics', icon: TrendingUp },
  { name: 'Tài khoản', path: '/profile', icon: Settings },
]

const adminNav = [
  { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Người dùng', path: '/users', icon: Users },
  { name: 'Bác sĩ', path: '/doctors', icon: Stethoscope },
  { name: 'Phòng khám', path: '/admin/clinics', icon: Building2 },
  { name: 'Dịch vụ', path: '/admin/services', icon: Wrench },
  { name: 'Phòng', path: '/admin/rooms', icon: UserCog },
  { name: 'Báo cáo', path: '/admin/reports', icon: BarChart2 },
  { name: 'Tài khoản', path: '/profile', icon: Settings },
]

function SidebarContent({ navigation, pathname }) {
  return (
    <>
      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          const normalizedPath = item.path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()

          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`sidebar-link-${normalizedPath}`}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
                isActive
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-sage-700 hover:bg-sage-100 dark:text-sage-200 dark:hover:bg-sage-800'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-y-2 left-0 w-1 rounded-full bg-white/80"
                  transition={{ type: 'spring', duration: 0.6 }}
                />
              )}
              <Icon
                className={cn(
                  'relative z-10 h-5 w-5',
                  isActive ? 'text-white' : 'text-sage-400 group-hover:text-sage-700 dark:group-hover:text-cream-100'
                )}
              />
              <span className="relative z-10 font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export function Sidebar() {
  const { user } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const location = useLocation()

  if (!user) return null

  const navigation =
    user.role === 'PATIENT' ? patientNav :
      user.role === 'DOCTOR' ? doctorNav :
        adminNav

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-sage-950/40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        data-testid={`sidebar-${String(user.role || 'unknown').toLowerCase()}`}
        className="fixed bottom-0 left-0 top-16 z-40 w-64 overflow-y-auto border-r border-sage-100 bg-white/95 backdrop-blur-sm dark:border-sage-800 dark:bg-sage-950 lg:hidden"
      >
        <SidebarContent navigation={navigation} pathname={location.pathname} />
      </motion.aside>

      <aside
        data-testid={`sidebar-desktop-${String(user.role || 'unknown').toLowerCase()}`}
        className="hidden overflow-y-auto border-r border-sage-100 bg-white/80 backdrop-blur-sm dark:border-sage-800 dark:bg-sage-950 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:w-64"
      >
        <SidebarContent navigation={navigation} pathname={location.pathname} />
      </aside>
    </>
  )
}
