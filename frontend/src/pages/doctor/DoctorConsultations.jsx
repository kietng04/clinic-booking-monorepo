import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Check, 
  X as XIcon, 
  Search,
  AlertCircle,
  Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { consultationApi } from '@/api/realApis/consultationApi'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const DoctorConsultations = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [consultations, setConsultations] = useState([])
  const [pendingConsultations, setPendingConsultations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchConsultations()
    }
  }, [user?.id])

  const fetchConsultations = async () => {
    setIsLoading(true)
    try {
      const [allData, pendingData] = await Promise.all([
        consultationApi.getConsultationsByDoctor(user.id, 0, 50),
        consultationApi.getPendingConsultations(user.id),
      ])
      setConsultations(allData.content || [])
      setPendingConsultations(pendingData || [])
    } catch (error) {
      console.error('Failed to load consultations:', error)
      showToast({ type: 'error', message: 'Không thể tải danh sách tư vấn' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (consultationId) => {
    setIsProcessing(true)
    try {
      await consultationApi.acceptConsultation(consultationId)
      showToast({ type: 'success', message: 'Đã chấp nhận yêu cầu tư vấn' })
      fetchConsultations()
    } catch (error) {
      console.error('Failed to accept consultation:', error)
      showToast({ type: 'error', message: 'Không thể chấp nhận yêu cầu' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập lý do từ chối' })
      return
    }

    setIsProcessing(true)
    try {
      await consultationApi.rejectConsultation(selectedConsultation.id, rejectionReason)
      showToast({ type: 'success', message: 'Đã từ chối yêu cầu tư vấn' })
      setShowRejectModal(false)
      setSelectedConsultation(null)
      setRejectionReason('')
      fetchConsultations()
    } catch (error) {
      console.error('Failed to reject consultation:', error)
      showToast({ type: 'error', message: 'Không thể từ chối yêu cầu' })
    } finally {
      setIsProcessing(false)
    }
  }

  const openRejectModal = (consultation, e) => {
    e.stopPropagation()
    setSelectedConsultation(consultation)
    setShowRejectModal(true)
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

  // Filter consultations based on active tab
  const getFilteredConsultations = () => {
    let filtered = consultations

    // Filter by tab
    switch (activeTab) {
      case 'pending':
        filtered = pendingConsultations
        break
      case 'active':
        filtered = consultations.filter(c => 
          ['ACCEPTED', 'IN_PROGRESS'].includes(c.status)
        )
        break
      case 'completed':
        filtered = consultations.filter(c => c.status === 'COMPLETED')
        break
      default:
        filtered = consultations
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patientName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  // Stats calculations
  const stats = {
    total: consultations.length,
    pending: pendingConsultations.length,
    active: consultations.filter(c => ['ACCEPTED', 'IN_PROGRESS'].includes(c.status)).length,
    completed: consultations.filter(c => c.status === 'COMPLETED').length,
  }

  const tabs = [
    { id: 'pending', label: 'Chờ duyệt', count: stats.pending, icon: Clock },
    { id: 'active', label: 'Đang tư vấn', count: stats.active, icon: MessageSquare },
    { id: 'completed', label: 'Đã hoàn thành', count: stats.completed, icon: CheckCircle },
    { id: 'all', label: 'Tất cả', count: stats.total, icon: Users },
  ]

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
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900">
          Tư vấn trực tuyến
        </h1>
        <p className="text-sage-600 mt-1">Quản lý yêu cầu tư vấn từ bệnh nhân</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-200 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-yellow-700">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <MessageSquare className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-700">Đang tư vấn</p>
                <p className="text-2xl font-bold text-green-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Hoàn thành</p>
                <p className="text-2xl font-bold text-blue-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sage-50 to-sage-100 border-sage-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sage-200 rounded-lg">
                <Users className="w-5 h-5 text-sage-700" />
              </div>
              <div>
                <p className="text-sm text-sage-700">Tổng cộng</p>
                <p className="text-2xl font-bold text-sage-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'primary' : 'outline'}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-sage-100 text-sage-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo bệnh nhân hoặc chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultation List */}
      {getFilteredConsultations().length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-sage-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-sage-900 mb-2">
              Không có yêu cầu nào
            </h3>
            <p className="text-sage-600">
              {activeTab === 'pending' 
                ? 'Không có yêu cầu tư vấn nào đang chờ duyệt'
                : 'Không tìm thấy yêu cầu tư vấn nào phù hợp'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {getFilteredConsultations().map((consultation, index) => (
            <motion.div
              key={consultation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/doctor/consultations/${consultation.id}`)}
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
                          <span className="font-medium">Bệnh nhân:</span>
                          <span>{consultation.patientName}</span>
                        </div>
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

                      {consultation.description && (
                        <p className="text-sm text-sage-500 line-clamp-2 mb-3">
                          {consultation.description}
                        </p>
                      )}

                      {consultation.latestMessagePreview && (
                        <div className="flex items-center gap-2 text-sm text-sage-500">
                          <MessageSquare className="w-4 h-4" />
                          <span className="line-clamp-1">
                            {consultation.latestMessagePreview}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="text-lg font-bold text-sage-900">
                        {consultation.fee?.toLocaleString()} đ
                      </div>

                      {/* Action buttons for pending consultations */}
                      {consultation.status === 'PENDING' && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAccept(consultation.id)
                            }}
                            disabled={isProcessing}
                            className="flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Chấp nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => openRejectModal(consultation, e)}
                            disabled={isProcessing}
                            className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XIcon className="w-4 h-4" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false)
          setSelectedConsultation(null)
          setRejectionReason('')
        }}
        title="Từ chối yêu cầu tư vấn"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800">
                Bạn sắp từ chối yêu cầu tư vấn từ bệnh nhân{' '}
                <strong>{selectedConsultation?.patientName}</strong>
              </p>
              <p className="text-sm text-red-600 mt-1">
                Chủ đề: {selectedConsultation?.topic}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nhập lý do từ chối (ví dụ: Không phù hợp chuyên môn, Lịch bận...)"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false)
                setSelectedConsultation(null)
                setRejectionReason('')
              }}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
              isLoading={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DoctorConsultations
