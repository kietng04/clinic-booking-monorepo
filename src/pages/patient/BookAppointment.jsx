import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  Star,
  CheckCircle,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { userApi } from '@/api/userApiWrapper'
import { scheduleApi } from '@/api/scheduleApiWrapper'
import { appointmentApi } from '@/api/appointmentApiWrapper'
import { adminApi } from '@/api/adminApiWrapper'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'

const STEPS = [
  { id: 1, name: 'Chọn Bác sĩ', description: 'Chọn chuyên gia y tế phù hợp' },
  { id: 2, name: 'Chọn Ngày & Giờ', description: 'Chọn khung giờ khám' },
  { id: 3, name: 'Thông tin Chi tiết', description: 'Cung cấp thông tin bổ sung' },
  { id: 4, name: 'Xác nhận', description: 'Xem lại và xác nhận đặt lịch' },
]

const normalizeDoctor = (doctor) => ({
  ...doctor,
  name: doctor?.name || doctor?.fullName || '',
  specialization: doctor?.specialization || '',
  avatar: doctor?.avatar || doctor?.avatarUrl || '',
  rating: doctor?.rating ?? 0,
  consultationFee: doctor?.consultationFee ?? 0,
  yearsOfExperience: doctor?.yearsOfExperience ?? doctor?.experienceYears ?? 0,
})

