import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { scheduleApi } from '@/api/scheduleApiWrapper'
import { Loading } from '@/components/ui/Loading'

export function RescheduleModal({
  isOpen,
  onClose,
  appointment,
  onConfirm,
}) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [reason, setReason] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (selectedDate && appointment?.doctorId) {
      loadAvailableSlots()
    }
  }, [selectedDate, appointment])

  const loadAvailableSlots = async () => {
    setIsLoading(true)
    try {
      const slots = await scheduleApi.getAvailableSlots(appointment.doctorId, selectedDate)

      if (slots && slots.length > 0) {
        setAvailableSlots(slots.filter((slot) => slot.available))
      } else {
        // Generate default slots if no schedule exists
        const defaultSlots = [
          '09:00',
          '10:00',
          '11:00',
          '14:00',
          '15:00',
          '16:00',
        ].map((time) => ({ time, available: true }))
        setAvailableSlots(defaultSlots)
      }
    } catch (error) {
      console.error('Failed to load available slots:', error)
      setAvailableSlots([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm({
        newDate: selectedDate,
        newTime: selectedTime,
        reason,
      })

      // Reset form
      setSelectedDate('')
      setSelectedTime('')
      setReason('')
    } catch (error) {
      console.error('Reschedule failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getNextDays = (count = 14) => {
    const days = []
    for (let i = 1; i <= count; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  const handleClose = () => {
    setSelectedDate('')
    setSelectedTime('')
    setReason('')
    setAvailableSlots([])
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Đổi lịch hẹn" size="lg">
      <div className="space-y-6">
        {/* Policy Info */}
        <div className="p-4 rounded-soft bg-blue-50 border border-blue-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Chính sách đổi lịch</p>
            <p>
              Bạn có thể đổi lịch hẹn tối đa 2 lần. Vui lòng chọn ngày giờ phù hợp để tránh
              phải đổi lại nhiều lần.
            </p>
          </div>
        </div>

        {/* Current Appointment Info */}
        {appointment && (
          <div className="p-4 rounded-soft bg-sage-50 dark:bg-sage-900/50 border border-sage-200 dark:border-sage-800">
            <h3 className="text-sm font-medium text-sage-900 dark:text-cream-100 mb-2">
              Lịch hẹn hiện tại
            </h3>
            <div className="flex flex-wrap gap-4 text-sm text-sage-700 dark:text-sage-300">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                {new Date(appointment.date).toLocaleDateString('vi-VN')}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {appointment.time}
              </div>
            </div>
          </div>
        )}

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-sage-900 dark:text-cream-100 mb-3">
            Chọn ngày mới
          </label>
          <div className="grid grid-cols-7 gap-2 max-h-64 overflow-y-auto">
            {getNextDays().map((day) => {
              const dateStr = day.toISOString().split('T')[0]
              const isSelected = selectedDate === dateStr

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr)
                    setSelectedTime('')
                  }}
                  className={`p-2 rounded-soft border-2 transition-all text-center ${
                    isSelected
                      ? 'border-sage-600 bg-sage-50 dark:bg-sage-900'
                      : 'border-sage-200 dark:border-sage-800 hover:border-sage-400'
                  }`}
                >
                  <div className="text-xs text-sage-500 dark:text-sage-400">
                    {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </div>
                  <div className="text-sm font-bold text-sage-900 dark:text-cream-100">
                    {day.getDate()}/{day.getMonth() + 1}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-sage-900 dark:text-cream-100 mb-3">
              Chọn giờ khám
            </label>
            {isLoading ? (
              <Loading />
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-sage-600 dark:text-sage-400 py-8 text-center">
                Không có khung giờ nào khả dụng cho ngày này
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTime(slot.time)}
                    className="h-auto py-2"
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reason (Optional) */}
        <div>
          <label className="block text-sm font-medium text-sage-900 dark:text-cream-100 mb-2">
            Lý do đổi lịch (Tùy chọn)
          </label>
          <Input
            as="textarea"
            rows={3}
            placeholder="Nhập lý do đổi lịch..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-sage-200 dark:border-sage-800">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || isSubmitting}
            isLoading={isSubmitting}
          >
            Xác nhận đổi lịch
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default RescheduleModal
