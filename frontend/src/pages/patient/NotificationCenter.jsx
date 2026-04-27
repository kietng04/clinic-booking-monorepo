import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Calendar,
  FileText,
  CreditCard,
  Settings,
  CheckCheck,
  Trash2,
  Filter,
  X,
  Inbox,
  ArrowLeft
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Loading'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { notificationApi } from '@/api/notificationApiWrapper'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'
import { formatDate } from '@/lib/utils'

const NOTIFICATION_TYPES = {
  ALL: 'all',
  APPOINTMENT: 'appointment',
  MEDICAL_RECORD: 'medical_record',
  PAYMENT: 'payment',
  SYSTEM: 'system',
}

const TYPE_LABELS = {
  [NOTIFICATION_TYPES.ALL]: 'Tất cả',
  [NOTIFICATION_TYPES.APPOINTMENT]: 'Lịch hẹn',
  [NOTIFICATION_TYPES.MEDICAL_RECORD]: 'Hồ sơ y tế',
  [NOTIFICATION_TYPES.PAYMENT]: 'Thanh toán',
  [NOTIFICATION_TYPES.SYSTEM]: 'Hệ thống',
}

const getTypeCategory = (type) => {
  if (!type) return NOTIFICATION_TYPES.SYSTEM
  const upper = type.toUpperCase()
  if (upper.includes('APPOINTMENT') || upper.includes('FEEDBACK')) return NOTIFICATION_TYPES.APPOINTMENT
  if (upper.includes('MEDICAL') || upper.includes('LAB') || upper.includes('PRESCRIPTION')) return NOTIFICATION_TYPES.MEDICAL_RECORD
  if (upper.includes('PAYMENT')) return NOTIFICATION_TYPES.PAYMENT
  return NOTIFICATION_TYPES.SYSTEM
}

const getNotificationIcon = (type) => {
  const category = getTypeCategory(type)
  switch (category) {
    case NOTIFICATION_TYPES.APPOINTMENT:
      return { Icon: Calendar, color: 'bg-sage-100 text-sage-600' }
    case NOTIFICATION_TYPES.MEDICAL_RECORD:
      return { Icon: FileText, color: 'bg-terra-100 text-terra-600' }
    case NOTIFICATION_TYPES.PAYMENT:
      return { Icon: CreditCard, color: 'bg-purple-100 text-purple-600' }
    default:
      return { Icon: Settings, color: 'bg-gray-100 text-gray-600' }
  }
}

const getNavigationPath = (notification) => {
  if (!notification.relatedId) return null
  const category = getTypeCategory(notification.type)
    switch (category) {
      case NOTIFICATION_TYPES.APPOINTMENT:
        return `/appointments`
    case NOTIFICATION_TYPES.MEDICAL_RECORD:
      return `/medical-records`
    default:
      return null
  }
}

const timeAgo = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa nãy'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`
  return formatDate(date)
}

