import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LogOut, Menu } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'
import { ToastContainer } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import { doctorPrimaryActiveClass } from '@/pages/doctor/theme'
import { doctorWorkspaceSections, getDoctorWorkspaceItem } from './doctorWorkspaceConfig'

function formatHeaderDate(date) {
  const weekdayMap = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  const weekday = weekdayMap[date.getDay()]
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${weekday}, ${day}/${month}/${year}`
}

function DoctorWorkspaceSidebar({ pathname, onNavigate }) {
  const { user } = useAuthStore()

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <Link to="/dashboard" className="flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.name || user?.fullName} size="md" />
          <div className="min-w-0">
            <div className="truncate text-[17px] font-semibold text-slate-900">
              {user?.fullName || user?.name || 'Bác sĩ'}
            </div>
            <div className="truncate text-sm font-medium text-slate-500">
              {user?.email || 'Bác sĩ điều trị'}
            </div>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {doctorWorkspaceSections.map((section, sectionIndex) => (
            <div key={section.label || `section-${sectionIndex}`}>
              {section.label && (
                <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sage-600">
                  {section.label}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = item.matchers.some((matcher) =>
                    matcher.endsWith('/') ? pathname.startsWith(matcher) : pathname === matcher
                  )
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onNavigate}
                      className={cn(
                        'group flex items-center gap-3 rounded-[12px] px-3.5 py-3 text-[15px] font-medium transition-all',
                        isActive
                          ? `${doctorPrimaryActiveClass} shadow-[0_10px_22px_rgba(41,53,43,0.16)]`
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-[12px] transition-colors',
                          isActive
                            ? 'bg-white/10 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-white'
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="truncate">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DoctorWorkspaceLayout({ children }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, setSidebarOpen, toast, hideToast } = useUIStore()
  const activeItem = getDoctorWorkspaceItem(location.pathname)
  const pageTitle =
    location.pathname === '/account' ? 'Tài khoản bác sĩ' : activeItem?.name || 'Bảng điều khiển bác sĩ'
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    setShowProfileMenu(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="flex min-h-screen">
        <motion.aside
          initial={false}
          animate={{ x: sidebarOpen ? 0 : '-100%' }}
          className="fixed inset-y-0 left-0 z-40 w-[272px] border-r border-slate-200 shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:hidden"
        >
          <DoctorWorkspaceSidebar pathname={location.pathname} onNavigate={() => setSidebarOpen(false)} />
        </motion.aside>

        <aside className="hidden w-[272px] border-r border-slate-200 bg-white lg:block">
          <DoctorWorkspaceSidebar pathname={location.pathname} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 md:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-slate-200 text-slate-700 transition hover:bg-slate-100 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <div className="truncate text-[27px] font-semibold tracking-[-0.02em] text-slate-900">
                    {pageTitle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-[15px] font-medium text-slate-600 md:block">
                  {formatHeaderDate(new Date())}
                </div>

                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                    className="flex items-center gap-3 rounded-[12px] border border-slate-200 bg-white px-3.5 py-2.5 transition hover:bg-slate-50"
                  >
                    <Avatar src={user?.avatar} name={user?.name || user?.fullName} size="sm" />
                    <div className="hidden text-left md:block">
                      <div className="max-w-[180px] truncate text-[15px] font-semibold text-slate-900">
                        {user?.fullName || user?.name || 'Bác sĩ'}
                      </div>
                      <div className="text-sm font-normal text-slate-500">Bác sĩ</div>
                    </div>
                    <ChevronDown
                      className={cn(
                        'hidden h-4 w-4 text-slate-400 transition md:block',
                        showProfileMenu && 'rotate-180'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-3 w-56 overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
                      >
                        <div className="border-b border-slate-100 px-4 py-4">
                          <div className="truncate text-[15px] font-semibold text-slate-900">
                            {user?.fullName || user?.name || 'Bác sĩ'}
                          </div>
                          <div className="mt-1 truncate text-sm text-slate-500">{user?.email}</div>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/account"
                            className="block rounded-[10px] px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Tài khoản
                          </Link>
                          <button
                            type="button"
                            onClick={logout}
                            className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
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
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      <ChatbotWidget />
      <ToastContainer toast={toast} onClose={hideToast} />
    </div>
  )
}
