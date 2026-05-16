import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, FileText, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { medicalRecordApi } from '@/api/medicalRecordApiWrapper'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { doctorPrimaryButtonClass } from './theme'

const formatDateTime = (appointment) => {
  if (!appointment?.appointmentDate) return `Lịch hẹn #${appointment?.id || ''}`.trim()

  const date = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(appointment.appointmentDate))

  const time = String(appointment.appointmentTime || '').slice(0, 5)
  return time ? `${date} • ${time}` : date
}

const textareaClassName =
  'min-h-[132px] w-full rounded-[12px] border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200'

const CreateMedicalRecord = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get('appointmentId')

  const { user } = useAuthStore()
  const { showToast } = useUIStore()

  const [appointment, setAppointment] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [advice, setAdvice] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!appointmentId) {
        showToast({ type: 'error', message: 'Không tìm thấy lịch hẹn' })
        navigate('/doctor/appointments')
        return
      }

      setIsLoading(true)
      try {
        const data = await appointmentApi.getAppointment(appointmentId)
        setAppointment(data)
        setSymptoms(data?.symptoms || '')
      } catch (error) {
        console.error('Failed to fetch appointment:', error)
        showToast({ type: 'error', message: 'Không thể tải thông tin lịch hẹn' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointmentDetails()
  }, [appointmentId, navigate, showToast])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!conclusion.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập kết luận' })
      return
    }

    if (!advice.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập dặn dò' })
      return
    }

    if (!appointment) {
      showToast({ type: 'error', message: 'Không tìm thấy thông tin lịch hẹn' })
      return
    }

    setIsSaving(true)
    try {
      await medicalRecordApi.create({
        appointmentId: Number(appointmentId),
        patientId: appointment.patientId,
        doctorId: user.id,
        patientName: appointment.patientName,
        doctorName: user.fullName,
        diagnosis: conclusion.trim(),
        symptoms: symptoms.trim(),
        treatmentPlan: advice.trim(),
        notes: '',
        followUpDate: followUpDate || null,
      })

      await appointmentApi.completeAppointment(appointmentId)

      showToast({ type: 'success', message: 'Kết quả khám đã được lưu' })
      navigate('/doctor/appointments')
    } catch (error) {
      console.error('Failed to save visit summary:', error)
      showToast({ type: 'error', message: 'Không thể lưu kết quả khám' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
          <p className="text-[15px] font-medium text-slate-600">Đang tải dữ liệu khám</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="rounded-[18px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-[15px] text-slate-600">Không tìm thấy thông tin lịch hẹn.</p>
        <Button
          onClick={() => navigate('/doctor/appointments')}
          className={`mt-4 rounded-[12px] ${doctorPrimaryButtonClass}`}
        >
          Quay lại lịch hẹn
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 rounded-[20px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/doctor/appointments')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="w-fit rounded-[10px] px-0 text-slate-600 hover:bg-transparent hover:text-slate-900"
          >
            Quay lại lịch hẹn
          </Button>
          <div>
            <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-slate-900">
              Kết quả khám
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-600">
              Hoàn tất nội dung buổi khám với 4 thông tin cốt lõi để khép lại lịch hẹn.
            </p>
          </div>
        </div>

        <div className="min-w-[240px] rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Phiên khám
          </div>
          <div className="mt-2 text-[18px] font-semibold text-slate-900">
            {appointment.patientName || 'Bệnh nhân'}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[14px] text-slate-600">
            <CalendarDays className="h-4 w-4" />
            <span>{formatDateTime(appointment)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-[20px] border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <CardHeader className="border-b border-slate-100 pb-5">
            <CardTitle className="flex items-center gap-2 text-[20px] font-semibold tracking-[-0.02em] text-slate-900">
              <FileText className="h-5 w-5 text-slate-500" />
              Nội dung kết quả khám
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 px-6 py-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[14px] font-semibold text-slate-900">
                Triệu chứng
              </label>
              <textarea
                value={symptoms}
                onChange={(event) => setSymptoms(event.target.value)}
                placeholder="Mô tả ngắn gọn tình trạng hiện tại của bệnh nhân"
                className={textareaClassName}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-slate-900">
                Kết luận <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={conclusion}
                onChange={(event) => setConclusion(event.target.value)}
                placeholder="Ví dụ: Viêm họng cấp, chưa ghi nhận biến chứng"
                className={textareaClassName}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-slate-900">
                Dặn dò <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={advice}
                onChange={(event) => setAdvice(event.target.value)}
                placeholder="Hướng dẫn chăm sóc, theo dõi hoặc lưu ý sau khám"
                className={textareaClassName}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[14px] font-semibold text-slate-900">
                Ngày tái khám
                <span className="ml-2 text-[13px] font-medium text-slate-500">(optional)</span>
              </label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(event) => setFollowUpDate(event.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="h-12 rounded-[12px] border-slate-200 text-[15px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/doctor/appointments')}
            disabled={isSaving}
            className="rounded-[12px] border-slate-200"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            leftIcon={<Save className="h-4 w-4" />}
            disabled={isSaving}
            className={`rounded-[12px] ${doctorPrimaryButtonClass}`}
          >
            {isSaving ? 'Đang lưu kết quả...' : 'Hoàn thành lịch hẹn'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateMedicalRecord
