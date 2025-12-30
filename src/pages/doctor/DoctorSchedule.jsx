import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Plus, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { useUIStore } from '@/store/uiStore'
import { vi } from '@/lib/translations'

const DoctorSchedule = () => {
  const { showToast } = useUIStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [workingHours, setWorkingHours] = useState({ start: '08:00', end: '17:00' })
  const [slotDuration, setSlotDuration] = useState(30)

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date
  })

  // Generate time slots
  const generateSlots = () => {
    const slots = []
    const start = parseInt(workingHours.start.split(':')[0])
    const end = parseInt(workingHours.end.split(':')[0])

    for (let hour = start; hour < end; hour++) {
      if (slotDuration === 30) {
        slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, status: 'available' })
        slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, status: 'available' })
      } else {
        slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, status: 'available' })
      }
    }
    return slots
  }

  const [timeSlots, setTimeSlots] = useState(generateSlots())

  const toggleSlot = (index) => {
    const newSlots = [...timeSlots]
    newSlots[index].status = newSlots[index].status === 'available' ? 'blocked' : 'available'
    setTimeSlots(newSlots)
  }

  const handleSave = () => {
    showToast({ type: 'success', message: vi.doctor.schedule.scheduleUpdated })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
          {vi.doctor.schedule.title}
        </h1>
        <p className="text-sage-600">Thiết lập lịch làm việc và khung giờ khám</p>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>{vi.doctor.schedule.selectDate}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString()
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-sage-600 bg-sage-50'
                      : 'border-sage-200 hover:border-sage-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xs text-sage-600 mb-1">
                      {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                    </div>
                    <div className={`text-2xl font-bold ${isToday ? 'text-sage-600' : 'text-sage-900'}`}>
                      {date.getDate()}
                    </div>
                    <div className="text-xs text-sage-500">
                      {date.toLocaleDateString('vi-VN', { month: 'short' })}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle>{vi.doctor.schedule.workingHours}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label={vi.doctor.schedule.startTime}
              type="time"
              value={workingHours.start}
              onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
            />
            <Input
              label={vi.doctor.schedule.endTime}
              type="time"
              value={workingHours.end}
              onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
            />
            <Select
              label={vi.doctor.schedule.slotDuration}
              value={slotDuration}
              onChange={(e) => setSlotDuration(parseInt(e.target.value))}
              options={[
                { value: 30, label: '30 phút' },
                { value: 60, label: '60 phút' },
              ]}
            />
          </div>
          <Button
            onClick={() => setTimeSlots(generateSlots())}
            className="mt-4"
            leftIcon={<Plus />}
          >
            {vi.doctor.schedule.generateSlots}
          </Button>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Khung giờ - {selectedDate.toLocaleDateString('vi-VN')}</CardTitle>
            <div className="flex gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-sage-600 rounded"></div>
                <span className="text-sage-600">Có sẵn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span className="text-sage-600">Đã chặn</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {timeSlots.map((slot, index) => (
              <motion.button
                key={index}
                onClick={() => toggleSlot(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  slot.status === 'available'
                    ? 'border-sage-600 bg-sage-50 hover:bg-sage-100'
                    : 'border-red-600 bg-red-50 hover:bg-red-100'
                }`}
              >
                <div className="text-sm font-medium">
                  {slot.time}
                </div>
                {slot.status === 'available' ? (
                  <Check className="w-4 h-4 mx-auto mt-1 text-sage-600" />
                ) : (
                  <X className="w-4 h-4 mx-auto mt-1 text-red-600" />
                )}
              </motion.button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>
              Lưu lịch làm việc
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DoctorSchedule
