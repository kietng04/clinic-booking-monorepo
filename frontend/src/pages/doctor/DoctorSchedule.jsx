import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { scheduleApi } from '@/api/scheduleApiWrapper'
import { vi } from '@/lib/translations'

const DAYS_OF_WEEK = [
  { dayOfWeek: 1, name: 'Thứ 2' },
  { dayOfWeek: 2, name: 'Thứ 3' },
  { dayOfWeek: 3, name: 'Thứ 4' },
  { dayOfWeek: 4, name: 'Thứ 5' },
  { dayOfWeek: 5, name: 'Thứ 6' },
  { dayOfWeek: 6, name: 'Thứ 7' },
  { dayOfWeek: 0, name: 'Chủ nhật' },
]

const DoctorSchedule = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [weekSchedule, setWeekSchedule] = useState(
    DAYS_OF_WEEK.map((day) => ({
      ...day,
      id: null,
      startTime: '08:00',
      endTime: '17:00',
      isAvailable: day.dayOfWeek !== 0 && day.dayOfWeek !== 6, // Default: Mon-Fri available
    }))
  )

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    setIsLoading(true)
    try {
      const schedules = await scheduleApi.getDoctorSchedules(user.id)

      // Merge fetched schedules with default week schedule
      setWeekSchedule((prev) =>
        prev.map((day) => {
          const found = schedules.find((s) => s.dayOfWeek === day.dayOfWeek)
          if (found) {
            return {
              ...day,
              id: found.id,
              startTime: found.startTime?.substring(0, 5) || '08:00',
              endTime: found.endTime?.substring(0, 5) || '17:00',
              isAvailable: found.isAvailable ?? true,
            }
          }
          return day
        })
      )
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
      // Keep default schedule if fetch fails
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimeChange = (dayOfWeek, field, value) => {
    setWeekSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
      )
    )
  }

  const handleToggleAvailable = (dayOfWeek) => {
    setWeekSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, isAvailable: !day.isAvailable } : day
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const promises = weekSchedule.map(async (day) => {
        const payload = {
          doctorId: user.id,
          // doctorName removed - backend fetches this
          dayOfWeek: day.dayOfWeek,
          startTime: day.startTime.length === 5 ? `${day.startTime}:00` : day.startTime,
          endTime: day.endTime.length === 5 ? `${day.endTime}:00` : day.endTime,
          isAvailable: day.isAvailable,
        }

        try {
          if (day.id) {
            // Update existing schedule
            return await scheduleApi.updateSchedule(day.id, payload)
          } else {
            // Create new schedule
            return await scheduleApi.createSchedule(payload)
          }
        } catch (err) {
          console.error(`Error saving schedule for day ${day.dayOfWeek}:`, err)
          throw err
        }
      })

      const results = await Promise.all(promises)

      // Update local state with returned IDs
      setWeekSchedule((prev) =>
        prev.map((day, index) => ({
          ...day,
          id: results[index]?.id || day.id,
        }))
      )

      showToast({ type: 'success', message: vi.doctor.schedule.scheduleUpdated })
    } catch (error) {
      console.error('Failed to save schedule:', error)
      showToast({ type: 'error', message: 'Không thể lưu lịch làm việc' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
          {vi.doctor.schedule.title}
        </h1>
        <p className="text-sage-600">Thiết lập lịch làm việc hàng tuần của bạn</p>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sage-600" />
            <CardTitle>Lịch làm việc trong tuần</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weekSchedule.map((day, index) => (
              <motion.div
                key={day.dayOfWeek}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border-2 transition-all ${day.isAvailable
                  ? 'border-sage-200 bg-white'
                  : 'border-sage-100 bg-sage-50'
                  }`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Day Name & Toggle */}
                  <div className="flex items-center gap-3 md:w-40">
                    <button
                      onClick={() => handleToggleAvailable(day.dayOfWeek)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${day.isAvailable ? 'bg-sage-600' : 'bg-sage-300'
                        }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${day.isAvailable ? 'translate-x-6' : 'translate-x-0'
                          }`}
                      />
                    </button>
                    <span
                      className={`font-medium ${day.isAvailable ? 'text-sage-900' : 'text-sage-400'
                        }`}
                    >
                      {day.name}
                    </span>
                  </div>

                  {/* Time Inputs */}
                  {day.isAvailable ? (
                    <div className="flex items-center gap-3 flex-1">
                      <Clock className="w-4 h-4 text-sage-500" />
                      <Input
                        type="time"
                        value={day.startTime}
                        onChange={(e) =>
                          handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-sage-500">đến</span>
                      <Input
                        type="time"
                        value={day.endTime}
                        onChange={(e) =>
                          handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)
                        }
                        className="w-32"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <span className="text-sage-400 italic">Nghỉ</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              leftIcon={isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu lịch làm việc'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sage-900 mb-1">Lưu ý</h3>
              <p className="text-sm text-sage-600">
                Lịch làm việc này sẽ được sử dụng để hiển thị khung giờ có sẵn khi bệnh nhân
                đặt lịch khám với bạn. Hãy đảm bảo cập nhật kịp thời khi có thay đổi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DoctorSchedule
