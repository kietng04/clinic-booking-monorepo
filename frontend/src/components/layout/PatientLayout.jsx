import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar } from '@/components/ui/Avatar'
import NotificationBell from '@/components/NotificationBell'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'
import { ToastContainer } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

const patientNavLinks = [
  { label: 'Trang chủ', to: '/dashboard' },
  { label: 'Tư vấn trực tuyến', to: '/find-doctors?scope=doctor&bookingType=consultation' },
]

const bookingNavLinks = [
  { label: 'Đặt lịch khám bác sĩ', to: '/find-doctors?scope=doctor' },
  { label: 'Đặt lịch khám bệnh viện', to: '/find-doctors?scope=hospital' },
  { label: 'Đặt lịch khám phòng khám', to: '/find-doctors?scope=clinic' },
]

function PatientNavLink({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'rounded-md px-4 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-sage-900 text-white'
            : 'text-sage-700 hover:bg-sage-100 hover:text-sage-900'
        )
      }
    >
      {label}
    </NavLink>
  )
}

export function PatientLayout({ children }) {
  const { user, logout } = useAuthStore()
  const { toast, hideToast } = useUIStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showBookingMenu, setShowBookingMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f3f5f2] text-sage-900">
      <header className="sticky top-0 z-40 border-b border-sage-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sage-900 text-white shadow-sm">
                <span className="text-lg font-bold">H</span>
              </div>
              <div>
                <div className="font-display text-xl font-bold leading-none text-sage-950">HealthFlow</div>
                <div className="mt-1 text-xs text-sage-500">Đặt lịch khám</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 xl:flex">
              <PatientNavLink {...patientNavLinks[0]} />

              <div
                className="relative"
                onMouseEnter={() => setShowBookingMenu(true)}
                onMouseLeave={() => setShowBookingMenu(false)}
              >
                <button
                  type="button"
                  onClick={() => setShowBookingMenu((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-100 hover:text-sage-900"
                >
                  Đặt lịch khám
                  <ChevronDown className={`h-4 w-4 transition-transform ${showBookingMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showBookingMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-md border border-sage-200 bg-white shadow-lg shadow-sage-900/10"
                    >
                      <div className="p-2">
                        {bookingNavLinks.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setShowBookingMenu(false)}
                            className="block rounded-md px-3 py-2.5 text-sm text-sage-700 transition-colors hover:bg-sage-50 hover:text-sage-950"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {patientNavLinks.slice(1).map((item) => (
                <PatientNavLink key={item.to} to={item.to} label={item.label} />
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <NotificationBell />

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="flex items-center gap-3 rounded-md border border-sage-200 bg-white px-2 py-1.5 transition-colors hover:bg-sage-50"
              >
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <div className="pr-2 text-left">
                  <div className="max-w-[140px] truncate text-sm font-semibold">{user?.name}</div>
                  <div className="text-xs text-sage-500">Bệnh nhân</div>
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-3 w-64 overflow-hidden rounded-md border border-sage-200 bg-white shadow-lg shadow-sage-900/10"
                  >
                    <div className="border-b border-sage-100 px-5 py-4">
                      <div className="font-semibold">{user?.name}</div>
                      <div className="mt-1 text-sm text-sage-500">{user?.email}</div>
                    </div>
                    <div className="p-3">
                      <Link
                        to="/account"
                        onClick={() => setShowProfileMenu(false)}
                        className="block rounded-md px-4 py-3 text-sm text-sage-700 transition-colors hover:bg-sage-50"
                      >
                        Tài khoản
                      </Link>
                      <Link
                        to="/appointments"
                        onClick={() => setShowProfileMenu(false)}
                        className="block rounded-md px-4 py-3 text-sm text-sage-700 transition-colors hover:bg-sage-50"
                      >
                        Lịch đặt hẹn
                      </Link>
                      <Link
                        to="/payments"
                        onClick={() => setShowProfileMenu(false)}
                        className="block rounded-md px-4 py-3 text-sm text-sage-700 transition-colors hover:bg-sage-50"
                      >
                        Lịch sử thanh toán
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="block rounded-md px-4 py-3 text-sm text-sage-700 transition-colors hover:bg-sage-50"
                      >
                        Hồ sơ bệnh nhân
                      </Link>
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 rounded-md px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex rounded-md border border-sage-200 bg-white p-2.5 text-sage-700 xl:hidden"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-sage-200 bg-white xl:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-500">Đặt lịch khám</div>
                  <div className="flex flex-col gap-2">
                    {bookingNavLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-md border border-sage-200 px-4 py-3 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50 hover:text-sage-950"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {patientNavLinks.map((item) => (
                    <PatientNavLink
                      key={item.to}
                      to={item.to}
                      label={item.label}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <footer className="border-t border-sage-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-sage-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="font-semibold text-sage-900">HealthFlow cho bệnh nhân</div>
        </div>
      </footer>

      <ChatbotWidget />
      <ToastContainer toast={toast} onClose={hideToast} />
    </div>
  )
}

export default PatientLayout
