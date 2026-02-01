import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  Pill,
  Plus,
  Trash2,
  Save,
  User,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { medicalRecordApi } from '@/api/medicalRecordApiWrapper'
import { prescriptionApi } from '@/api/prescriptionApiWrapper'
import { medicationApi } from '@/api/medicationApiWrapper'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { formatDate } from '@/lib/utils'

const CreateMedicalRecord = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get('appointmentId')

  const { user } = useAuthStore()
  const { showToast } = useUIStore()

  // Form state
  const [appointment, setAppointment] = useState(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [treatmentPlan, setTreatmentPlan] = useState('')
  const [notes, setNotes] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState([])
  const [medications, setMedications] = useState([])
  const [isLoadingMedications, setIsLoadingMedications] = useState(false)

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchAppointmentDetails()
    fetchMedications()
  }, [appointmentId])

  const fetchAppointmentDetails = async () => {
    if (!appointmentId) {
      showToast({ type: 'error', message: 'Không tìm thấy thông tin lịch hẹn' })
      navigate('/doctor/appointments')
      return
    }

    setIsLoading(true)
    try {
      const data = await appointmentApi.getAppointment(appointmentId)
      setAppointment(data)
      // Pre-fill symptoms if available from appointment
      if (data.symptoms) {
        setSymptoms(data.symptoms)
      }
    } catch (error) {
      console.error('Failed to fetch appointment:', error)
      showToast({ type: 'error', message: 'Không thể tải thông tin lịch hẹn' })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMedications = async () => {
    setIsLoadingMedications(true)
    try {
      const data = await medicationApi.getActiveMedications()
      setMedications(data)
    } catch (error) {
      console.error('Failed to fetch medications:', error)
      showToast({ type: 'error', message: 'Không thể tải danh sách thuốc' })
    } finally {
      setIsLoadingMedications(false)
    }
  }

  const addPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      {
        id: Date.now(), // Temporary ID for UI
        medicationId: '',
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        notes: ''
      }
    ])
  }

  const removePrescription = (id) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id))
  }

  const updatePrescription = (id, field, value) => {
    setPrescriptions(prescriptions.map((p) => {
      if (p.id === id) {
        // If medication is selected, auto-fill from catalog
        if (field === 'medicationId') {
          const medication = medications.find(m => m.id === parseInt(value))
          if (medication) {
            return {
              ...p,
              medicationId: value,
              medicationName: medication.name,
              dosage: p.dosage || medication.defaultDosage || '',
              frequency: p.frequency || medication.defaultFrequency || '',
              duration: p.duration || medication.defaultDuration || '',
              instructions: p.instructions || medication.instructions || ''
            }
          }
        }
        return { ...p, [field]: value }
      }
      return p
    }))
  }

  const validateForm = () => {
    if (!diagnosis.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập chẩn đoán' })
      return false
    }

    // Validate prescriptions
    for (const prescription of prescriptions) {
      if (!prescription.medicationId && !prescription.medicationName) {
        showToast({ type: 'error', message: 'Vui lòng chọn hoặc nhập tên thuốc' })
        return false
      }
    }

    return true
  }

  const canSave =
    appointment?.status === 'CONFIRMED' || appointment?.status === 'COMPLETED'

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!canSave) {
      showToast({
        type: 'error',
        message: 'Chỉ có thể tạo hồ sơ cho lịch hẹn đã xác nhận'
      })
      return
    }

    if (!validateForm()) return

    setIsSaving(true)
    try {
      // Create medical record
      const medicalRecordData = {
        appointmentId: parseInt(appointmentId),
        patientId: appointment.patientId,
        doctorId: user.id,
        patientName: appointment.patientName,
        doctorName: user.fullName,
        diagnosis,
        symptoms,
        treatmentPlan,
        notes,
        followUpDate: followUpDate || null
      }

      const createdRecord = await medicalRecordApi.create(medicalRecordData)

      // Create prescriptions for this medical record
      if (prescriptions.length > 0) {
        for (const prescription of prescriptions) {
          const prescriptionData = {
            doctorId: user.id,
            medicationId: prescription.medicationId ? parseInt(prescription.medicationId) : null,
            medicationName: prescription.medicationName,
            dosage: prescription.dosage,
            frequency: prescription.frequency,
            duration: prescription.duration,
            instructions: prescription.instructions,
            notes: prescription.notes
          }

          await prescriptionApi.create(createdRecord.id, prescriptionData)
        }
      }

      // Mark appointment as completed (skip if already completed)
      if (appointment?.status === 'CONFIRMED') {
        await appointmentApi.completeAppointment(appointmentId)
      }

      showToast({ type: 'success', message: 'Hồ sơ bệnh án đã được tạo thành công' })
      navigate('/doctor/appointments')
    } catch (error) {
      console.error('Failed to create medical record:', error)
      showToast({ type: 'error', message: 'Không thể tạo hồ sơ bệnh án' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sage-600">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-sage-600">Không tìm thấy thông tin lịch hẹn</p>
        <Button onClick={() => navigate('/doctor/appointments')} className="mt-4">
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
            onClick={() => navigate('/doctor/appointments')}
            leftIcon={<ArrowLeft />}
          >
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-sage-900">
              Tạo hồ sơ bệnh án
            </h1>
            <p className="text-sage-600 mt-1">Lịch hẹn #{appointmentId}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Appointment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin lịch hẹn</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-sage-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                Bệnh nhân
              </label>
              <p className="text-sage-900 font-medium mt-1">{appointment.patientName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-sage-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ngày khám
              </label>
              <p className="text-sage-900 font-medium mt-1">
                {formatDate(appointment.appointmentDate)} {appointment.appointmentTime}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-sage-600">
                Trạng thái
              </label>
              <div className="mt-1">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {appointment.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Record Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Thông tin bệnh án
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-sage-900 mb-2">
                Chẩn đoán <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="VD: Viêm họng cấp do virus"
                required
              />
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-sage-900 mb-2">
                Triệu chứng
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="VD: Đau họng, sốt 38.5°C, mệt mỏi"
                className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                rows={3}
              />
            </div>

            {/* Treatment Plan */}
            <div>
              <label className="block text-sm font-medium text-sage-900 mb-2">
                Phương án điều trị
              </label>
              <textarea
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="VD: Nghỉ ngơi, uống nhiều nước, dùng thuốc giảm đau hạ sốt"
                className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                rows={3}
              />
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="block text-sm font-medium text-sage-900 mb-2">
                Ngày tái khám
              </label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-sage-900 mb-2">
                Ghi chú của bác sĩ
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú thêm..."
                className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Đơn thuốc
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Plus />}
                onClick={addPrescription}
              >
                Thêm thuốc
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescriptions.length === 0 ? (
              <div className="text-center py-8 text-sage-500">
                Chưa có thuốc nào được kê. Nhấn "Thêm thuốc" để thêm.
              </div>
            ) : (
              prescriptions.map((prescription, index) => (
                <div key={prescription.id} className="p-4 border border-sage-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sage-900">Thuốc {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePrescription(prescription.id)}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Xóa
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {/* Medication Selection */}
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-1">
                        Chọn thuốc từ danh mục
                      </label>
                      <select
                        value={prescription.medicationId}
                        onChange={(e) => updatePrescription(prescription.id, 'medicationId', e.target.value)}
                        className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                      >
                        <option value="">-- Chọn thuốc --</option>
                        {medications.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.name} {med.genericName && `(${med.genericName})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Or manual entry */}
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-1">
                        Hoặc nhập tên thuốc
                      </label>
                      <Input
                        type="text"
                        value={prescription.medicationName}
                        onChange={(e) => updatePrescription(prescription.id, 'medicationName', e.target.value)}
                        placeholder="Tên thuốc"
                        disabled={!!prescription.medicationId}
                      />
                    </div>

                    {/* Dosage */}
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-1">
                        Liều dùng
                      </label>
                      <Input
                        type="text"
                        value={prescription.dosage}
                        onChange={(e) => updatePrescription(prescription.id, 'dosage', e.target.value)}
                        placeholder="VD: 1 viên"
                      />
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-1">
                        Tần suất
                      </label>
                      <Input
                        type="text"
                        value={prescription.frequency}
                        onChange={(e) => updatePrescription(prescription.id, 'frequency', e.target.value)}
                        placeholder="VD: 3 lần/ngày"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-1">
                        Thời gian
                      </label>
                      <Input
                        type="text"
                        value={prescription.duration}
                        onChange={(e) => updatePrescription(prescription.id, 'duration', e.target.value)}
                        placeholder="VD: 5 ngày"
                      />
                    </div>

                    {/* Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-1">
                        Hướng dẫn sử dụng
                      </label>
                      <Input
                        type="text"
                        value={prescription.instructions}
                        onChange={(e) => updatePrescription(prescription.id, 'instructions', e.target.value)}
                        placeholder="VD: Uống sau ăn"
                      />
                    </div>
                  </div>

                  {/* Prescription Notes */}
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1">
                      Ghi chú
                    </label>
                    <Input
                      type="text"
                      value={prescription.notes}
                      onChange={(e) => updatePrescription(prescription.id, 'notes', e.target.value)}
                      placeholder="Ghi chú thêm cho thuốc này..."
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/doctor/appointments')}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <div className="flex flex-col items-end gap-2">
            {!canSave && (
              <p className="text-sm text-sage-600">
                Chỉ có thể tạo hồ sơ cho lịch hẹn đã xác nhận
              </p>
            )}
            <Button
              type="submit"
              leftIcon={<Save />}
              disabled={isSaving || !canSave}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  )
}

export default CreateMedicalRecord
