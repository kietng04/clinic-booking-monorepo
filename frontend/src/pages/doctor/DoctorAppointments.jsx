import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Video, CheckCircle, FileText, Pill } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { medicalRecordApi } from '@/api/realApis/medicalRecordApi'
import { formatDate, formatTime, translateStatus } from '@/lib/utils'
import { vi } from '@/lib/translations'

const DoctorAppointments = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('today')
  const [isLoading, setIsLoading] = useState(true)
  const [medicalRecordsByAppointment, setMedicalRecordsByAppointment] = useState({})
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

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
      if (filter === 'completed') {
        await fetchMedicalRecords(filtered)
      } else {
        setMedicalRecordsByAppointment({})
        setSelectedMedicalRecord(null)
        setSelectedAppointment(null)
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải lịch hẹn' })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMedicalRecords = async (completedAppointments = []) => {
    if (!completedAppointments.length) {
      setMedicalRecordsByAppointment({})
      return
    }

    setIsLoadingRecords(true)
    try {
      const records = await medicalRecordApi.getByDoctorId(user.id, { page: 0, size: 200 })
      const mapByAppointment = {}

      records.forEach((record) => {
        if (record?.appointmentId) {
          mapByAppointment[record.appointmentId] = record
        }
      })

      setMedicalRecordsByAppointment(mapByAppointment)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải hồ sơ bệnh án' })
    } finally {
      setIsLoadingRecords(false)
    }
  }

  const handleOpenMedicalRecord = async (appointment) => {
    const appointmentId = appointment.id
    const record = medicalRecordsByAppointment[appointmentId]
    if (!record?.id) return

    try {
      const detail = await medicalRecordApi.getById(record.id)
      setMedicalRecordsByAppointment(prev => ({
        ...prev,
        [appointmentId]: detail,
      }))
      setSelectedMedicalRecord(detail)
      setSelectedAppointment(appointment)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải chi tiết bệnh án' })
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
                      {apt.status === 'COMPLETED' && medicalRecordsByAppointment[apt.id] && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenMedicalRecord(apt)}
                          leftIcon={<FileText className="w-4 h-4" />}
                        >
                          Xem bệnh án
                        </Button>
                      )}
                    </div>
                    {apt.status === 'COMPLETED' && !medicalRecordsByAppointment[apt.id] && !isLoadingRecords && (
                      <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                        Chưa có hồ sơ bệnh án cho lịch hẹn này
                      </p>
                    )}
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

      <Modal
        isOpen={!!selectedMedicalRecord}
        onClose={() => {
          setSelectedMedicalRecord(null)
          setSelectedAppointment(null)
        }}
        title="Chi tiết hồ sơ bệnh án"
        size="lg"
      >
        {selectedMedicalRecord && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-gradient-to-r from-sage-600 to-sage-500 text-white px-4 py-3">
              <p className="text-sm opacity-90">Bệnh nhân</p>
              <p className="text-lg font-semibold">{selectedAppointment?.patientName || selectedMedicalRecord.patientName}</p>
              <p className="text-sm opacity-90 mt-1">
                Lịch hẹn: {selectedAppointment?.date ? formatDate(selectedAppointment.date) : 'N/A'} {selectedAppointment?.time ? `- ${formatTime(selectedAppointment.time)}` : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-sage-200 bg-sage-50 p-4">
                <p className="text-xs uppercase tracking-wide text-sage-500 mb-1">Chẩn đoán</p>
                <p className="text-sage-900 font-medium">{selectedMedicalRecord.diagnosis || 'Chưa cập nhật'}</p>
              </div>
              <div className="rounded-xl border border-sage-200 bg-sage-50 p-4">
                <p className="text-xs uppercase tracking-wide text-sage-500 mb-1">Triệu chứng</p>
                <p className="text-sage-900 font-medium">{selectedMedicalRecord.symptoms || 'Chưa cập nhật'}</p>
              </div>
              <div className="rounded-xl border border-sage-200 bg-sage-50 p-4">
                <p className="text-xs uppercase tracking-wide text-sage-500 mb-1">Hướng điều trị</p>
                <p className="text-sage-900 font-medium">{selectedMedicalRecord.treatmentPlan || 'Chưa cập nhật'}</p>
              </div>
              <div className="rounded-xl border border-sage-200 bg-sage-50 p-4">
                <p className="text-xs uppercase tracking-wide text-sage-500 mb-1">Tái khám</p>
                <p className="text-sage-900 font-medium">
                  {selectedMedicalRecord.followUpDate ? formatDate(selectedMedicalRecord.followUpDate) : 'Không có'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-sage-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-sage-500 mb-2">Ghi chú bác sĩ</p>
              <p className="text-sage-800">{selectedMedicalRecord.notes || 'Không có ghi chú'}</p>
            </div>

            <div className="rounded-xl border border-sage-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="w-4 h-4 text-sage-700" />
                <p className="font-semibold text-sage-900">Đơn thuốc</p>
              </div>
              {selectedMedicalRecord.prescriptions?.length ? (
                <div className="space-y-2">
                  {selectedMedicalRecord.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="rounded-lg border border-sage-200 bg-sage-50 px-3 py-2">
                      <p className="font-medium text-sage-900">{prescription.medicationName || 'Thuốc'}</p>
                      <p className="text-sm text-sage-700">
                        {prescription.dosage || 'Liều: -'} | {prescription.frequency || 'Tần suất: -'} | {prescription.duration || 'Thời gian: -'}
                      </p>
                      {prescription.instructions && (
                        <p className="text-sm text-sage-600">{prescription.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-sage-600">Chưa kê thuốc</p>
              )}
            </div>
          </div>
        )}
      </Modal>

    </div>
  )
}

export default DoctorAppointments
