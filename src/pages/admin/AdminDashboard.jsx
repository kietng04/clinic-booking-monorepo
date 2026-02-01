import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Loading'
import { useUIStore } from '@/store/uiStore'
import { statsApi } from '@/api/statsApiWrapper'
// TODO: Replace mockAdminAnalytics with real admin analytics API
import { mockAdminAnalytics } from '@/api/mockData'
import { vi } from '@/lib/translations'

const AdminDashboard = () => {
  const { showToast } = useUIStore()
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const data = await statsApi.getAdminStats()
      setStats(data)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải dữ liệu' })
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="space-y-6">
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

  return (
    <div className="space-y-6">
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
            {mockAdminAnalytics.recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-3 bg-sage-50 rounded-lg"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'NEW_USER' ? 'bg-sage-100' :
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
            ))}
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
