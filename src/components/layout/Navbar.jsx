import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Bell, Moon, Sun, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUIStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <nav className="glass sticky top-0 z-40 border-b border-sage-100 dark:border-sage-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-sage-100 dark:hover:bg-sage-800 transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-500 to-terra-400 flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="font-display font-bold text-xl text-sage-900 dark:text-cream-100">
                HealthFlow
              </span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-sage-100 dark:hover:bg-sage-800 transition-colors"
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
                <button className="p-2 rounded-lg hover:bg-sage-100 dark:hover:bg-sage-800 transition-colors relative">
                  <Bell className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-sage-100 dark:hover:bg-sage-800 transition-colors"
                  >
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 glass rounded-soft shadow-float border border-sage-100 dark:border-sage-800 overflow-hidden"
                      >
                        <div className="p-4 border-b border-sage-100 dark:border-sage-800">
                          <p className="font-semibold text-sage-900 dark:text-cream-100">{user.name}</p>
                          <p className="text-sm text-sage-600 dark:text-sage-400">{user.email}</p>
                          <p className="text-xs text-terra-600 dark:text-terra-400 mt-1 uppercase tracking-wide">
                            {user.role}
                          </p>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/profile"
                            className="block px-4 py-2 rounded-lg hover:bg-sage-100 dark:hover:bg-sage-800 transition-colors text-sage-700 dark:text-sage-300"
                          >
                            Cài đặt tài khoản
                          </Link>
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
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