export function BookAppointment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [clinics, setClinics] = useState([])
  const [services, setServices] = useState([])
  const [rooms, setRooms] = useState([])

  const [bookingData, setBookingData] = useState({
    doctorId: null,
    doctor: null,
    date: '',
    time: '',
    clinicId: '',
    serviceId: '',
    roomId: '',
    type: 'IN_PERSON',
    reason: '',
    notes: '',
  })

  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    const preselectedDoctorId = searchParams.get('doctorId')
    if (preselectedDoctorId) {
      loadPreselectedDoctor(preselectedDoctorId)
    } else {
      loadDoctors()
    }
    loadBookingConfigs()
  }, [])

  const loadPreselectedDoctor = async (doctorId) => {
    try {
      setLoading(true)
      const doctor = normalizeDoctor(await userApi.getUser(doctorId))
      if (doctor && doctor.id) {
        setBookingData((prev) => ({
          ...prev,
          doctorId: doctor.id,
          doctor,
        }))
        setCurrentStep(2)
      }
    } catch (error) {
      showToast('Không tìm thấy bác sĩ, vui lòng chọn bác sĩ khác', 'error')
      loadDoctors()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    filterDoctors()
  }, [searchTerm, selectedSpecialization, doctors])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const data = await userApi.getDoctors()
      const normalizedDoctors = (Array.isArray(data) ? data : []).map(normalizeDoctor)
      setDoctors(normalizedDoctors)
      setFilteredDoctors(normalizedDoctors)
    } catch (error) {
      showToast('Failed to load doctors', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadBookingConfigs = async () => {
    try {
      const [clinicsData, servicesData, roomsData] = await Promise.all([
        adminApi.getClinics(),
        adminApi.getServices(),
        adminApi.getAllRooms(),
      ])

      setClinics((Array.isArray(clinicsData) ? clinicsData : []).filter(c => c?.active !== false))
      setServices((Array.isArray(servicesData) ? servicesData : []).filter(s => s?.active !== false))
      setRooms((Array.isArray(roomsData) ? roomsData : []).filter(r => r?.active !== false))
    } catch (error) {
      showToast('Không thể tải cấu hình phòng khám/dịch vụ/phòng. Vui lòng thử lại.', 'error')
    }
  }

  const filterDoctors = () => {
    let filtered = [...doctors]
    const loweredSearchTerm = searchTerm.toLowerCase()

    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(loweredSearchTerm) ||
          doctor.specialization.toLowerCase().includes(loweredSearchTerm)
      )
    }

    if (selectedSpecialization) {
      filtered = filtered.filter((doctor) => doctor.specialization === selectedSpecialization)
    }

    setFilteredDoctors(filtered)
  }

  const selectDoctor = (doctor) => {
    setBookingData((prev) => ({ ...prev, doctorId: doctor.id, doctor }))
    setCurrentStep(2)
  }

  const loadAvailableSlots = async (date) => {
    try {
      setLoading(true)
      const slots = await scheduleApi.getAvailableSlots(bookingData.doctorId, date)

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
      showToast('Failed to load available slots', 'error')
    } finally {
      setLoading(false)
    }
  }

  const isFutureDate = (dateStr) => {
    if (!dateStr) return false
    const selected = new Date(dateStr)
    const today = new Date()
    selected.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    return selected > today
  }

  const selectDateTime = (date, time) => {
    if (!isFutureDate(date)) {
      showToast('Ngày khám phải là ngày trong tương lai', 'error')
      return
    }

    setBookingData((prev) => ({ ...prev, date, time }))
    setCurrentStep(3)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      if (!isFutureDate(bookingData.date)) {
        showToast('Ngày khám phải là ngày trong tương lai', 'error')
        return
      }
      if (!bookingData.clinicId || !bookingData.serviceId) {
        showToast('Vui lòng chọn phòng khám và dịch vụ', 'error')
        return
      }
      if (bookingData.type === 'IN_PERSON' && !bookingData.roomId) {
        showToast('Vui lòng chọn phòng khám cụ thể cho lịch hẹn trực tiếp', 'error')
        return
      }

      const appointmentData = {
        patientId: user.id,
        patientName: user.name || user.fullName,
        doctorId: bookingData.doctorId,
        doctorName: bookingData.doctor?.name,
        doctorSpecialization: bookingData.doctor?.specialization,
        date: bookingData.date,
        time: bookingData.time,
        clinicId: Number(bookingData.clinicId),
        serviceId: Number(bookingData.serviceId),
        roomId: bookingData.type === 'IN_PERSON' ? Number(bookingData.roomId) : null,
        serviceFee: selectedService?.basePrice ?? selectedService?.price ?? null,
        type: bookingData.type,
        priority: 'NORMAL',
        reason: bookingData.reason,
        notes: bookingData.notes,
      }

      await appointmentApi.createAppointment(appointmentData)
      showToast('Appointment booked successfully!', 'success')
      navigate('/appointments')
    } catch (error) {
      showToast('Failed to book appointment', 'error')
    } finally {
      setLoading(false)
    }
  }

  const specializations = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))]
  const filteredServices = services.filter(
    (service) => String(service?.clinicId) === String(bookingData.clinicId)
  )
  const filteredRooms = rooms.filter(
    (room) => String(room?.clinicId) === String(bookingData.clinicId)
  )
  const selectedClinic = clinics.find(
    (clinic) => String(clinic?.id) === String(bookingData.clinicId)
  )
  const selectedService = services.find(
    (service) => String(service?.id) === String(bookingData.serviceId)
  )
  const selectedRoom = rooms.find(
    (room) => String(room?.id) === String(bookingData.roomId)
  )

  // Get next 7 days for date selection
  const getNextDays = () => {
    const days = []
    for (let i = 1; i <= 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep >= step.id
                      ? 'bg-sage-600 text-white shadow-soft'
                      : 'bg-sage-100 dark:bg-sage-800 text-sage-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-sage-900 dark:text-cream-100">
                    {step.name}
                  </p>
                  <p className="text-xs text-sage-500 dark:text-sage-400 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-4 ${
                    currentStep > step.id ? 'bg-sage-600' : 'bg-sage-200 dark:bg-sage-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Chọn Bác sĩ */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Chọn Bác sĩ của bạn</CardTitle>
                <CardDescription>
                  Tìm chuyên gia y tế phù hợp với nhu cầu của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Input
                    placeholder="Tìm theo tên hoặc chuyên khoa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                  />
                  <Select
                    placeholder="Lọc theo chuyên khoa"
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    options={[
                      { value: '', label: 'Tất cả chuyên khoa' },
                      ...specializations.map((spec) => ({ value: spec, label: spec })),
                    ]}
                  />
                </div>

                {/* Doctors List */}
                {loading ? (
                  <Loading />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDoctors.map((doctor) => (
                      <motion.div
                        key={doctor.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-soft border border-sage-200 dark:border-sage-800 hover:border-sage-400 dark:hover:border-sage-600 transition-all cursor-pointer"
                        onClick={() => selectDoctor(doctor)}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar src={doctor.avatar} name={doctor.name} size="lg" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sage-900 dark:text-cream-100 mb-1">
                              {doctor.name}
                            </h3>
                            <p className="text-sm text-sage-600 dark:text-sage-400 mb-2">
                              {doctor.specialization}
                            </p>
                            <div className="flex items-center gap-4 text-sm mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-terra-400 text-terra-400" />
                                <span className="font-medium">{doctor.rating}</span>
                              </div>
                              <span className="text-sage-500 dark:text-sage-400">
                                {doctor.yearsOfExperience} năm kinh nghiệm
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-sage-900 dark:text-cream-100">
                                ${doctor.consultationFee}
                              </span>
                              <Button size="sm">Chọn</Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Chọn Ngày Pick Date & Time Giờ */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Chọn Ngày Chọn Ngày & Time Giờ</CardTitle>
                <CardDescription>
                  Choose your preferred appointment slot with {bookingData.doctor?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Date Selection */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-sage-700 dark:text-sage-300 mb-3">
                    Chọn Ngày
                  </h4>
                  <div className="grid grid-cols-7 gap-2">
                    {getNextDays().map((day) => {
                      const dateStr = day.toISOString().split('T')[0]
                      const isSelected = selectedDate === dateStr
                      return (
                        <button
                          key={dateStr}
                          onClick={() => {
                            setSelectedDate(dateStr)
                            loadAvailableSlots(dateStr)
                          }}
                          className={`p-3 rounded-soft border-2 transition-all ${
                            isSelected
                              ? 'border-sage-600 bg-sage-50 dark:bg-sage-900'
                              : 'border-sage-200 dark:border-sage-800 hover:border-sage-400'
                          }`}
                        >
                          <div className="text-xs text-sage-500 dark:text-sage-400">
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-lg font-bold text-sage-900 dark:text-cream-100">
                            {day.getDate()}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <h4 className="text-sm font-medium text-sage-700 dark:text-sage-300 mb-3">
                      Khung giờ có sẵn
                    </h4>
                    {loading ? (
                      <Loading />
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant="outline"
                            className="h-auto py-3"
                            onClick={() => selectDateTime(selectedDate, slot.time)}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-sage-200 dark:border-sage-800 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Thông tin Chi tiết */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Thông tin Chi tiết</CardTitle>
                <CardDescription>
                  Cung cấp thông tin bổ sung for your visit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Loại hình khám */}
                  <div>
                    <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-3">
                      Loại hình khám
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setBookingData((prev) => ({ ...prev, type: 'IN_PERSON' }))}
                        className={`p-4 rounded-soft border-2 transition-all ${
                          bookingData.type === 'IN_PERSON'
                            ? 'border-sage-600 bg-sage-50 dark:bg-sage-900'
                            : 'border-sage-200 dark:border-sage-800'
                        }`}
                      >
                        <MapPin className="w-6 h-6 mx-auto mb-2 text-sage-600 dark:text-sage-400" />
                        <div className="font-medium text-sage-900 dark:text-cream-100">
                          Trực tiếp
                        </div>
                      </button>
                      <button
                        onClick={() => setBookingData((prev) => ({ ...prev, type: 'ONLINE', roomId: '' }))}
                        className={`p-4 rounded-soft border-2 transition-all ${
                          bookingData.type === 'ONLINE'
                            ? 'border-sage-600 bg-sage-50 dark:bg-sage-900'
                            : 'border-sage-200 dark:border-sage-800'
                        }`}
                      >
                        <Video className="w-6 h-6 mx-auto mb-2 text-sage-600 dark:text-sage-400" />
                        <div className="font-medium text-sage-900 dark:text-cream-100">
                          Gọi video
                        </div>
                      </button>
                    </div>
                  </div>

                  <Select
                    label="Phòng khám *"
                    value={bookingData.clinicId}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        clinicId: e.target.value,
                        serviceId: '',
                        roomId: '',
                      }))
                    }
                    options={[
                      { value: '', label: 'Chọn phòng khám' },
                      ...clinics.map((clinic) => ({
                        value: String(clinic.id),
                        label: clinic.name,
                      })),
                    ]}
                  />

                  <Select
                    label="Dịch vụ *"
                    value={bookingData.serviceId}
                    onChange={(e) =>
                      setBookingData((prev) => ({ ...prev, serviceId: e.target.value }))
                    }
                    disabled={!bookingData.clinicId}
                    options={[
                      { value: '', label: 'Chọn dịch vụ' },
                      ...filteredServices.map((service) => ({
                        value: String(service.id),
                        label: service.name,
                      })),
                    ]}
                  />

                  {bookingData.type === 'IN_PERSON' && (
                    <Select
                      label="Phòng khám cụ thể *"
                      value={bookingData.roomId}
                      onChange={(e) =>
                        setBookingData((prev) => ({ ...prev, roomId: e.target.value }))
                      }
                      disabled={!bookingData.clinicId}
                      options={[
                        { value: '', label: 'Chọn phòng' },
                        ...filteredRooms.map((room) => ({
                          value: String(room.id),
                          label: `${room.name}${room.roomNumber ? ` - #${room.roomNumber}` : ''}`,
                        })),
                      ]}
                    />
                  )}

                  {/* Reason */}
                  <Input
                    label="Lý do khám bệnh"
                    placeholder="E.g., Regular checkup, Follow-up, etc."
                    value={bookingData.reason}
                    onChange={(e) =>
                      setBookingData((prev) => ({ ...prev, reason: e.target.value }))
                    }
                    required
                  />

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2">
                      Ghi chú thêm (Tùy chọn)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-soft border border-sage-200 dark:border-sage-700 bg-white dark:bg-sage-800 text-sage-900 dark:text-cream-100 focus-ring resize-none"
                      rows={4}
                      placeholder="Any additional information for your doctor..."
                      value={bookingData.notes}
                      onChange={(e) =>
                        setBookingData((prev) => ({ ...prev, notes: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-sage-200 dark:border-sage-800 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    disabled={
                      !bookingData.reason ||
                      !bookingData.clinicId ||
                      !bookingData.serviceId ||
                      (bookingData.type === 'IN_PERSON' && !bookingData.roomId)
                    }
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Tiếp tục
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Xác nhận */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Xác nhận Your Appointment</CardTitle>
                <CardDescription>
                  Xem lại chi tiết đặt lịch trước khi xác nhận
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Doctor Info */}
                  <div className="p-4 rounded-soft bg-sage-50 dark:bg-sage-900/50 border border-sage-200 dark:border-sage-800">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar src={bookingData.doctor?.avatar} name={bookingData.doctor?.name} size="lg" />
                      <div>
                        <h4 className="font-semibold text-sage-900 dark:text-cream-100">
                          {bookingData.doctor?.name}
                        </h4>
                        <p className="text-sm text-sage-600 dark:text-sage-400">
                          {bookingData.doctor?.specialization}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin Chi tiết */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-soft bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700">
                      <div className="text-sm text-sage-600 dark:text-sage-400 mb-1">Date</div>
                      <div className="font-semibold text-sage-900 dark:text-cream-100">
                        {new Date(bookingData.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="p-4 rounded-soft bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700">
                      <div className="text-sm text-sage-600 dark:text-sage-400 mb-1">Time</div>
                      <div className="font-semibold text-sage-900 dark:text-cream-100">
                        {bookingData.time}
                      </div>
                    </div>
                    <div className="p-4 rounded-soft bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700">
                      <div className="text-sm text-sage-600 dark:text-sage-400 mb-1">Type</div>
                      <div className="font-semibold text-sage-900 dark:text-cream-100">
                        {bookingData.type === 'ONLINE' ? 'Gọi video' : 'Trực tiếp Visit'}
                      </div>
                    </div>
                    <div className="p-4 rounded-soft bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700">
                      <div className="text-sm text-sage-600 dark:text-sage-400 mb-1">Fee</div>
                      <div className="font-semibold text-sage-900 dark:text-cream-100">
                        ${bookingData.doctor?.consultationFee}
                      </div>
                    </div>
                    <div className="p-4 rounded-soft bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700">
                      <div className="text-sm text-sage-600 dark:text-sage-400 mb-1">Phòng khám</div>
                      <div className="font-semibold text-sage-900 dark:text-cream-100">
                        {selectedClinic?.name || 'Chưa chọn'}
                      </div>
                    </div>
                    <div className="p-4 rounded-soft bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700">
                      <div className="text-sm text-sage-600 dark:text-sage-400 mb-1">Dịch vụ</div>
                      <div className="font-semibold text-sage-900 dark:text-cream-100">
                        {selectedService?.name || 'Chưa chọn'}
                      </div>
                    </div>
                    {bookingData.type === 'IN_PERSON' && (
                      <div className="p-4 rounded-soft bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700">
                        <div className="text-sm text-sage-600 dark:text-sage-400 mb-1">Phòng</div>
                        <div className="font-semibold text-sage-900 dark:text-cream-100">
                          {selectedRoom?.name || 'Chưa chọn'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-soft bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700">
                    <div className="text-sm text-sage-600 dark:text-sage-400 mb-1">Reason</div>
                    <div className="font-medium text-sage-900 dark:text-cream-100">
                      {bookingData.reason}
                    </div>
                    {bookingData.notes && (
                      <>
                        <div className="text-sm text-sage-600 dark:text-sage-400 mt-3 mb-1">Notes</div>
                        <div className="text-sm text-sage-700 dark:text-sage-300">
                          {bookingData.notes}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-sage-200 dark:border-sage-800 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    isLoading={loading}
                    rightIcon={<CheckCircle className="w-4 h-4" />}
                  >
                    Xác nhận Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
