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
  BarChart3,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const patientNav = [
  { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Đặt lịch khám', path: '/appointments/book', icon: Calendar },
  { name: 'Lịch hẹn', path: '/appointments', icon: Clock },
  { name: 'Hồ sơ bệnh án', path: '/medical-records', icon: FileText },
  { name: 'Chỉ số sức khỏe', path: '/health-metrics', icon: Heart },
  { name: 'Tin nhắn', path: '/messages', icon: MessageSquare },
  { name: 'Gia đình', path: '/family', icon: Users },
]

const doctorNav = [
  { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Lịch hẹn', path: '/appointments', icon: Calendar },
  { name: 'Lịch làm việc', path: '/schedule', icon: Clock },
  { name: 'Bệnh nhân', path: '/patients', icon: Users },
  { name: 'Tư vấn', path: '/consultations', icon: Stethoscope },
  { name: 'Tin nhắn', path: '/messages', icon: MessageSquare },
  { name: 'Thống kê', path: '/analytics', icon: TrendingUp },
]

const adminNav = [
  { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Người dùng', path: '/users', icon: Users },
  { name: 'Bác sĩ', path: '/doctors', icon: Stethoscope },
  { name: 'Lịch hẹn', path: '/appointments', icon: Calendar },
  { name: 'Thống kê', path: '/analytics', icon: BarChart3 },
  { name: 'Cài đặt', path: '/settings', icon: Settings },
]

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
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className={cn(
          'fixed left-0 top-16 bottom-0 w-64 glass border-r border-sage-100 dark:border-sage-800 z-40 overflow-y-auto',
          'lg:sticky lg:translate-x-0'
        )}
      >
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-soft transition-all group relative overflow-hidden',
                  isActive
                    ? 'bg-sage-600 text-white shadow-soft'
                    : 'text-sage-700 dark:text-sage-300 hover:bg-sage-100 dark:hover:bg-sage-800'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-sage-600"
                    transition={{ type: 'spring', duration: 0.6 }}
                  />
                )}
                <Icon
                  className={cn(
                    'w-5 h-5 relative z-10',
                    isActive ? 'text-white' : 'text-sage-500 group-hover:text-sage-700 dark:group-hover:text-sage-200'
                  )}
                />
                <span className="font-medium relative z-10">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Quick stats or info */}
        <div className="p-4 mt-4 border-t border-sage-100 dark:border-sage-800">
          <div className="bg-gradient-to-br from-sage-500 to-terra-400 rounded-soft p-4 text-white">
            <p className="text-sm font-medium mb-2">Cần hỗ trợ?</p>
            <p className="text-xs opacity-90 mb-3">
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7.
            </p>
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Liên hệ hỗ trợ
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
