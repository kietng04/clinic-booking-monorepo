import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Calendar,
  Pill,
  FileText,
  Download,
  Printer,
  ExternalLink,
  Stethoscope
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { prescriptionApi } from '@/api/prescriptionApiWrapper'
import { formatDate } from '@/lib/utils'

const PrescriptionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [prescription, setPrescription] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPrescription()
  }, [id])

  const fetchPrescription = async () => {
    setIsLoading(true)
    try {
      const data = await prescriptionApi.getById(id)
      setPrescription(data)
    } catch (error) {
      console.error('Failed to fetch prescription:', error)
      showToast({ type: 'error', message: 'Không thể tải đơn thuốc' })
      navigate('/medical-records')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    showToast({ type: 'info', message: 'Đang tải đơn thuốc PDF...' })
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-sage-900 mb-2">Đơn thuốc không tìm thấy</h3>
            <p className="text-sage-600 mb-4">Đơn thuốc này không tồn tại hoặc bạn không có quyền truy cập.</p>
            <Button onClick={() => navigate('/medical-records')}>
              Quay lại Hồ sơ y tế
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/medical-records">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" />
            In
          </Button>
          <Button size="sm" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-1" />
            Tải PDF
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
                  <Pill className="w-6 h-6 text-sage-600" />
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold text-sage-900">Đơn Thuốc</h1>
                  <p className="text-sm text-sage-500">#{prescription.id}</p>
                </div>
              </div>
              <Badge className="bg-sage-100 text-sage-800">
                Hợp lệ
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sage-400" />
                <div>
                  <p className="text-xs text-sage-500">Ngày lập</p>
                  <p className="text-sm font-medium text-sage-900">{formatDate(prescription.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sage-400" />
                <div>
                  <p className="text-xs text-sage-500">Bác sĩ</p>
                  <p className="text-sm font-medium text-sage-900">{prescription.doctorName || 'N/A'}</p>
                </div>
              </div>

              {prescription.appointmentId && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-sage-400" />
                  <div>
                    <p className="text-xs text-sage-500">Lịch hẹn</p>
                    <Link to="/appointments" className="text-sm font-medium text-sage-600 hover:underline">
                      Xem lịch hẹn
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Diagnosis */}
      {prescription.diagnosis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-sage-500 uppercase tracking-wider mb-3">Chẩn đoán</h2>
              <p className="text-sage-900">{prescription.diagnosis}</p>
              {prescription.icdCode && (
                <Badge className="bg-terra-100 text-terra-800 mt-2">ICD-10: {prescription.icdCode}</Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Medications Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-sage-500 uppercase tracking-wider mb-4">Danh sách Thuốc</h2>

            {prescription.medications && prescription.medications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sage-200">
                      <th className="text-left py-3 font-medium text-sage-500">#</th>
                      <th className="text-left py-3 font-medium text-sage-500">Thuốc</th>
                      <th className="text-left py-3 font-medium text-sage-500">Liều lượng</th>
                      <th className="text-left py-3 font-medium text-sage-500">Tần số</th>
                      <th className="text-left py-3 font-medium text-sage-500">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.medications.map((med, index) => (
                      <tr key={index} className="border-b border-sage-50 hover:bg-sage-50 transition-colors">
                        <td className="py-3 text-sage-400">{index + 1}</td>
                        <td className="py-3">
                          <p className="font-medium text-sage-900">{med.name || med.medicineName}</p>
                          {med.instructions && (
                            <p className="text-xs text-sage-500 mt-0.5">{med.instructions}</p>
                          )}
                        </td>
                        <td className="py-3 text-sage-700">{med.dosage}</td>
                        <td className="py-3 text-sage-700">{med.frequency}</td>
                        <td className="py-3 text-sage-700">{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sage-500 text-sm text-center py-4">Chưa có thuốc nào được ghi</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Doctor Notes */}
      {prescription.notes && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-sage-500 uppercase tracking-wider mb-3">Ghi chú của Bác sĩ</h2>
              <p className="text-sage-900 whitespace-pre-wrap">{prescription.notes}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Attachments */}
      {prescription.attachments && prescription.attachments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-sage-500 uppercase tracking-wider mb-3">Tệp đính kèm</h2>
              <div className="space-y-2">
                {prescription.attachments.map((att, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sage-500" />
                      <span className="text-sm text-sage-700">{att.name || att.fileName}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default PrescriptionDetail
