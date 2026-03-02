import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, Activity, RefreshCw, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Loading'
import { useUIStore } from '@/store/uiStore'
import { statsApi } from '@/api/statsApiWrapper'
import { vi } from '@/lib/translations'
import { withRetry } from '@/utils/apiRetry'

const MAX_AUTO_RETRY_503 = 3

const normalizeAdminStats = (dashboardStats, analyticsData) => {
  const userStats = dashboardStats?.userStatistics || {}
  const appointmentStats = dashboardStats?.appointmentStatistics || {}
  const systemHealth = dashboardStats?.systemHealth || {}
  const latestRevenue = Array.isArray(analyticsData?.revenue) && analyticsData.revenue.length > 0
    ? Number(analyticsData.revenue[analyticsData.revenue.length - 1]?.thisYear || 0)
    : 0

  return {
    totalUsers: userStats.totalUsers || 0,
    totalDoctors: userStats.totalDoctors || 0,
    activeUsers: userStats.activeUsers || systemHealth.totalActiveUsers || 0,
    todayAppointments: appointmentStats.appointmentsToday || 0,
    totalAppointments: appointmentStats.totalAppointments || 0,
    pendingApprovals: systemHealth.pendingActionsCount || 0,
    monthlyRevenue: latestRevenue,
  }
}

