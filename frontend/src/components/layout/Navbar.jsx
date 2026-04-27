import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Moon, Sun, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import NotificationBell from '../NotificationBell'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUIStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <nav className="sticky top-0 z-40 border-b border-sage-100 bg-cream-50/95 backdrop-blur-sm dark:border-sage-800 dark:bg-sage-950/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={toggleSidebar}
                className="rounded-lg p-2 transition-colors hover:bg-sage-100 dark:hover:bg-sage-800 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-terra-400 text-white shadow-soft">
                <span className="text-lg font-semibold">H</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-sage-900 dark:text-cream-100">
                HealthFlow
              </span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 transition-colors hover:bg-sage-100 dark:hover:bg-sage-800"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-sage-600" />
              ) : (
                <Sun className="w-5 h-5 text-cream-200" />
              )}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <NotificationBell />

                {/* Profile menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-sage-100 dark:hover:bg-sage-800"
                  >
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-sage-100 bg-white shadow-float dark:border-sage-800 dark:bg-sage-900"
                      >
                        <div className="border-b border-sage-100 p-4 dark:border-sage-800">
                          <p className="font-semibold text-sage-900 dark:text-cream-100">{user.name}</p>
                          <p className="text-sm text-sage-600 dark:text-sage-300">{user.email}</p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-brand-700 dark:text-brand-300">
                            {user.role}
                          </p>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/profile"
                            className="block rounded-lg px-4 py-2 text-sage-700 transition-colors hover:bg-sage-100 dark:text-sage-200 dark:hover:bg-sage-800"
                          >
                            Cài đặt tài khoản
                          </Link>
                          <button
                            onClick={logout}
                            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                          >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Bắt đầu</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
