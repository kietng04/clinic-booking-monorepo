import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  Search,
  X,
  MapPin,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Loading, SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { formatDate, formatTime, translateStatus } from '@/lib/utils'
import { vi } from '@/lib/translations'

const Appointments = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, filter, searchQuery])

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const data = await appointmentApi.getAppointments({ patientId: user.id })
      setAppointments(data)
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Không thể tải danh sách lịch hẹn',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = [...appointments]

    // Filter by status
    if (filter === 'upcoming') {
      filtered = filtered.filter(apt => apt.status === 'CONFIRMED' || apt.status === 'PENDING')
    } else if (filter === 'completed') {
      filtered = filtered.filter(apt => apt.status === 'COMPLETED')
    } else if (filter === 'cancelled') {
      filtered = filtered.filter(apt => apt.status === 'CANCELLED')
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        apt =>
          apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.doctorSpecialization.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredAppointments(filtered)
  }

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setCancelModalOpen(true)
  }

  const confirmCancel = async () => {
    try {
      await appointmentApi.cancelAppointment(selectedAppointment.id, cancelReason)
      showToast({
        type: 'success',
        message: vi.appointments.cancelled,
      })
      setCancelModalOpen(false)
      setCancelReason('')
      setSelectedAppointment(null)
      fetchAppointments()
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Không thể hủy lịch hẹn',
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-sage-100 text-sage-800 border-sage-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle2 className="w-4 h-4" />
      case 'PENDING':
        return <AlertCircle className="w-4 h-4" />
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const tabs = [
    { id: 'all', label: vi.appointments.tabs.all },
    { id: 'upcoming', label: vi.appointments.tabs.upcoming },
    { id: 'completed', label: vi.appointments.tabs.completed },
    { id: 'cancelled', label: vi.appointments.tabs.cancelled },
  ]

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
          {vi.appointments.title}
        </h1>
        <p className="text-sage-600">Quản lý và theo dõi các lịch hẹn của bạn</p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === tab.id
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sage-400" />
            <Input
              type="text"
              placeholder={vi.appointments.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sage-400 hover:text-sage-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
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
              <h3 className="text-lg font-semibold text-sage-900 mb-2">
                {vi.appointments.noAppointments}
              </h3>
              <p className="text-sage-600 mb-6">
                {searchQuery
                  ? 'Không tìm thấy lịch hẹn nào phù hợp'
                  : 'Bạn chưa có lịch hẹn nào'}
              </p>
              {!searchQuery && (
                <Button as="link" to="/appointments/book">
                  Đặt lịch ngay
                </Button>
              )}
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  hover
                  className="overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Doctor Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar
                          src={`https://i.pravatar.cc/150?u=${appointment.doctorId}`}
                          alt={appointment.doctorName}
                          size="lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-sage-900 mb-1">
                            {appointment.doctorName}
                          </h3>
                          <p className="text-sage-600 text-sm mb-2">
                            {appointment.doctorSpecialization}
                          </p>

                          {/* Date, Time, Type */}
                          <div className="flex flex-wrap gap-3 text-sm text-sage-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(appointment.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(appointment.time)}
                            </div>
                            <div className="flex items-center gap-1">
                              {appointment.type === 'ONLINE' ? (
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

                          {/* Reason */}
                          {appointment.reason && (
                            <p className="mt-2 text-sm text-sage-700">
                              <span className="font-medium">Lý do:</span> {appointment.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Status and Actions */}
                      <div className="flex flex-col items-start lg:items-end gap-3">
                        <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                          {getStatusIcon(appointment.status)}
                          {translateStatus(appointment.status)}
                        </Badge>

                        <div className="flex flex-wrap gap-2">
                          {appointment.status === 'CONFIRMED' && appointment.type === 'ONLINE' && (
                            <Button variant="primary" size="sm">
                              {vi.appointments.actions.join}
                            </Button>
                          )}

                          {(appointment.status === 'CONFIRMED' || appointment.status === 'PENDING') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelAppointment(appointment)}
                            >
                              {vi.appointments.actions.cancel}
                            </Button>
                          )}

                          <Link to={`/appointments/${appointment.id}`}>
                            <Button variant="ghost" size="sm">
                              {vi.appointments.actions.viewDetails}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false)
          setCancelReason('')
          setSelectedAppointment(null)
        }}
        title="Hủy lịch hẹn"
      >
        <div className="space-y-4">
          <p className="text-sage-700">
            {vi.appointments.confirmCancel}
          </p>

          {selectedAppointment && (
            <div className="bg-sage-50 p-4 rounded-lg">
              <p className="font-medium text-sage-900 mb-1">
                {selectedAppointment.doctorName}
              </p>
              <p className="text-sm text-sage-600">
                {formatDate(selectedAppointment.date)} • {formatTime(selectedAppointment.time)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-sage-900 mb-2">
              {vi.appointments.cancelReason}
            </label>
            <Input
              as="textarea"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy lịch..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setCancelModalOpen(false)
                setCancelReason('')
                setSelectedAppointment(null)
              }}
            >
              {vi.common.cancel}
            </Button>
            <Button variant="danger" onClick={confirmCancel}>
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Appointments