const AdminDashboard = () => {
  const { showToast } = useUIStore()
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)
  const autoRetryTimeoutRef = useRef(null)
  const autoRetryCountRef = useRef(0)

  useEffect(() => {
    fetchData()

    // Cleanup: cancel ongoing requests when component unmounts
    return () => {
      if (autoRetryTimeoutRef.current) {
        clearTimeout(autoRetryTimeoutRef.current)
        autoRetryTimeoutRef.current = null
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const fetchData = async (isAutoRetry = false) => {
    if (autoRetryTimeoutRef.current) {
      clearTimeout(autoRetryTimeoutRef.current)
      autoRetryTimeoutRef.current = null
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    const controller = new AbortController()
    abortControllerRef.current = controller
    const signal = controller.signal

    setIsLoading(true)
    setError(null)
    if (!isAutoRetry) {
      setIsRetrying(false)
      setRetryAttempt(0)
      autoRetryCountRef.current = 0
      // Avoid showing stale dashboard data while refetching / retrying.
      setStats(null)
      setAnalytics(null)
    }

    let shouldAutoRetry503 = false

    try {
      const [statsData, analyticsData] = await Promise.all([
        // Stats endpoint is usually fast, retry with shorter config
        withRetry(
          () => statsApi.getAdminStats(),
          {
            maxRetries: 2,
            initialDelay: 500,
            signal,
            onRetry: (attempt) => {
              console.log(`Retrying admin stats (attempt ${attempt})...`)
            }
          }
        ),
        // Analytics endpoint is slower and more prone to 503, use full retry config
        withRetry(
          () => statsApi.getAdminAnalyticsDashboard(),
          {
            maxRetries: 3,
            initialDelay: 1000,
            backoffMultiplier: 2,
            signal,
            onRetry: (attempt, error, delay) => {
              console.log(`Retrying analytics dashboard (attempt ${attempt} after ${delay}ms) due to:`, error.message)
              setIsRetrying(true)
              setRetryAttempt(attempt)
            }
          }
        )
      ])

      setStats(normalizeAdminStats(statsData, analyticsData))
      setAnalytics(analyticsData)
      setError(null)
      setIsRetrying(false)
      setRetryAttempt(0)
      autoRetryCountRef.current = 0
    } catch (error) {
      // If another fetch started, ignore results from this (now stale) request.
      if (abortControllerRef.current !== controller) {
        return
      }

      // Don't show error for aborted requests (component unmounted)
      if (error.name === 'AbortError') {
        console.log('Request cancelled')
        return
      }

      console.error('Error fetching admin data:', error)
      const status = error.response?.status

      // 503 is commonly transient during service restarts.
      // Don't show a generic red toast; keep the user on a stable "retrying" UI and auto-retry.
      if (status === 503) {
        if (autoRetryCountRef.current < MAX_AUTO_RETRY_503) {
          autoRetryCountRef.current += 1
          shouldAutoRetry503 = true
          setError(error)
          setIsRetrying(true)
          setRetryAttempt(autoRetryCountRef.current)

          autoRetryTimeoutRef.current = setTimeout(() => {
            fetchData(true)
          }, 2500)
          return
        }

        setError(error)
        setIsRetrying(false)
        return
      }

      setError(error)

      // Only show toast for non-retryable errors (not 503)
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tải dữ liệu'
      })
    } finally {
      // Avoid clobbering state for a newer in-flight request (StrictMode double effects).
      if (abortControllerRef.current !== controller) {
        return
      }

      if (shouldAutoRetry503) {
        // Keep loading state so UI shows the blue retry banner + skeletons.
        return
      }

      setIsLoading(false)
      setIsRetrying(false)
      setRetryAttempt(0)
    }
  }

  const statsCards = [
    {
      label: vi.admin.dashboard.totalUsers,
      value: stats?.totalUsers || 0,
      change: '+12.5%',
      icon: Users,
      color: 'sage',
    },
    {
      label: vi.admin.dashboard.totalDoctors,
      value: stats?.totalDoctors || 0,
      change: '+5.2%',
      icon: UserCheck,
      color: 'terra',
    },
    {
      label: vi.admin.dashboard.todayAppointments,
      value: stats?.todayAppointments || 0,
      change: '+8.1%',
      icon: Calendar,
      color: 'blue',
    },
    {
      label: vi.admin.dashboard.monthlyRevenue,
      value: stats?.monthlyRevenue ? `${(stats.monthlyRevenue / 1000000).toFixed(1)}M VND` : '0M VND',
      change: '+22.3%',
      icon: DollarSign,
      color: 'green',
    },
  ]

  // Loading state (initial load or retrying)
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Show retry message if retrying */}
        {isRetrying && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3"
          >
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-blue-900 font-medium">
                Đang tải lại dữ liệu... (Thử lần {retryAttempt})
              </p>
              <p className="text-blue-700 text-sm">
                Hệ thống đang xử lý yêu cầu, vui lòng chờ...
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    )
  }

  // Error state (all retries failed)
  if (error && !stats) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-8 text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 mb-2">
            Không thể tải dữ liệu dashboard
          </h3>
          <p className="text-red-700 mb-4">
            {error.response?.status === 503
              ? 'Hệ thống đang bận, vui lòng thử lại sau.'
              : error.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu.'}
          </p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Retry banner (shown during transient failures / retries) */}
      {isRetrying && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3"
        >
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <div>
            <p className="text-blue-900 font-medium">
              Đang tải lại dữ liệu... (Thử lần {retryAttempt})
            </p>
            <p className="text-blue-700 text-sm">
              Hệ thống đang xử lý yêu cầu, vui lòng chờ...
            </p>
          </div>
        </motion.div>
      )}

      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
          {vi.admin.dashboard.title}
        </h1>
        <p className="text-sage-600">{vi.admin.dashboard.systemOverview}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-sage-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-sage-900">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {vi.admin.dashboard.recentActivities}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(analytics?.recentActivities || []).length > 0 ? (
              (analytics?.recentActivities || []).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-3 bg-sage-50 rounded-lg"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'NEW_USER' ? 'bg-sage-100' :
                      activity.type === 'DOCTOR_APPLICATION' ? 'bg-terra-100' :
                        activity.type === 'DOCTOR_APPROVED' ? 'bg-green-100' :
                          'bg-blue-100'
                    }`}>
                    {activity.type === 'NEW_USER' ? <Users className="w-5 h-5 text-sage-600" /> :
                      activity.type === 'DOCTOR_APPLICATION' ? <UserCheck className="w-5 h-5 text-terra-600" /> :
                        activity.type === 'DOCTOR_APPROVED' ? <UserCheck className="w-5 h-5 text-green-600" /> :
                          <Calendar className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-sage-900">{activity.message}</p>
                    <p className="text-xs text-sage-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sage-500 text-center py-4">Không có hoạt động gần đây</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-sage-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-sage-900">{stats?.pendingApprovals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-sage-600" />
              </div>
              <div>
                <p className="text-sm text-sage-600">Người dùng hoạt động</p>
                <p className="text-2xl font-bold text-sage-900">{stats?.activeUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-sage-600">Tổng lịch hẹn</p>
                <p className="text-2xl font-bold text-sage-900">{stats?.totalAppointments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
