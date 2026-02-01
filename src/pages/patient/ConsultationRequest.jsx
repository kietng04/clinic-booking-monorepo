import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageSquare, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { consultationApi } from '@/api/realApis/consultationApi'
import { userApi } from '@/api/userApiWrapper'

const ConsultationRequest = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true)

  const [formData, setFormData] = useState({
    doctorId: '',
    topic: '',
    description: '',
    fee: 200000,
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    setIsLoadingDoctors(true)
    try {
      const data = await userApi.getDoctors({ page: 0, size: 100 })
      const doctorsList = Array.isArray(data) ? data : (data.content || [])
      setDoctors(doctorsList)
    } catch (error) {
      console.error('Failed to load doctors:', error)
      showToast({ type: 'error', message: 'Không thể tải danh sách bác sĩ' })
    } finally {
      setIsLoadingDoctors(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.doctorId) {
      showToast({ type: 'error', message: 'Vui lòng chọn bác sĩ' })
      return
    }

    if (!formData.topic || formData.topic.length < 5) {
      showToast({ type: 'error', message: 'Chủ đề phải có ít nhất 5 ký tự' })
      return
    }

    setIsLoading(true)
    try {
      const consultation = await consultationApi.createConsultation({
        doctorId: parseInt(formData.doctorId),
        topic: formData.topic,
        description: formData.description,
        fee: formData.fee,
      })

      showToast({
        type: 'success',
        message: 'Đã tạo yêu cầu tư vấn thành công!',
      })

      navigate(`/patient/consultations/${consultation.id}`)
    } catch (error) {
      console.error('Failed to create consultation:', error)
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tạo yêu cầu tư vấn',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedDoctor = doctors.find((d) => d.id === parseInt(formData.doctorId))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft />}
          onClick={() => navigate('/patient/consultations')}
          className="mb-4"
        >
          Quay lại
        </Button>
        <h1 className="text-3xl font-display font-bold text-sage-900">
          Tạo yêu cầu tư vấn
        </h1>
        <p className="text-sage-600 mt-1">
          Điền thông tin để bác sĩ hiểu rõ vấn đề của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select Doctor */}
        <Card>
          <CardHeader>
            <CardTitle>Chọn bác sĩ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingDoctors ? (
              <div className="animate-pulse bg-sage-50 rounded-lg h-12"></div>
            ) : (
              <Select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                options={[
                  { value: '', label: '-- Chọn bác sĩ --' },
                  ...doctors.map(doctor => ({
                    value: doctor.id,
                    label: `${doctor.fullName} - ${doctor.specialization || 'Đa khoa'}`
                  }))
                ]}
              />
            )}

            {selectedDoctor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-sage-50 rounded-lg"
              >
                <h4 className="font-semibold text-sage-900 mb-2">
                  Thông tin bác sĩ
                </h4>
                <div className="space-y-1 text-sm text-sage-600">
                  <p>
                    <span className="font-medium">Họ tên:</span> {selectedDoctor.fullName}
                  </p>
                  <p>
                    <span className="font-medium">Chuyên khoa:</span>{' '}
                    {selectedDoctor.specialization || 'Đa khoa'}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {selectedDoctor.email}
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Consultation Topic */}
        <Card>
          <CardHeader>
            <CardTitle>Vấn đề cần tư vấn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Chủ đề *
              </label>
              <Input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Ví dụ: Đau đầu kéo dài 3 ngày"
                required
                maxLength={500}
              />
              <p className="text-xs text-sage-500 mt-1">
                Tóm tắt ngắn gọn vấn đề của bạn (5-500 ký tự)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Mô tả chi tiết
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả triệu chứng, thời gian bắt đầu, các yếu tố liên quan..."
                rows={6}
                maxLength={2000}
              />
              <p className="text-xs text-sage-500 mt-1">
                Càng chi tiết càng giúp bác sĩ tư vấn tốt hơn (tối đa 2000 ký tự)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fee Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Phí tư vấn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-sage-50 rounded-lg">
              <div>
                <p className="font-semibold text-sage-900">Phí tư vấn trực tuyến</p>
                <p className="text-sm text-sage-600">Thanh toán sau khi bác sĩ chấp nhận</p>
              </div>
              <div className="text-2xl font-bold text-sage-900">
                {formData.fee.toLocaleString()} đ
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">
              ⚠️ Lưu ý quan trọng
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Bác sĩ sẽ xem xét và phản hồi trong vòng 24 giờ</li>
              <li>Bạn chỉ thanh toán khi bác sĩ chấp nhận yêu cầu</li>
              <li>Tư vấn trực tuyến không thay thế khám trực tiếp</li>
              <li>Trường hợp khẩn cấp, vui lòng đến cơ sở y tế ngay</li>
            </ul>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/patient/consultations')}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading || !formData.doctorId || !formData.topic}
            className="flex-1"
            leftIcon={<MessageSquare />}
          >
            Gửi yêu cầu tư vấn
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ConsultationRequest
