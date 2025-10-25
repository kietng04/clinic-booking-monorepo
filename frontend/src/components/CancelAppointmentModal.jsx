import { useState } from 'react'
import { AlertTriangle, Calendar, Clock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'

const cancelReasons = [
  { value: 'schedule_conflict', label: 'Lịch trình thay đổi' },
  { value: 'found_alternative', label: 'Đã tìm được phương án khác' },
  { value: 'feeling_better', label: 'Đã khỏe hơn, không cần khám' },
  { value: 'financial', label: 'Lý do tài chính' },
  { value: 'doctor_preference', label: 'Muốn đổi bác sĩ' },
  { value: 'other', label: 'Lý do khác' },
]

export function CancelAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onConfirm,
}) {
  const [selectedReason, setSelectedReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    const reason =
      selectedReason === 'other'
        ? otherReason
        : cancelReasons.find((r) => r.value === selectedReason)?.label || ''

    if (!reason.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(reason)

      // Reset form
      setSelectedReason('')
      setOtherReason('')
    } catch (error) {
      console.error('Cancel failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedReason('')
    setOtherReason('')
    onClose()
  }

  const canSubmit = selectedReason && (selectedReason !== 'other' || otherReason.trim())

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Hủy lịch hẹn">
      <div className="space-y-6">
        {/* Warning */}
        <div className="p-4 rounded-soft bg-yellow-50 border border-yellow-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Chính sách hủy lịch</p>
            <p>
              Bạn có thể hủy lịch hẹn miễn phí nếu hủy trước 24 giờ. Nếu hủy muộn hơn, có thể
              áp dụng phí hủy hoặc không được hoàn tiền.
            </p>
          </div>
        </div>

        {/* Appointment Info */}
        {appointment && (
          <div className="p-4 rounded-soft bg-sage-50 dark:bg-sage-900/50 border border-sage-200 dark:border-sage-800">
            <h3 className="font-semibold text-sage-900 dark:text-cream-100 mb-3">
              Thông tin lịch hẹn
            </h3>

            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-sage-600 dark:text-sage-400 w-20">Bác sĩ:</span>
                <span className="font-medium text-sage-900 dark:text-cream-100">
                  {appointment.doctorName}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-sage-500" />
                <span className="text-sage-700 dark:text-sage-300">
                  {new Date(appointment.date).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-sage-500" />
                <span className="text-sage-700 dark:text-sage-300">{appointment.time}</span>
              </div>

              {appointment.reason && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-sage-600 dark:text-sage-400 w-20">Lý do khám:</span>
                  <span className="text-sage-700 dark:text-sage-300">{appointment.reason}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Refund Info (if applicable) */}
        {appointment?.status === 'CONFIRMED' && (
          <div className="p-4 rounded-soft bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Hoàn tiền:</span> Nếu bạn đã thanh toán, số tiền
              sẽ được hoàn lại trong vòng 5-7 ngày làm việc.
            </p>
          </div>
        )}

        {/* Cancellation Reason */}
        <div>
          <label className="block text-sm font-medium text-sage-900 dark:text-cream-100 mb-2">
            Lý do hủy lịch <span className="text-red-500">*</span>
          </label>
          <Select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            options={[
              { value: '', label: 'Chọn lý do' },
              ...cancelReasons.map((r) => ({ value: r.value, label: r.label })),
            ]}
          />
        </div>

        {/* Other Reason Text */}
        {selectedReason === 'other' && (
          <div>
            <label className="block text-sm font-medium text-sage-900 dark:text-cream-100 mb-2">
              Vui lòng nêu rõ lý do
            </label>
            <Input
              as="textarea"
              rows={3}
              placeholder="Nhập lý do hủy lịch..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-sage-200 dark:border-sage-800">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Quay lại
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!canSubmit || isSubmitting}
            isLoading={isSubmitting}
          >
            Xác nhận hủy
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default CancelAppointmentModal
