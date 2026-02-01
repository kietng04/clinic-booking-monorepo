import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, MapPin, Video, CheckCircle, XCircle, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { formatDate, formatTime, translateStatus } from '@/lib/utils'
import { vi } from '@/lib/translations'

const DoctorAppointments = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('today')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const data = await appointmentApi.getAppointments({ doctorId: user.id })

      // Filter by status based on tab
      let filtered = data
      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        filtered = data.filter(apt => apt.appointmentDate === today && apt.status !== 'CANCELLED')
      } else if (filter === 'upcoming') {
        filtered = data.filter(apt => apt.status === 'CONFIRMED' || apt.status === 'PENDING')
      } else if (filter === 'completed') {
        filtered = data.filter(apt => apt.status === 'COMPLETED')
      }

      setAppointments(filtered)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải lịch hẹn' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async (appointmentId) => {
    try {
      await appointmentApi.confirmAppointment(appointmentId)
      showToast({ type: 'success', message: vi.appointments.confirmed })
      fetchAppointments()
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể xác nhận lịch hẹn' })
    }
  }


  const tabs = [
    { id: 'today', label: vi.appointments.tabs.today },
    { id: 'upcoming', label: vi.appointments.tabs.upcoming },
    { id: 'completed', label: vi.appointments.tabs.completed },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
          {vi.doctor.appointments.title}
        </h1>
        <p className="text-sage-600">Quản lý lịch hẹn với bệnh nhân</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === tab.id
                    ? 'bg-sage-600 text-white'
                    : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {appointments.map((apt, index) => (
          <motion.div
            key={apt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hover>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar
                      src={`https://i.pravatar.cc/150?u=${apt.patientId}`}
                      alt={apt.patientName}
                      size="lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-sage-900 mb-1">
                        {apt.patientName}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-sage-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(apt.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(apt.time)}
                        </div>
                        <div className="flex items-center gap-1">
                          {apt.type === 'ONLINE' ? (
                            <>
                              <Video className="w-4 h-4" />
                              <span>Trực tuyến</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4" />
                              <span>Trực tiếp</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-sage-700">
                        <span className="font-medium">Lý do:</span> {apt.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start lg:items-end gap-3">
                    <Badge className={`${
                      apt.status === 'CONFIRMED' ? 'bg-sage-100 text-sage-800' :
                      apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {translateStatus(apt.status)}
                    </Badge>

                    <div className="flex gap-2">
                      {apt.status === 'PENDING' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleConfirm(apt.id)}
                          leftIcon={<CheckCircle className="w-4 h-4" />}
                        >
                          Xác nhận
                        </Button>
                      )}
                      {apt.status === 'CONFIRMED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/doctor/create-medical-record?appointmentId=${apt.id}`)}
                          leftIcon={<FileText className="w-4 h-4" />}
                        >
                          Tạo hồ sơ
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {appointments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-sage-500">
              Không có lịch hẹn nào
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  )
}

export default DoctorAppointments
