import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Clock, CheckCircle, XCircle, Plus, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { consultationApi } from '@/api/realApis/consultationApi'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'

const ConsultationList = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [consultations, setConsultations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    if (user?.id) {
      fetchConsultations()
    }
  }, [user?.id])

  const fetchConsultations = async () => {
    setIsLoading(true)
    try {
      const data = await consultationApi.getConsultationsByPatient(user.id, 0, 50)
      setConsultations(data.content || [])
    } catch (error) {
      console.error('Failed to load consultations:', error)
      showToast({ type: 'error', message: 'Không thể tải danh sách tư vấn' })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ xác nhận', color: 'yellow' },
      ACCEPTED: { label: 'Đã chấp nhận', color: 'blue' },
      IN_PROGRESS: { label: 'Đang tư vấn', color: 'green' },
      COMPLETED: { label: 'Hoàn thành', color: 'gray' },
      REJECTED: { label: 'Từ chối', color: 'red' },
      CANCELLED: { label: 'Đã hủy', color: 'gray' },
    }
    const config = statusMap[status] || { label: status, color: 'gray' }
    return <Badge variant={config.color}>{config.label}</Badge>
  }

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      consultation.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.doctorName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'active' &&
        ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(consultation.status)) ||
      (activeFilter === 'completed' && consultation.status === 'COMPLETED')

    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-sage-50 rounded-lg h-32"></div>
        <div className="animate-pulse bg-sage-50 rounded-lg h-32"></div>
        <div className="animate-pulse bg-sage-50 rounded-lg h-32"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900">
            Tư vấn trực tuyến
          </h1>
          <p className="text-sage-600 mt-1">Chat với bác sĩ mọi lúc mọi nơi</p>
        </div>
        <Button
          data-testid="consultation-create-button"
          leftIcon={<Plus />}
          onClick={() => navigate('/patient/consultations/new')}
        >
          Tạo yêu cầu tư vấn
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo chủ đề hoặc bác sĩ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeFilter === 'all' ? 'primary' : 'outline'}
                onClick={() => setActiveFilter('all')}
              >
                Tất cả
              </Button>
              <Button
                variant={activeFilter === 'active' ? 'primary' : 'outline'}
                onClick={() => setActiveFilter('active')}
              >
                Đang hoạt động
              </Button>
              <Button
                variant={activeFilter === 'completed' ? 'primary' : 'outline'}
                onClick={() => setActiveFilter('completed')}
              >
                Hoàn thành
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultation List */}
      {filteredConsultations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-sage-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-sage-900 mb-2">
              Chưa có tư vấn nào
            </h3>
            <p className="text-sage-600 mb-4">
              Bạn chưa có yêu cầu tư vấn nào. Tạo yêu cầu mới để chat với bác sĩ.
            </p>
            <Button onClick={() => navigate('/patient/consultations/new')}>
              Tạo yêu cầu tư vấn
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConsultations.map((consultation, index) => (
            <motion.div
              key={consultation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/patient/consultations/${consultation.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-sage-900">
                          {consultation.topic}
                        </h3>
                        {getStatusBadge(consultation.status)}
                        {consultation.unreadCount > 0 && (
                          <Badge variant="red">{consultation.unreadCount} tin nhắn mới</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-sage-600 mb-3">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Bác sĩ:</span>
                          <span>{consultation.doctorName}</span>
                        </div>
                        {consultation.specialization && (
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>{consultation.specialization}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatDistanceToNow(new Date(consultation.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </span>
                        </div>
                      </div>

                      {consultation.latestMessagePreview && (
                        <div className="flex items-center gap-2 text-sm text-sage-500">
                          <MessageSquare className="w-4 h-4" />
                          <span className="line-clamp-1">
                            {consultation.latestMessagePreview}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-lg font-bold text-sage-900">
                        {formatCurrency(consultation.fee)}
                      </div>
                      {consultation.isPaid ? (
                        <Badge variant="green">Đã thanh toán</Badge>
                      ) : (
                        <Badge variant="yellow">Chưa thanh toán</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConsultationList
