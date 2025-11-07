import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, Users, Clock, Star, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { statsApi } from '@/api/statsApiWrapper'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { formatTime, translateStatus } from '@/lib/utils'
import { vi } from '@/lib/translations'

const DoctorDashboard = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [stats, setStats] = useState(null)
  const [todayAppointments, setTodayAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const statsData = await statsApi.getDoctorStats(user.id)
      const today = new Date().toISOString().split('T')[0]
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setHours(0, 0, 0, 0)
      startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7))
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 7)

      // Get all doctor appointments and filter for today
      const appointmentsData = await appointmentApi.getAppointments({ doctorId: user.id })
      const todayAppts = appointmentsData.filter(apt => apt.appointmentDate === today)
      const weeklyAppts = appointmentsData.filter((apt) => {
        const rawDate = apt.appointmentDate || apt.date
        if (!rawDate) return false
        const aptDate = new Date(rawDate)
        if (Number.isNaN(aptDate.getTime())) return false
        return aptDate >= startOfWeek && aptDate < endOfWeek
      })

      setStats({
        ...statsData,
        todayAppointments: todayAppts.length,
        weeklyAppointments: weeklyAppts.length,
        totalPatients: statsData?.totalPatients ?? statsData?.uniquePatients ?? 0,
      })
      setTodayAppointments(todayAppts)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải dữ liệu' })
    } finally {
      setIsLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return vi.doctor.dashboard.morning
    if (hour < 18) return vi.doctor.dashboard.afternoon
    return vi.doctor.dashboard.evening
  }

  const doctorDisplayName = (user?.name || user?.fullName || '').trim()
  const doctorLastName = doctorDisplayName ? doctorDisplayName.split(' ').pop() : 'Doctor'

  const statsCards = [
    {
      id: 'today-appointments',
      label: vi.doctor.dashboard.todayAppointments,
      value: stats?.todayAppointments || 0,
      icon: Calendar,
      color: 'sage',
    },
    {
      id: 'weekly-appointments',
      label: vi.doctor.dashboard.weeklyAppointments,
      value: stats?.weeklyAppointments || 0,
      icon: Activity,
      color: 'terra',
    },
    {
      id: 'total-patients',
      label: vi.doctor.dashboard.totalPatients,
      value: stats?.totalPatients || 0,
      icon: Users,
      color: 'blue',
    },
    {
      id: 'avg-rating',
      label: vi.doctor.dashboard.avgRating,
      value: stats?.avgRating ? stats.avgRating.toFixed(1) : '0.0',
      icon: Star,
      color: 'yellow',
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid md:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
          {vi.doctor.dashboard.welcome} {getGreeting()}, Dr. {doctorLastName}
        </h1>
        <p className="text-sage-600">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    {stat.label === vi.doctor.dashboard.totalPatients && (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-sage-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-sage-900">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{vi.doctor.dashboard.todaySchedule}</CardTitle>
            <Link to="/doctor/appointments">
              <Button variant="ghost" size="sm">Xem tất cả</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-sage-500">
              {vi.doctor.dashboard.noAppointmentsToday}
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                (() => {
                  const rawTime = appointment.time || appointment.appointmentTime
                  const formattedTime = rawTime ? formatTime(rawTime) : '--:--'
                  const [hour, minute] = formattedTime.split(':')
                  return (
                    <div
                      key={`${appointment.id ?? 'apt'}-${appointment.patientId ?? 'unknown'}-${rawTime ?? 'time'}`}
                      className="flex items-center justify-between p-4 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-sage-900">
                            {hour || '--'}
                          </div>
                          <div className="text-xs text-sage-600">
                            {minute || '--'}
                          </div>
                        </div>
                        <Avatar
                          src={`https://i.pravatar.cc/150?u=${appointment.patientId}`}
                          alt={appointment.patientName}
                        />
                        <div>
                          <h4 className="font-semibold text-sage-900">{appointment.patientName}</h4>
                          <p className="text-sm text-sage-600">{appointment.reason || appointment.symptoms || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${
                          appointment.status === 'CONFIRMED'
                            ? 'bg-sage-100 text-sage-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {translateStatus(appointment.status)}
                        </Badge>
                        <Button size="sm" variant="outline">
                          {vi.appointments.actions.startConsultation}
                        </Button>
                      </div>
                    </div>
                  )
                })()
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{vi.doctor.dashboard.quickActions}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/schedule">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-5 h-5 mr-2" />
                {vi.doctor.dashboard.viewSchedule}
              </Button>
            </Link>
            <Link to="/patients">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-5 h-5 mr-2" />
                {vi.doctor.dashboard.managePatients}
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <Activity className="w-5 h-5 mr-2" />
              {vi.doctor.dashboard.createPrescription}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DoctorDashboard
