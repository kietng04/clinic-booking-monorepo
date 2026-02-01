import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, User, Calendar, MessageCircle, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { userApi } from '@/api/userApiWrapper'
import { medicalRecordApi } from '@/api/medicalRecordApiWrapper'
import { formatDate } from '@/lib/utils'
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
      p.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredPatients(filtered)
  }

  const viewPatientDetails = async (patient) => {
    setSelectedPatient(patient)
    try {
      const records = await medicalRecordApi.getRecordsByPatient(patient.id)
      setPatientRecords(records)
      setShowDetailModal(true)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải hồ sơ bệnh nhân' })
    }
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
                    <p className="text-sm text-sage-600">{patient.age || 'N/A'} tuổi</p>
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

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => viewPatientDetails(patient)}
                    leftIcon={<User className="w-4 h-4" />}
                  >
                    {vi.doctor.patients.viewProfile}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
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
                <p className="text-sm text-sage-600">{selectedPatient.phone || 'Chưa có SĐT'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sage-900 mb-3">{vi.doctor.patients.appointmentHistory}</h4>
              <div className="space-y-2">
                {patientRecords.length > 0 ? (
                  patientRecords.map(record => (
                    <div key={record.id} className="p-3 bg-cream-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sage-900">{record.diagnosis}</p>
                          <p className="text-sm text-sage-600">{formatDate(record.date)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-sage-500">Chưa có hồ sơ khám bệnh</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                {vi.doctor.patients.sendMessage}
              </Button>
              <Button className="flex-1">
                Đặt lịch khám
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DoctorPatients
