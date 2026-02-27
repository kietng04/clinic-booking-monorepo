import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  PhoneCall,
  Navigation,
  FileText,
  CreditCard,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Loading } from '@/components/ui/Loading'
import { RescheduleModal } from '@/components/RescheduleModal'
import { CancelAppointmentModal } from '@/components/CancelAppointmentModal'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { formatDate, formatTime, translateStatus } from '@/lib/utils'

const AppointmentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()

  const [appointment, setAppointment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  useEffect(() => {
    fetchAppointment()
  }, [id])

  const fetchAppointment = async () => {
    setIsLoading(true)
    try {
      const data = await appointmentApi.getAppointment(id)
      setAppointment(data)
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Không thể tải thông tin lịch hẹn',
      })
      navigate('/appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckIn = async () => {
    try {
      await appointmentApi.checkInAppointment(id)
      showToast({
        type: 'success',
        message: 'Check-in thành công!',
      })
      fetchAppointment()
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Không thể check-in. Vui lòng thử lại.',
      })
    }
  }

  const handleReschedule = async (data) => {
    try {
      await appointmentApi.rescheduleAppointment(id, data)
      showToast({
        type: 'success',
        message: 'Đã đổi lịch hẹn thành công!',
      })
      setRescheduleModalOpen(false)
      fetchAppointment()
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Không thể đổi lịch hẹn',
      })
    }
  }

  const handleCancel = async (reason) => {
    try {
      await appointmentApi.cancelAppointment(id, reason)
      showToast({
        type: 'success',
        message: 'Đã hủy lịch hẹn',
      })
      setCancelModalOpen(false)
      fetchAppointment()
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Không thể hủy lịch hẹn',
      })
    }
  }

  const handleDownloadCalendar = async () => {
    try {
      const blob = await appointmentApi.downloadCalendar(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `appointment-${id}.ics`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showToast({
        type: 'success',
        message: 'Đã tải lịch hẹn',
      })
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Không thể tải lịch hẹn',
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-sage-100 text-sage-800 border-sage-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800 border-blue-200'
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
      case 'CHECKED_IN':
        return <CheckCircle2 className="w-5 h-5" />
      case 'PENDING':
        return <AlertCircle className="w-5 h-5" />
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5" />
      case 'CANCELLED':
        return <XCircle className="w-5 h-5" />
      default:
        return null
    }
  }

  const canCheckIn = () => {
    if (!appointment || appointment.status !== 'CONFIRMED') return false

    const now = new Date()
    const aptDateTime = new Date(`${appointment.date}T${appointment.time}`)
    const diffMinutes = (aptDateTime - now) / (1000 * 60)

    // Can check in 30 minutes before to 15 minutes after
    return diffMinutes <= 30 && diffMinutes >= -15
  }

  const canReschedule = () => {
    if (!appointment) return false
    return ['PENDING', 'CONFIRMED'].includes(appointment.status)
  }

  const canCancel = () => {
    if (!appointment) return false
    return ['PENDING', 'CONFIRMED'].includes(appointment.status)
  }

  if (isLoading) {
    return <Loading />
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-sage-600">Không tìm thấy lịch hẹn</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
              Chi tiết lịch hẹn
            </h1>
            <p className="text-sage-600">Mã lịch hẹn: #{appointment.id}</p>
          </div>

          <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-2 text-lg px-4 py-2`}>
            {getStatusIcon(appointment.status)}
            {translateStatus(appointment.status)}
          </Badge>
        </div>
      </div>

      {/* Doctor & Appointment Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Doctor Info */}
            <div className="flex items-start gap-4 flex-1">
              <Avatar
                src={`https://i.pravatar.cc/150?u=${appointment.doctorId}`}
                alt={appointment.doctorName}
                size="xl"
              />
              <div>
                <h2 className="text-xl font-semibold text-sage-900 mb-1">
                  {appointment.doctorName}
                </h2>
                <p className="text-sage-600 mb-3">{appointment.doctorSpecialization}</p>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" leftIcon={<PhoneCall className="w-4 h-4" />}>
                    Gọi điện
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<FileText className="w-4 h-4" />}>
                    Xem hồ sơ
                  </Button>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sage-700">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-sm text-sage-500">Ngày khám</p>
                  <p className="font-medium">{formatDate(appointment.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sage-700">
                <Clock className="w-5 h-5" />
                <div>
                  <p className="text-sm text-sage-500">Giờ khám</p>
                  <p className="font-medium">{formatTime(appointment.time)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sage-700">
                {appointment.type === 'ONLINE' ? (
                  <>
                    <Video className="w-5 h-5" />
                    <div>
                      <p className="text-sm text-sage-500">Hình thức</p>
                      <p className="font-medium">Trực tuyến</p>
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" />
                    <div>
                      <p className="text-sm text-sage-500">Hình thức</p>
                      <p className="font-medium">Trực tiếp</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Reason */}
          {appointment.reason && (
            <div className="mt-6 pt-6 border-t border-sage-200">
              <h3 className="text-sm font-medium text-sage-900 mb-2">Lý do khám</h3>
              <p className="text-sage-700">{appointment.reason}</p>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-sage-900 mb-2">Ghi chú</h3>
              <p className="text-sage-700">{appointment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {canCheckIn() && (
              <Button onClick={handleCheckIn} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Check-in
              </Button>
            )}

            {canReschedule() && (
              <Button
                variant="outline"
                onClick={() => setRescheduleModalOpen(true)}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Đổi lịch
              </Button>
            )}

            {canCancel() && (
              <Button
                variant="outline"
                onClick={() => setCancelModalOpen(true)}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Hủy lịch
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleDownloadCalendar}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Lưu lịch
            </Button>

            {appointment.type === 'ONLINE' && appointment.status === 'CONFIRMED' && (
              <Button variant="primary" leftIcon={<Video className="w-4 h-4" />}>
                Tham gia cuộc gọi
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clinic Location (for IN_PERSON appointments) */}
      {appointment.type === 'IN_PERSON' && (
        <Card>
          <CardHeader>
            <CardTitle>Địa điểm khám</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Building2 className="w-6 h-6 text-sage-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-sage-900 mb-1">
                  {appointment.clinicName || 'Phòng khám Đa khoa Trung tâm'}
                </h3>
                <p className="text-sage-600 mb-3">
                  {appointment.clinicAddress || '123 Đường Đinh Tiên Hoàng, Quận 1, TP.HCM'}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Navigation className="w-4 h-4" />}
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(appointment.clinicAddress || '123 Đinh Tiên Hoàng, Q1, TP.HCM')}`,
                        '_blank'
                      )
                    }
                  >
                    Chỉ đường
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(appointment.clinicAddress || '123 Đinh Tiên Hoàng, Q1, TP.HCM')
                      showToast({ type: 'success', message: 'Đã sao chép địa chỉ' })
                    }}
                  >
                    Sao chép địa chỉ
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Info */}
      {appointment.paymentId && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600 mb-1">Trạng thái thanh toán</p>
                <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>
              </div>

              <Link to={`/payments`}>
                <Button variant="outline" size="sm" leftIcon={<CreditCard className="w-4 h-4" />}>
                  Xem hóa đơn
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        appointment={appointment}
        onConfirm={handleReschedule}
      />

      <CancelAppointmentModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        appointment={appointment}
        onConfirm={handleCancel}
      />
    </div>
  )
}

export default AppointmentDetail
