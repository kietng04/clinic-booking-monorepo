import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, FileText, Home, MapPin, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Loading } from '@/components/ui/Loading'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { useUIStore } from '@/store/uiStore'
import { loadAppointmentBookingSummary } from '@/utils/appointmentBookingSummary'

const actionButtonClass =
  '!rounded-[6px] border-[#0f4f2a] bg-[#0f4f2a] px-6 py-3 text-base font-semibold text-white shadow-none hover:bg-[#0b3f21]'
const outlineButtonClass =
  '!rounded-[6px] border-[#0f4f2a] px-6 py-3 text-base font-semibold text-[#0f4f2a] shadow-none hover:bg-[#eef5f0] hover:text-[#0f4f2a]'

const formatDateLabel = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN')
}

const formatGenderLabel = (value) => {
  switch (String(value || '').toUpperCase()) {
    case 'MALE':
      return 'Nam'
    case 'FEMALE':
      return 'Nữ'
    case 'OTHER':
      return 'Khác'
    default:
      return value || '--'
  }
}

const buildFallbackTicketCode = (appointmentId, date) => {
  if (!appointmentId) return ''

  const normalizedDate = String(date || '')
    .slice(2, 10)
    .replaceAll('-', '')
  const normalizedId = String(appointmentId).replace(/\D/g, '').slice(-4).padStart(4, '0')

  if (!normalizedDate || !normalizedId) return ''
  return `YMA${normalizedDate}${normalizedId}`
}

const normalizeTimeLabel = (time, fallbackLabel) => fallbackLabel || String(time || '').slice(0, 5) || '--'

const buildViewModel = (appointment, summary) => {
  const date = appointment?.date || appointment?.appointmentDate || summary?.date
  const appointmentId = appointment?.id || summary?.appointmentId

  return {
    appointmentId,
    ticketCode:
      appointment?.appointmentCode || summary?.appointmentCode || buildFallbackTicketCode(appointmentId, date),
    queueNumber: appointment?.queueNumber || summary?.queueNumber || '--',
    doctorName: appointment?.doctorName || summary?.doctorName || 'Bác sĩ',
    doctorAvatar: appointment?.doctorAvatar || summary?.doctorAvatar || '',
    doctorAddress:
      appointment?.clinicAddress ||
      appointment?.clinicName ||
      summary?.doctorAddress ||
      summary?.clinicName ||
      '--',
    doctorSpecialization:
      appointment?.doctorSpecialization || summary?.doctorSpecialization || 'Chưa cập nhật',
    bookingDate: date,
    bookingTime: normalizeTimeLabel(
      appointment?.time || appointment?.appointmentTime || summary?.time,
      summary?.slotLabel,
    ),
    periodLabel: summary?.periodLabel || '--',
    patientCode: summary?.patientCode || appointment?.patientCode || '--',
    patientName: appointment?.patientName || summary?.patientName || '--',
    patientDateOfBirth: summary?.patientDateOfBirth || appointment?.patientDateOfBirth || '--',
    patientPhone: summary?.patientPhone || appointment?.patientPhone || '--',
    patientGender: summary?.patientGender || appointment?.patientGender || '--',
    patientAddress: summary?.patientAddress || appointment?.patientAddress || appointment?.address || '--',
    statusLabel:
      String(appointment?.status || '').toUpperCase() === 'COMPLETED' ? 'Đã khám' : 'Đã đặt lịch',
  }
}

