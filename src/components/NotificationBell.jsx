import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, CheckCheck, Trash2, Calendar, FileText, X, ExternalLink } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { notificationApi } from '@/api/notificationApiWrapper'
import { formatDate } from '@/lib/utils'

const NotificationBell = () => {
    const { user, isAuthenticated } = useAuthStore()
    const { showToast } = useUIStore()
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const dropdownRef = useRef(null)

    // Fetch unread count on mount and periodically
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return

        fetchUnreadCount()

        // Poll every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [isAuthenticated, user?.id])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationApi.getUnreadCount(user.id)
            setUnreadCount(count)
        } catch (error) {
            console.error('Failed to fetch notification count:', error)
        }
    }

    const fetchNotifications = async () => {
        setIsLoading(true)
        try {
            const data = await notificationApi.getNotifications(user.id, { size: 10 })
            setNotifications(data || [])
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBellClick = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            fetchNotifications()
        }
    }

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationApi.markAsRead(notificationId)
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
            )
            setUnreadCount((prev) => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead(user.id)
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
            setUnreadCount(0)
            showToast({ type: 'success', message: 'Đã đánh dấu tất cả đã đọc' })
        } catch (error) {
            showToast({ type: 'error', message: 'Không thể đánh dấu đã đọc' })
        }
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'APPOINTMENT_CREATED':
            case 'APPOINTMENT_CONFIRMED':
            case 'APPOINTMENT_CANCELLED':
            case 'APPOINTMENT_REMINDER':
                return <Calendar className="w-4 h-4" />
            case 'NEW_MEDICAL_RECORD':
                return <FileText className="w-4 h-4" />
            default:
                return <Bell className="w-4 h-4" />
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleBellClick}
                className="relative p-2 rounded-lg hover:bg-sage-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-sage-700" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-sage-200 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-sage-100 bg-sage-50">
                            <h3 className="font-semibold text-sage-900">Thông báo</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-sage-600 hover:text-sage-900 flex items-center gap-1"
                                >
                                    <CheckCheck className="w-3 h-3" />
                                    Đọc tất cả
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-80 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-sage-500">
                                    <div className="animate-pulse">Đang tải...</div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="w-10 h-10 text-sage-300 mx-auto mb-2" />
                                    <p className="text-sage-500 text-sm">Không có thông báo mới</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                        className={`px-4 py-3 border-b border-sage-50 hover:bg-sage-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-sage-50/50' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!notification.isRead
                                                        ? 'bg-sage-600 text-white'
                                                        : 'bg-sage-100 text-sage-500'
                                                    }`}
                                            >
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`text-sm ${!notification.isRead
                                                            ? 'font-medium text-sage-900'
                                                            : 'text-sage-700'
                                                        }`}
                                                >
                                                    {notification.title || notification.message}
                                                </p>
                                                {notification.message && notification.title && (
                                                    <p className="text-xs text-sage-500 mt-0.5 truncate">
                                                        {notification.message}
                                                    </p>
                                                )}
                                                <p className="text-xs text-sage-400 mt-1">
                                                    {formatDate(notification.createdAt)}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-sage-600 rounded-full flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 border-t border-sage-100 bg-sage-50 flex items-center justify-between">
                            <button
                                onClick={() => { setIsOpen(false); navigate('/notifications') }}
                                className="text-sm text-sage-600 hover:text-sage-900 flex items-center gap-1"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Xem tất cả
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-sage-500 hover:text-sage-700"
                            >
                                Đóng
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NotificationBell
