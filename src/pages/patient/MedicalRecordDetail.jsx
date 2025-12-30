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
import { medicalRecordApi, prescriptionApi } from '@/api/mockApi'
import { formatDate } from '@/lib/utils'
import { vi } from '@/lib/translations'

const MedicalRecordDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  const [record, setRecord] = useState(null)
  const [prescription, setPrescription] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecordDetail()
  }, [id])

  const fetchRecordDetail = async () => {
    setIsLoading(true)
    try {
      const recordData = await medicalRecordApi.getRecordById(id)
      setRecord(recordData)

      if (recordData.prescriptionId) {
        const prescriptionData = await prescriptionApi.getPrescriptionById(recordData.prescriptionId)
        setPrescription(prescriptionData)
      }
    } catch (error) {
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
            <p className="text-sage-600 mt-1">{formatDate(record.date)}</p>
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
            <p className="text-sage-900 font-medium mt-1">{formatDate(record.date)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-sage-600">
              {vi.medicalRecords.doctor}
            </label>
            <p className="text-sage-900 font-medium mt-1">{record.doctorName}</p>
          </div>
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
            {record.symptoms && record.symptoms.length > 0 ? (
              <ul className="space-y-2">
                {record.symptoms.map((symptom, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-sage-600 rounded-full mt-2" />
                    <span className="text-sage-700">{symptom}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sage-500">Không có triệu chứng được ghi nhận</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{vi.medicalRecords.treatment}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sage-700">{record.treatment || 'Không có thông tin điều trị'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Vital Signs */}
      {record.vitalSigns && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Chỉ số sinh tồn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {record.vitalSigns.bloodPressure && (
                <div className="bg-sage-50 p-4 rounded-lg">
                  <p className="text-sm text-sage-600 mb-1">Huyết áp</p>
                  <p className="text-lg font-semibold text-sage-900">
                    {record.vitalSigns.bloodPressure} <span className="text-sm font-normal">mmHg</span>
                  </p>
                </div>
              )}
              {record.vitalSigns.heartRate && (
                <div className="bg-sage-50 p-4 rounded-lg">
                  <p className="text-sm text-sage-600 mb-1">Nhịp tim</p>
                  <p className="text-lg font-semibold text-sage-900">
                    {record.vitalSigns.heartRate} <span className="text-sm font-normal">bpm</span>
                  </p>
                </div>
              )}
              {record.vitalSigns.temperature && (
                <div className="bg-sage-50 p-4 rounded-lg">
                  <p className="text-sm text-sage-600 mb-1">Nhiệt độ</p>
                  <p className="text-lg font-semibold text-sage-900">
                    {record.vitalSigns.temperature} <span className="text-sm font-normal">°F</span>
                  </p>
                </div>
              )}
              {record.vitalSigns.weight && (
                <div className="bg-sage-50 p-4 rounded-lg">
                  <p className="text-sm text-sage-600 mb-1">Cân nặng</p>
                  <p className="text-lg font-semibold text-sage-900">
                    {record.vitalSigns.weight} <span className="text-sm font-normal">lbs</span>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prescription */}
      {prescription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              {vi.medicalRecords.prescription}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sage-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-sage-900">
                      {vi.medicalRecords.medication}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-sage-900">
                      {vi.medicalRecords.dosage}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-sage-900">
                      {vi.medicalRecords.instructions}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-sage-900">
                      {vi.medicalRecords.duration}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.medications.map((med) => (
                    <tr key={med.id} className="border-b border-sage-100">
                      <td className="py-3 px-4 text-sage-900 font-medium">{med.name}</td>
                      <td className="py-3 px-4 text-sage-700">{med.dosage}</td>
                      <td className="py-3 px-4 text-sage-700">{med.frequency}</td>
                      <td className="py-3 px-4 text-sage-700">{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {prescription.notes && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-900 mb-1">Ghi chú:</p>
                <p className="text-sm text-yellow-800">{prescription.notes}</p>
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