export default function AppointmentBookingSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useUIStore()
  const appointmentId = searchParams.get('appointmentId')

  const summary = useMemo(() => loadAppointmentBookingSummary(appointmentId), [appointmentId])
  const hasSummary = Boolean(summary && (summary.appointmentId || summary.doctorName || summary.patientName))
  const [appointment, setAppointment] = useState(null)
  const [isLoading, setIsLoading] = useState(!hasSummary)

  useEffect(() => {
    if (!appointmentId) {
      navigate('/appointments', { replace: true })
      return
    }

    let ignore = false

    const fetchAppointment = async () => {
      if (!hasSummary) {
        setIsLoading(true)
      }
      try {
        const data = await appointmentApi.getAppointment(appointmentId)
        if (!ignore) {
          setAppointment(data)
        }
      } catch (error) {
        if (!ignore && !hasSummary) {
          showToast({ type: 'error', message: 'Không thể tải phiếu khám vừa đặt.' })
          navigate('/appointments', { replace: true })
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    fetchAppointment()

    return () => {
      ignore = true
    }
  }, [appointmentId, hasSummary, navigate, showToast])

  const viewModel = useMemo(() => buildViewModel(appointment, summary), [appointment, summary])

  const handleSaveReceipt = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading text="Đang tải phiếu khám..." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="mx-auto max-w-3xl border border-[#d7e2da] bg-white">
        <div className="border-b border-[#d7e2da] px-5 py-4 sm:px-6">
          <div className="inline-flex rounded-[6px] bg-[#eff7f1] px-3 py-1 text-sm font-semibold text-[#0f4f2a]">
            Đặt lịch khám thành công
          </div>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-base font-semibold text-[#476252]">STT:</span>
            <span className="text-4xl font-bold leading-none text-[#0f4f2a]">{viewModel.queueNumber}</span>
          </div>
        </div>

        <div className="border-b border-[#d7e2da] px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <Avatar src={viewModel.doctorAvatar} name={viewModel.doctorName} size="xl" />
            <div className="min-w-0">
              <div className="text-xl font-semibold text-[#143c26]">{viewModel.doctorName}</div>
              <div className="mt-1 text-sm font-medium text-[#143c26]">{viewModel.doctorName}</div>
              <div className="mt-2 text-sm leading-6 text-[#4f6557]">Phòng mạch: {viewModel.doctorAddress}</div>
            </div>
          </div>
        </div>

        <div className="border-b border-[#d7e2da] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0f4f2a]" />
            <h2 className="text-lg font-semibold text-[#143c26]">Thông tin đặt khám</h2>
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <div>
              <div className="text-[#6b7f72]">Mã phiếu khám</div>
              <div className="mt-1 font-semibold text-[#173925]">{viewModel.ticketCode || '--'}</div>
            </div>
            <div>
              <div className="text-[#6b7f72]">Ngày khám</div>
              <div className="mt-1 font-semibold text-[#173925]">{formatDateLabel(viewModel.bookingDate)}</div>
            </div>
            <div>
              <div className="text-[#6b7f72]">Giờ khám</div>
              <div className="mt-1 font-semibold text-[#173925]">
                {viewModel.bookingTime}
                {viewModel.periodLabel && viewModel.periodLabel !== '--' ? ` (${viewModel.periodLabel})` : ''}
              </div>
            </div>
            <div>
              <div className="text-[#6b7f72]">Chuyên khoa</div>
              <div className="mt-1 font-semibold text-[#173925]">{viewModel.doctorSpecialization}</div>
            </div>
          </div>
        </div>

        <div className="border-b border-[#d7e2da] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-[#0f4f2a]" />
            <h2 className="text-lg font-semibold text-[#143c26]">Thông tin bệnh nhân</h2>
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <div>
              <div className="text-[#6b7f72]">Mã bệnh nhân</div>
              <div className="mt-1 font-semibold text-[#173925]">{viewModel.patientCode || '--'}</div>
            </div>
            <div>
              <div className="text-[#6b7f72]">Họ và tên</div>
              <div className="mt-1 font-semibold uppercase text-[#173925]">{viewModel.patientName}</div>
            </div>
            <div>
              <div className="text-[#6b7f72]">Năm sinh</div>
              <div className="mt-1 font-semibold text-[#173925]">
                {formatDateLabel(viewModel.patientDateOfBirth)}
              </div>
            </div>
            <div>
              <div className="text-[#6b7f72]">Số điện thoại</div>
              <div className="mt-1 font-semibold text-[#173925]">{viewModel.patientPhone || '--'}</div>
            </div>
            <div>
              <div className="text-[#6b7f72]">Giới tính</div>
              <div className="mt-1 font-semibold text-[#173925]">{formatGenderLabel(viewModel.patientGender)}</div>
            </div>
            <div>
              <div className="text-[#6b7f72]">Địa chỉ</div>
              <div className="mt-1 font-semibold uppercase text-[#173925]">{viewModel.patientAddress || '--'}</div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={`/appointments?appointmentId=${viewModel.appointmentId}`} className="flex-1">
              <Button className={`${actionButtonClass} w-full justify-center`}>Xem lịch khám</Button>
            </Link>

            <Button
              variant="outline"
              className={`${outlineButtonClass} w-full flex-1 justify-center`}
              onClick={handleSaveReceipt}
            >
              Lưu phiếu khám
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
