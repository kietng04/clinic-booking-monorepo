import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Pill,
  Download,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { useUIStore } from '@/store/uiStore'
import { medicalRecordApi } from '@/api/medicalRecordApiWrapper'
import { prescriptionApi } from '@/api/prescriptionApiWrapper'
import { formatDate } from '@/lib/utils'
import { vi } from '@/lib/translations'

const MedicalRecordDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  const [record, setRecord] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecordDetail()
  }, [id])

  const fetchRecordDetail = async () => {
    setIsLoading(true)
    try {
      // Fetch medical record
      const recordData = await medicalRecordApi.getById(id)
      setRecord(recordData)

      // Fetch prescriptions for this medical record
      const prescriptionData = await prescriptionApi.getByMedicalRecordId(id)
      setPrescriptions(prescriptionData || [])
    } catch (error) {
      console.error('Failed to fetch medical record:', error)
      showToast({
        type: 'error',
        message: 'Không thể tải hồ sơ bệnh án',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    )
  }

  if (!record) {
    return (
      <div className="text-center py-12">
        <p className="text-sage-600">Không tìm thấy hồ sơ bệnh án</p>
        <Button onClick={() => navigate('/medical-records')} className="mt-4">
          Quay lại
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/medical-records')}
            leftIcon={<ArrowLeft />}
          >
            {vi.common.back}
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-sage-900">
              {vi.medicalRecords.recordDetail}
            </h1>
            <p className="text-sage-600 mt-1">{formatDate(record.createdAt)}</p>
          </div>
        </div>
        <Button variant="outline" leftIcon={<Download />}>
          {vi.medicalRecords.downloadPDF}
        </Button>
      </div>

      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {vi.medicalRecords.generalInfo}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-sage-600">
              {vi.medicalRecords.visitDate}
            </label>
            <p className="text-sage-900 font-medium mt-1">{formatDate(record.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-sage-600">
              {vi.medicalRecords.doctor}
            </label>
            <p className="text-sage-900 font-medium mt-1">{record.doctorName}</p>
          </div>
          {record.followUpDate && (
            <div>
              <label className="text-sm font-medium text-sage-600">
                Ngày tái khám
              </label>
              <p className="text-sage-900 font-medium mt-1">{formatDate(record.followUpDate)}</p>
            </div>
          )}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-sage-600">
              {vi.medicalRecords.diagnosis}
            </label>
            <p className="text-sage-900 font-medium mt-1 text-lg">{record.diagnosis}</p>
          </div>
        </CardContent>
      </Card>

      {/* Symptoms & Treatment */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{vi.medicalRecords.symptoms}</CardTitle>
          </CardHeader>
          <CardContent>
            {record.symptoms ? (
              <p className="text-sage-700 whitespace-pre-line">{record.symptoms}</p>
            ) : (
              <p className="text-sage-500">Không có triệu chứng được ghi nhận</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phương án điều trị</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sage-700 whitespace-pre-line">{record.treatmentPlan || 'Không có thông tin điều trị'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions */}
      {prescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Đơn thuốc ({prescriptions.length} loại)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sage-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-sage-900">
                      Tên thuốc
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-sage-900">
                      Liều dùng
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-sage-900">
                      Tần suất
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-sage-900">
                      Thời gian
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-sage-900">
                      Hướng dẫn
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id} className="border-b border-sage-100">
                      <td className="py-3 px-4 text-sage-900 font-medium">{prescription.medicationName}</td>
                      <td className="py-3 px-4 text-sage-700">{prescription.dosage}</td>
                      <td className="py-3 px-4 text-sage-700">{prescription.frequency}</td>
                      <td className="py-3 px-4 text-sage-700">{prescription.duration}</td>
                      <td className="py-3 px-4 text-sage-700">{prescription.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Show notes from prescriptions if any */}
            {prescriptions.some(p => p.notes) && (
              <div className="mt-4 space-y-2">
                {prescriptions.filter(p => p.notes).map((prescription) => (
                  <div key={prescription.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900 mb-1">
                      Ghi chú cho {prescription.medicationName}:
                    </p>
                    <p className="text-sm text-yellow-800">{prescription.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {record.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Ghi chú của bác sĩ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sage-700 whitespace-pre-line">{record.notes}</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

export default MedicalRecordDetail
