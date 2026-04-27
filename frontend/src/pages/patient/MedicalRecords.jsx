import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FileText,
  Calendar,
  User,
  Pill,
  ChevronRight,
  Search,
  X,
  Inbox
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { SkeletonCard } from '@/components/ui/Loading'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { medicalRecordApi } from '@/api/medicalRecordApiWrapper'
import { formatDate } from '@/lib/utils'
import { vi } from '@/lib/translations'

const MedicalRecords = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [records, setRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [records, searchQuery])

  const fetchRecords = async () => {
    setIsLoading(true)
    try {
      const data = await medicalRecordApi.getByPatientId(user.id)
      // Sort by date descending (newest first)
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setRecords(sortedData)
    } catch (error) {
      console.error('Failed to fetch medical records:', error)
      showToast({
        type: 'error',
        message: 'Không thể tải hồ sơ bệnh án',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterRecords = () => {
    if (!searchQuery) {
      setFilteredRecords(records)
      return
    }

    const filtered = records.filter(
      record =>
        record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredRecords(filtered)
  }

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
      <PageHeader
        title={vi.medicalRecords.title}
        description="Xem lại lịch sử khám bệnh, chẩn đoán và các đơn thuốc liên quan trong cấu trúc dễ tra cứu."
      />

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sage-400" />
            <Input
              type="text"
              placeholder="Tìm theo chẩn đoán hoặc bác sĩ..."
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

      {/* Records Timeline */}
      {filteredRecords.length === 0 ? (
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
                {vi.medicalRecords.noRecords}
              </h3>
              <p className="text-sage-600">
                {searchQuery
                  ? 'Không tìm thấy hồ sơ nào phù hợp'
                  : 'Chưa có hồ sơ bệnh án nào'}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-sage-200 hidden md:block" />

          {/* Records */}
          <div className="space-y-6">
            {filteredRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Timeline Dot */}
                <div className="absolute left-6 top-6 w-4 h-4 bg-sage-600 rounded-full border-4 border-cream-50 hidden md:block" />

                <Card hover className="md:ml-16">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left: Record Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-sage-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-sage-900 mb-1">
                              {record.diagnosis}
                            </h3>
                            <div className="flex flex-wrap gap-3 text-sm text-sage-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(record.createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {record.doctorName}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Symptoms */}
                        {record.symptoms && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-sage-900">Triệu chứng:</span>
                            <p className="text-sm text-sage-700 mt-1">
                              {record.symptoms}
                            </p>
                          </div>
                        )}

                        {/* Treatment Plan */}
                        {record.treatmentPlan && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-sage-900">Phương án điều trị:</span>
                            <p className="text-sm text-sage-700 mt-1">{record.treatmentPlan}</p>
                          </div>
                        )}

                        {/* Follow-up Date */}
                        {record.followUpDate && (
                          <Badge className="bg-terra-100 text-terra-800 border-terra-200">
                            <Calendar className="w-3 h-3 mr-1" />
                            Tái khám: {formatDate(record.followUpDate)}
                          </Badge>
                        )}
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        {record.prescriptionId && (
                          <Link to={`/prescriptions/${record.prescriptionId}`}>
                            <Button variant="outline" size="sm" className="text-terra-700 border-terra-200 hover:bg-terra-50">
                              <Pill className="w-4 h-4 mr-1" />
                              Đơn thuốc
                            </Button>
                          </Link>
                        )}
                        <Link to={`/medical-records/${record.id}`}>
                          <Button variant="outline" size="sm">
                            {vi.medicalRecords.viewRecord}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicalRecords
