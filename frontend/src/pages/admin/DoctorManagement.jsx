import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, CheckCircle, XCircle, Star, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Loading'
import { useUIStore } from '@/store/uiStore'
import { userApi } from '@/api/userApiWrapper'
import { formatPhone } from '@/lib/utils'
import { vi } from '@/lib/translations'

const DoctorManagement = () => {
  const { showToast } = useUIStore()
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchQuery, statusFilter])

  const fetchDoctors = async () => {
    setIsLoading(true)
    try {
      const data = await userApi.getDoctors()
      setDoctors(data)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải danh sách bác sĩ' })
    } finally {
      setIsLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = [...doctors]

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredDoctors(filtered)
  }

  const handleApprove = async (doctorId) => {
    try {
      await userApi.approveDoctor(doctorId)
      showToast({ type: 'success', message: vi.admin.doctors.doctorApproved })
      fetchDoctors()
      setShowDetailModal(false)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể phê duyệt bác sĩ' })
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập lý do từ chối' })
      return
    }

    try {
      await userApi.rejectDoctor(selectedDoctor.id, rejectionReason)
      showToast({ type: 'success', message: vi.admin.doctors.doctorRejected })
      setRejectionReason('')
      setShowDetailModal(false)
      fetchDoctors()
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể từ chối bác sĩ' })
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { class: 'bg-yellow-100 text-yellow-800', label: vi.admin.doctors.pending },
      APPROVED: { class: 'bg-green-100 text-green-800', label: vi.admin.doctors.approved },
      REJECTED: { class: 'bg-red-100 text-red-800', label: vi.admin.doctors.rejected },
    }
    return badges[status] || { class: 'bg-gray-100 text-gray-800', label: status }
  }

  const tabs = [
    { id: 'all', label: vi.admin.doctors.allDoctors },
    { id: 'PENDING', label: vi.admin.doctors.pending },
    { id: 'APPROVED', label: vi.admin.doctors.approved },
    { id: 'REJECTED', label: vi.admin.doctors.rejected },
  ]

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
          {vi.admin.doctors.title}
        </h1>
        <p className="text-sage-600">Quản lý và phê duyệt bác sĩ</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === tab.id
                      ? 'bg-sage-600 text-white'
                      : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Input
              type="text"
              placeholder="Tìm theo tên hoặc chuyên khoa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor, index) => {
          const statusBadge = getStatusBadge(doctor.status || 'APPROVED')

          return (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar
                      src={doctor.avatar || `https://i.pravatar.cc/150?u=${doctor.id}`}
                      alt={doctor.name}
                      size="lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sage-900">{doctor.name}</h3>
                        <Badge className={statusBadge.class}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-sage-600 mb-2">{doctor.specialization}</p>
                      <div className="flex items-center gap-2 text-sm">
                        {doctor.rating && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{doctor.rating}</span>
                          </div>
                        )}
                        {doctor.yearsOfExperience && (
                          <div className="flex items-center gap-1 text-sage-600">
                            <Award className="w-4 h-4" />
                            <span>{doctor.yearsOfExperience} {vi.admin.doctors.years}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedDoctor(doctor)
                      setShowDetailModal(true)
                    }}
                  >
                    {vi.admin.doctors.doctorDetails}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredDoctors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-sage-500">
            Không tìm thấy bác sĩ nào
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedDoctor(null)
          setRejectionReason('')
        }}
        title={selectedDoctor?.name}
      >
        {selectedDoctor && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-sage-50 rounded-lg">
              <Avatar
                src={selectedDoctor.avatar || `https://i.pravatar.cc/150?u=${selectedDoctor.id}`}
                size="xl"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-sage-900">{selectedDoctor.name}</h3>
                <p className="text-sage-600">{selectedDoctor.specialization}</p>
                {selectedDoctor.rating && (
                  <div className="flex items-center gap-1 text-yellow-600 mt-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{selectedDoctor.rating}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-sage-600">Email</label>
                <p className="font-medium text-sage-900">{selectedDoctor.email}</p>
              </div>
              <div>
                <label className="text-sm text-sage-600">Số điện thoại</label>
                <p className="font-medium text-sage-900 break-all">{formatPhone(selectedDoctor.phone) || 'N/A'}</p>
              </div>
              {selectedDoctor.licenseNumber && (
                <div className="col-span-2">
                  <label className="text-sm text-sage-600">{vi.admin.doctors.licenseNumber}</label>
                  <p className="font-medium text-sage-900">{selectedDoctor.licenseNumber}</p>
                </div>
              )}
              {selectedDoctor.yearsOfExperience && (
                <div>
                  <label className="text-sm text-sage-600">{vi.admin.doctors.experience}</label>
                  <p className="font-medium text-sage-900">{selectedDoctor.yearsOfExperience} năm</p>
                </div>
              )}
              {selectedDoctor.education && (
                <div className="col-span-2">
                  <label className="text-sm text-sage-600">Học vấn</label>
                  <p className="font-medium text-sage-900">{selectedDoctor.education}</p>
                </div>
              )}
            </div>

            {selectedDoctor.status === 'PENDING' && (
              <div className="space-y-3">
                <div className="border-t pt-4">
                  <Input
                    label={vi.admin.doctors.rejectionReason}
                    as="textarea"
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Nhập lý do từ chối (nếu từ chối)..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleReject}
                    leftIcon={<XCircle />}
                  >
                    {vi.admin.doctors.reject}
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => handleApprove(selectedDoctor.id)}
                    leftIcon={<CheckCircle />}
                  >
                    {vi.admin.doctors.approve}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DoctorManagement
