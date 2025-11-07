import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, User, Calendar, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { userApi } from '@/api/userApiWrapper'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { formatDate, formatPhone } from '@/lib/utils'
import { vi } from '@/lib/translations'

const DoctorPatients = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientRecords, setPatientRecords] = useState([])
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    filterPatients()
  }, [patients, searchQuery])

  const fetchPatients = async () => {
    setIsLoading(true)
    try {
      const data = await userApi.getDoctorPatients(user.id)
      setPatients(data)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải danh sách bệnh nhân' })
    } finally {
      setIsLoading(false)
    }
  }

  const filterPatients = () => {
    if (!searchQuery) {
      setFilteredPatients(patients)
      return
    }
    const filtered = patients.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatPhone(p.phone)?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredPatients(filtered)
  }

  const viewPatientDetails = async (patient) => {
    setSelectedPatient(patient)
    try {
      // Fetch appointments for this patient with current doctor
      const appointments = await appointmentApi.getPatientAppointments(patient.id)
      // Filter for appointments with this doctor
      const doctorAppointments = appointments.filter(apt => apt.doctorId === user.id)
      setPatientRecords(doctorAppointments)
      setShowDetailModal(true)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setPatientRecords([])
      setShowDetailModal(true)
    }
  }

  const getAgeLabel = (age) => {
    if (typeof age === 'number' && Number.isFinite(age) && age >= 0) {
      return `${age} tuổi`
    }
    return 'Chưa cập nhật tuổi'
  }

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
          {vi.doctor.patients.title}
        </h1>
        <p className="text-sage-600">Quản lý thông tin bệnh nhân của bạn</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Input
            type="text"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient, index) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar
                    src={patient.avatar || `https://i.pravatar.cc/150?u=${patient.id}`}
                    alt={patient.name}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-sage-900 mb-1">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-sage-600">{getAgeLabel(patient.age)}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-sage-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{vi.doctor.patients.lastVisit}: {patient.lastVisit ? formatDate(patient.lastVisit) : 'Chưa có'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{vi.doctor.patients.totalAppointments}: {patient.appointmentCount || 0}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => viewPatientDetails(patient)}
                  leftIcon={<User className="w-4 h-4" />}
                >
                  {vi.doctor.patients.viewProfile}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-sage-500">
            {searchQuery ? 'Không tìm thấy bệnh nhân nào' : vi.doctor.patients.noPatients}
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedPatient(null)
          setPatientRecords([])
        }}
        title={`Hồ sơ: ${selectedPatient?.name}`}
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-sage-50 rounded-lg">
              <Avatar
                src={selectedPatient.avatar || `https://i.pravatar.cc/150?u=${selectedPatient.id}`}
                size="lg"
              />
              <div>
                <h3 className="font-semibold text-sage-900">{selectedPatient.name}</h3>
                <p className="text-sm text-sage-600 break-all">{formatPhone(selectedPatient.phone) || 'Chưa có SĐT'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sage-900 mb-3">{vi.doctor.patients.appointmentHistory}</h4>
              <div className="space-y-2">
                {patientRecords.length > 0 ? (
                  patientRecords.map(apt => (
                    <div key={apt.id} className="p-3 bg-cream-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                                apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                              }`}>
                              {apt.status === 'COMPLETED' ? 'Hoàn thành' :
                                apt.status === 'CONFIRMED' ? 'Đã xác nhận' :
                                  apt.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ xác nhận'}
                            </span>
                          </div>
                          <p className="text-sm text-sage-600 mt-1">
                            {formatDate(apt.appointmentDate)} - {apt.appointmentTime?.slice(0, 5)}
                          </p>
                          {apt.notes && <p className="text-xs text-sage-500 mt-1">{apt.notes}</p>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-sage-500">Chưa có lịch sử khám</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DoctorPatients