const NotificationCenter = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState(NOTIFICATION_TYPES.ALL)
  const [readFilter, setReadFilter] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  const fetchNotifications = useCallback(async (isInitial = true) => {
    if (isInitial) setIsLoading(true)
    else setIsFetchingMore(true)

    try {
      const params = {
        page: isInitial ? 0 : page,
        size: 20,
      }
      if (readFilter === 'unread') params.unreadOnly = true

      const data = await notificationApi.getNotifications(user.id, params)
      const items = data || []

      if (isInitial) {
        setNotifications(items)
        setPage(1)
      } else {
        setNotifications(prev => [...prev, ...items])
        setPage(prev => prev + 1)
      }
      setHasMore(items.length === 20)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      showToast({ type: 'error', message: extractApiErrorMessage(error, 'Không thể tải thông báo') })
    } finally {
      setIsLoading(false)
      setIsFetchingMore(false)
    }
  }, [user.id, readFilter])

  useEffect(() => {
    fetchNotifications(true)
  }, [fetchNotifications])

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      showToast({ type: 'success', message: 'Đã đánh dấu tất cả đã đọc' })
    } catch (error) {
      showToast({ type: 'error', message: extractApiErrorMessage(error, 'Không thể đánh dấu đã đọc') })
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      showToast({ type: 'error', message: extractApiErrorMessage(error, 'Không thể đánh dấu đã đọc') })
    }
  }

  const handleDelete = async (id) => {
    try {
      await notificationApi.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setSelectedIds(prev => prev.filter(sid => sid !== id))
      showToast({ type: 'success', message: 'Đã xóa thông báo' })
    } catch (error) {
      showToast({ type: 'error', message: extractApiErrorMessage(error, 'Không thể xóa thông báo') })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    try {
      await Promise.all(selectedIds.map(id => notificationApi.deleteNotification(id)))
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)))
      showToast({ type: 'success', message: `Đã xóa ${selectedIds.length} thông báo` })
      setSelectedIds([])
    } catch (error) {
      showToast({ type: 'error', message: extractApiErrorMessage(error, 'Không thể xóa thông báo') })
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    )
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) handleMarkAsRead(notification.id)
    const path = getNavigationPath(notification)
    if (path) navigate(path)
  }

  const filteredNotifications = notifications.filter(n => {
    if (typeFilter !== NOTIFICATION_TYPES.ALL && getTypeCategory(n.type) !== typeFilter) return false
    if (readFilter === 'unread' && n.isRead) return false
    if (readFilter === 'read' && !n.isRead) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Thông báo"
        description="Theo dõi các cập nhật về lịch hẹn, hồ sơ và thanh toán trong danh sách ưu tiên khả năng đọc."
        action={(
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {unreadCount} chưa đọc
          </div>
        )}
      />

      <div className="flex items-center justify-between">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Quay lại
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-1" />
              Đọc tất cả
            </Button>
          )}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter className="w-4 h-4 mr-1" />
              Lọc
            </Button>
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-sage-200 z-50 overflow-hidden"
                >
                  <div className="p-2">
                    <p className="text-xs font-medium text-sage-500 px-3 py-1 uppercase tracking-wider">Trạng thái</p>
                    {['all', 'unread', 'read'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => { setReadFilter(filter); setShowFilterDropdown(false) }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md ${readFilter === filter ? 'bg-sage-100 text-sage-900 font-medium' : 'text-sage-700 hover:bg-sage-50'}`}
                      >
                        {filter === 'all' ? 'Tất cả' : filter === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-sage-50 border border-sage-200 rounded-lg px-4 py-3 flex items-center justify-between"
        >
          <span className="text-sm text-sage-700">{selectedIds.length} đã chọn</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              Hủy
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkDelete} className="text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-1" />
              Xóa
            </Button>
          </div>
        </motion.div>
      )}

      {/* Type filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${typeFilter === type ? 'bg-sage-600 text-white' : 'bg-sage-100 text-sage-700 hover:bg-sage-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-sage-600" />
              </div>
              <h3 className="text-lg font-semibold text-sage-900 mb-2">Không có thông báo</h3>
              <p className="text-sage-600 text-sm">
                {typeFilter !== NOTIFICATION_TYPES.ALL
                  ? 'Không có thông báo nào trong danh mục này'
                  : 'Bạn chưa có thông báo nào'}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification, index) => {
            const { Icon, color } = getNotificationIcon(notification.type)
            const navigatePath = getNavigationPath(notification)

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`transition-all ${!notification.isRead ? 'border-sage-300 bg-sage-50/30' : ''} ${navigatePath ? 'cursor-pointer hover:shadow-md' : ''}`}
                  onClick={() => navigatePath && handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="flex flex-col items-center pt-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(notification.id)}
                          onChange={(e) => { e.stopPropagation(); toggleSelect(notification.id) }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-sage-300 text-sage-600"
                        />
                      </div>

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.isRead ? 'font-semibold text-sage-900' : 'text-sage-700'}`}>
                            {notification.title || notification.message}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-sage-600 rounded-full" />
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(notification.id) }}
                              className="opacity-0 group-hover:opacity-100 hover:text-red-500 text-sage-400 transition-all p-1 rounded"
                              style={{ opacity: 'inherit' }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {notification.message && notification.title && (
                          <p className="text-xs text-sage-500 mt-1">{notification.message}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-sage-400">{timeAgo(notification.createdAt)}</span>
                          <Badge className={`text-xs ${getTypeCategory(notification.type) === NOTIFICATION_TYPES.APPOINTMENT ? 'bg-sage-100 text-sage-700' : getTypeCategory(notification.type) === NOTIFICATION_TYPES.PAYMENT ? 'bg-purple-100 text-purple-700' : getTypeCategory(notification.type) === NOTIFICATION_TYPES.MEDICAL_RECORD ? 'bg-terra-100 text-terra-700' : 'bg-gray-100 text-gray-700'}`}>
                            {TYPE_LABELS[getTypeCategory(notification.type)]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}

          {/* Load more */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNotifications(false)}
                disabled={isFetchingMore}
              >
                {isFetchingMore ? 'Đang tải...' : 'Xem thêm'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
