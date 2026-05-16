import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Calendar,
  CheckCheck,
  CreditCard,
  FileText,
  Inbox,
  Settings,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Loading'
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

const FILTER_OPTIONS = [
  { value: NOTIFICATION_TYPES.ALL, label: 'Tất cả' },
  { value: NOTIFICATION_TYPES.APPOINTMENT, label: 'Tư vấn / Lịch hẹn' },
  { value: NOTIFICATION_TYPES.PAYMENT, label: 'Thanh toán' },
  { value: NOTIFICATION_TYPES.MEDICAL_RECORD, label: 'Hồ sơ y tế' },
  { value: NOTIFICATION_TYPES.SYSTEM, label: 'Hệ thống' },
]

const getTypeCategory = (type) => {
  if (!type) return NOTIFICATION_TYPES.SYSTEM
  const upper = String(type).toUpperCase()

  if (upper.includes('APPOINTMENT') || upper.includes('FEEDBACK') || upper.includes('CONSULTATION')) {
    return NOTIFICATION_TYPES.APPOINTMENT
  }
  if (upper.includes('MEDICAL') || upper.includes('LAB') || upper.includes('PRESCRIPTION')) {
    return NOTIFICATION_TYPES.MEDICAL_RECORD
  }
  if (upper.includes('PAYMENT')) return NOTIFICATION_TYPES.PAYMENT

  return NOTIFICATION_TYPES.SYSTEM
}

const getNotificationIcon = (type) => {
  const category = getTypeCategory(type)

  switch (category) {
    case NOTIFICATION_TYPES.APPOINTMENT:
      return { Icon: Calendar, color: 'bg-sage-100 text-sage-700' }
    case NOTIFICATION_TYPES.MEDICAL_RECORD:
      return { Icon: FileText, color: 'bg-terra-100 text-terra-700' }
    case NOTIFICATION_TYPES.PAYMENT:
      return { Icon: CreditCard, color: 'bg-sky-100 text-sky-700' }
    default:
      return { Icon: Settings, color: 'bg-gray-100 text-gray-600' }
  }
}

const getNotificationLabel = (type) => {
  const upper = String(type || '').toUpperCase()

  if (upper.includes('CONSULTATION')) return 'Tư vấn bác sĩ'
  if (upper.includes('APPOINTMENT') || upper.includes('FEEDBACK')) return 'Lịch hẹn'
  if (upper.includes('MEDICAL') || upper.includes('LAB') || upper.includes('PRESCRIPTION')) {
    return 'Hồ sơ y tế'
  }
  if (upper.includes('PAYMENT')) return 'Thanh toán'

  return 'Hệ thống'
}

const getNavigationPath = (notification) => {
  if (!notification?.relatedId) return null

  switch (getTypeCategory(notification.type)) {
    case NOTIFICATION_TYPES.APPOINTMENT:
      return '/appointments'
    case NOTIFICATION_TYPES.MEDICAL_RECORD:
      return '/medical-records'
    case NOTIFICATION_TYPES.PAYMENT:
      return '/payment-history'
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

export default function NotificationCenter() {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState(NOTIFICATION_TYPES.ALL)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const fetchNotifications = useCallback(async (isInitial = true) => {
    if (!user?.id) return

    if (isInitial) setIsLoading(true)
    else setIsFetchingMore(true)

    try {
      const currentPage = isInitial ? 0 : page
      const data = await notificationApi.getNotifications(user.id, {
        page: currentPage,
        size: 20,
      })
      const items = data || []

      if (isInitial) {
        setNotifications(items)
        setPage(1)
      } else {
        setNotifications((prev) => [...prev, ...items])
        setPage((prev) => prev + 1)
      }

      setHasMore(items.length === 20)
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể tải thông báo'),
      })
    } finally {
      setIsLoading(false)
      setIsFetchingMore(false)
    }
  }, [page, showToast, user?.id])

  useEffect(() => {
    fetchNotifications(true)
  }, [fetchNotifications])

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return

    try {
      await notificationApi.markAllAsRead(user.id)
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
      showToast({ type: 'success', message: 'Đã đánh dấu tất cả đã đọc' })
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể đánh dấu đã đọc'),
      })
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      )
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể đánh dấu đã đọc'),
      })
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) handleMarkAsRead(notification.id)

    const path = getNavigationPath(notification)
    if (path) navigate(path)
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length
  const filteredNotifications = notifications.filter((notification) =>
    typeFilter === NOTIFICATION_TYPES.ALL
      ? true
      : getTypeCategory(notification.type) === typeFilter
  )

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
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-[28px] border border-sage-200 bg-white px-6 py-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sage-700">
              <Bell className="h-3.5 w-3.5" />
              Thông báo
            </div>
            <h1 className="mt-3 text-2xl font-bold text-sage-950 sm:text-[2rem]">
              Trung tâm thông báo
            </h1>
            <p className="mt-2 text-sm text-sage-600">
              Theo dõi các cập nhật mới nhất về lịch khám, hồ sơ và thanh toán của bạn.
            </p>
            {unreadCount > 0 && (
              <Badge className="mt-3 bg-sage-100 text-sage-800">{unreadCount} chưa đọc</Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="self-start">
              <CheckCheck className="mr-1 h-4 w-4" />
              Đọc tất cả
            </Button>
          )}
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTypeFilter(option.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              typeFilter === option.value
                ? 'bg-sage-700 text-white'
                : 'bg-white text-sage-700 ring-1 ring-sage-200 hover:bg-sage-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </section>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
                <Inbox className="h-8 w-8 text-sage-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-sage-900">Chưa có thông báo</h3>
              <p className="text-sm text-sage-600">Không có thông báo nào trong nhóm này.</p>
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <section className="relative pl-4 sm:pl-6">
          <div className="absolute bottom-0 left-[15px] top-0 w-px bg-sage-200 sm:left-[23px]" />
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => {
              const { Icon, color } = getNotificationIcon(notification.type)
              const navigatePath = getNavigationPath(notification)

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="relative pl-10 sm:pl-14"
                >
                  <div
                    className={`absolute left-0 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-white shadow-sm sm:h-10 sm:w-10 ${color}`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <Card
                    className={`rounded-2xl border transition-all ${
                      !notification.isRead ? 'border-sage-300 bg-sage-50/60' : 'border-sage-200 bg-white'
                    } ${navigatePath ? 'cursor-pointer hover:shadow-md' : ''}`}
                    onClick={() => navigatePath && handleNotificationClick(notification)}
                  >
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-base ${
                              !notification.isRead
                                ? 'font-semibold text-sage-950'
                                : 'font-medium text-sage-800'
                            }`}
                          >
                            {notification.title || notification.message}
                          </p>
                          {notification.message && notification.title && (
                            <p className="mt-2 text-sm leading-6 text-sage-600">{notification.message}</p>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge className="border border-sage-200 bg-white text-sage-700">
                              {getNotificationLabel(notification.type)}
                            </Badge>
                            <div className="text-xs font-medium uppercase tracking-[0.14em] text-sage-400">
                              {timeAgo(notification.createdAt)}
                            </div>
                          </div>
                        </div>

                        {!notification.isRead && (
                          <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-sage-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {hasMore && (
            <div className="pt-5 text-center">
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
        </section>
      )}
    </div>
  )
}
