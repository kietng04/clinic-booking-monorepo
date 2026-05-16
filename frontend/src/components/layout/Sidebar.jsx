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
  Wallet,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import { repairReactNode } from '@/utils/repairReactMojibake'

const patientNav = [
  { name: 'TÃ¡Â»â€¢ng quan', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Ã„ÂÃ¡ÂºÂ·t lÃ¡Â»â€¹ch khÃƒÂ¡m', path: '/appointments/book', icon: Calendar },
  { name: 'TÃ†Â° vÃ¡ÂºÂ¥n trÃ¡Â»Â±c tuyÃ¡ÂºÂ¿n', path: '/patient/consultations', icon: Stethoscope },
  { name: 'LÃ¡Â»â€¹ch hÃ¡ÂºÂ¹n', path: '/appointments', icon: Clock },
  { name: 'HÃ¡Â»â€œ sÃ†Â¡ bÃ¡Â»â€¡nh ÃƒÂ¡n', path: '/medical-records', icon: FileText },
  { name: 'LÃ¡Â»â€¹ch sÃ¡Â»Â­ thanh toÃƒÂ¡n', path: '/payments', icon: CreditCard },
  { name: 'ChÃ¡Â»â€° sÃ¡Â»â€˜ sÃ¡Â»Â©c khÃ¡Â»Âe', path: '/health-metrics', icon: Heart },
  { name: 'ThÃƒÂ´ng bÃƒÂ¡o', path: '/notifications', icon: Bell },
  { name: 'Tin nhÃ¡ÂºÂ¯n', path: '/patient/consultations', icon: MessageSquare },
  { name: 'Gia Ã„â€˜ÃƒÂ¬nh', path: '/family', icon: Users },
  { name: 'TÃƒÂ i khoÃ¡ÂºÂ£n', path: '/profile', icon: Settings },
]

const doctorNav = [
  { name: 'TÃ¡Â»â€¢ng quan', path: '/dashboard', icon: LayoutDashboard },
  { name: 'LÃ¡Â»â€¹ch hÃ¡ÂºÂ¹n', path: '/doctor/appointments', icon: Calendar },
  { name: 'LÃ¡Â»â€¹ch lÃƒÂ m viÃ¡Â»â€¡c', path: '/schedule', icon: Clock },
  { name: 'BÃ¡Â»â€¡nh nhÃƒÂ¢n', path: '/patients', icon: Users },
  { name: 'TÃ†Â° vÃ¡ÂºÂ¥n', path: '/consultations', icon: Stethoscope },
  { name: 'Tin nhÃ¡ÂºÂ¯n', path: '/consultations', icon: MessageSquare },
  { name: 'ThÃ¡Â»â€˜ng kÃƒÂª', path: '/doctor/analytics', icon: TrendingUp },
  { name: 'TÃƒÂ i khoÃ¡ÂºÂ£n', path: '/profile', icon: Settings },
]

const adminNav = [
  { name: 'TÃ¡Â»â€¢ng quan', path: '/dashboard', icon: LayoutDashboard },
  { name: 'NgÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng', path: '/users', icon: Users },
  { name: 'BÃƒÂ¡c sÃ„Â©', path: '/doctors', icon: Stethoscope },
  { name: 'PhÃƒÂ²ng khÃƒÂ¡m', path: '/admin/clinics', icon: Building2 },
  { name: 'DÃ¡Â»â€¹ch vÃ¡Â»Â¥', path: '/admin/services', icon: Wrench },
  { name: 'PhÃƒÂ²ng', path: '/admin/rooms', icon: UserCog },
  { name: 'BÃƒÂ¡o cÃƒÂ¡o', path: '/admin/reports', icon: BarChart2 },
  { name: 'HoÃƒÂ n tiÃ¡Â»Ân', path: '/admin/refunds', icon: Wallet },
  { name: 'TÃƒÂ i khoÃ¡ÂºÂ£n', path: '/profile', icon: Settings },
]

function SidebarContent({ navigation, pathname }) {
  return repairReactNode(
    <nav className="p-4 space-y-2">
      {navigation.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.path
        const normalizedPath = item.path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()

        return (
          <Link
            key={`${item.path}-${item.name}`}
            to={item.path}
            data-testid={`sidebar-link-${normalizedPath}`}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        data-testid={`sidebar-${String(user.role || 'unknown').toLowerCase()}`}
        className="fixed left-0 top-16 bottom-0 w-64 glass border-r border-sage-100 dark:border-sage-800 z-40 overflow-y-auto lg:hidden"
      >
        <SidebarContent navigation={navigation} pathname={location.pathname} />
      </motion.aside>

      <aside
        data-testid={`sidebar-desktop-${String(user.role || 'unknown').toLowerCase()}`}
        className="hidden lg:block lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 glass border-r border-sage-100 dark:border-sage-800 overflow-y-auto"
      >
        <SidebarContent navigation={navigation} pathname={location.pathname} />
      </aside>
    </>
  )
}
