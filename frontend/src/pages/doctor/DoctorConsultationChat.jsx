import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    Send,
    Image as ImageIcon,
    File,
    MoreVertical,
    CheckCircle,
    Clock,
    X,
    Check,
    FileText,
    Stethoscope,
    Pill,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DOCTOR_PRIMARY, doctorPrimaryButtonClass } from './theme'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { consultationApi, wsManager } from '@/api/realApis/consultationApi'
import { formatDistanceToNow, format } from 'date-fns'
import { vi } from 'date-fns/locale'

const DoctorConsultationChat = () => {
    const { consultationId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { showToast } = useUIStore()
    const messagesEndRef = useRef(null)
    const [consultation, setConsultation] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Complete modal state
    const [showCompleteModal, setShowCompleteModal] = useState(false)
    const [completeData, setCompleteData] = useState({
        doctorNotes: '',
        diagnosis: '',
        prescription: '',
    })

    useEffect(() => {
        if (consultationId && user?.id) {
            fetchConsultationData()
            connectWebSocket()
        }

        return () => {
            wsManager.unsubscribeFromConsultation(parseInt(consultationId))
        }
    }, [consultationId, user?.id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const appendMessageUnique = (incomingMessage) => {
        if (!incomingMessage) return
        setMessages((prev) => {
            const incomingId = incomingMessage.id
            if (incomingId != null && prev.some((msg) => msg.id === incomingId)) {
                return prev
            }
            return [...prev, incomingMessage]
        })
    }

    useEffect(() => {
        // Mark messages as read when viewing
        if (consultation && messages.length > 0) {
            const timer = setTimeout(() => {
                consultationApi.markMessagesAsRead(parseInt(consultationId))
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [messages, consultation, consultationId])

    const fetchConsultationData = async () => {
        setIsLoading(true)
        try {
            const [consultationData, messagesData] = await Promise.all([
                consultationApi.getConsultationById(parseInt(consultationId)),
                consultationApi.getMessages(parseInt(consultationId)),
            ])
            setConsultation(consultationData)
            setMessages(messagesData)
        } catch (error) {
            console.error('Failed to load consultation:', error)
            showToast({ type: 'error', message: 'Không thể tải dữ liệu tư vấn' })
            navigate('/consultations')
        } finally {
            setIsLoading(false)
        }
    }

    const connectWebSocket = () => {
        if (!wsManager.isConnected()) {
            wsManager.connect(
                () => {
                    setIsConnected(true)
                    wsManager.subscribeToConsultation(parseInt(consultationId), (message) => {
                        appendMessageUnique(message)
                    })
                },
                (error) => {
                    console.error('WebSocket error:', error)
                    setIsConnected(false)
                }
            )
        } else {
            setIsConnected(true)
            wsManager.subscribeToConsultation(parseInt(consultationId), (message) => {
                appendMessageUnique(message)
            })
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()

        if (!newMessage.trim()) return

        if (
            consultation.status !== 'ACCEPTED' &&
            consultation.status !== 'IN_PROGRESS'
        ) {
            showToast({
                type: 'error',
                message: 'Không thể gửi tin nhắn ở trạng thái hiện tại',
            })
            return
        }

        setIsSending(true)
        try {
            await consultationApi.sendMessage({
                consultationId: parseInt(consultationId),
                type: 'TEXT',
                content: newMessage.trim(),
            })
            setNewMessage('')
        } catch (error) {
            console.error('Failed to send message:', error)
            showToast({ type: 'error', message: 'Không thể gửi tin nhắn' })
        } finally {
            setIsSending(false)
        }
    }

    const handleAccept = async () => {
        setIsProcessing(true)
        try {
            await consultationApi.acceptConsultation(parseInt(consultationId))
            showToast({ type: 'success', message: 'Đã chấp nhận yêu cầu tư vấn' })
            // Refresh consultation data
            const updatedConsultation = await consultationApi.getConsultationById(parseInt(consultationId))
            setConsultation(updatedConsultation)
        } catch (error) {
            console.error('Failed to accept consultation:', error)
            showToast({ type: 'error', message: 'Không thể chấp nhận yêu cầu' })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleComplete = async () => {
        if (!completeData.diagnosis.trim()) {
            showToast({ type: 'error', message: 'Vui lòng nhập chẩn đoán' })
            return
        }

        setIsProcessing(true)
        try {
            await consultationApi.completeConsultation(parseInt(consultationId), {
                doctorNotes: completeData.doctorNotes,
                diagnosis: completeData.diagnosis,
                prescription: completeData.prescription,
            })
            showToast({ type: 'success', message: 'Đã hoàn thành tư vấn' })
            setShowCompleteModal(false)
            // Refresh consultation data
            const updatedConsultation = await consultationApi.getConsultationById(parseInt(consultationId))
            setConsultation(updatedConsultation)
        } catch (error) {
            console.error('Failed to complete consultation:', error)
            showToast({ type: 'error', message: 'Không thể hoàn thành tư vấn' })
        } finally {
            setIsProcessing(false)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
            </div>
        )
    }

    if (!consultation) {
        return (
            <div className="text-center py-12">
                <p className="text-sage-600">Không tìm thấy tư vấn</p>
            </div>
        )
    }

    const canSendMessage =
        consultation.status === 'ACCEPTED' || consultation.status === 'IN_PROGRESS'
    const canComplete =
        consultation.status === 'ACCEPTED' || consultation.status === 'IN_PROGRESS'
    const isPending = consultation.status === 'PENDING'

    const isMyMessage = (message) => {
        const senderId = message?.senderId
        const currentUserId = user?.id

        if (senderId != null && currentUserId != null && String(senderId) === String(currentUserId)) {
            return true
        }

        // Fallback for inconsistent ID typing/payloads from realtime channel.
        if (message?.senderRole && user?.role) {
            return String(message.senderRole).toUpperCase() === String(user.role).toUpperCase()
        }

        return false
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="bg-white border-b border-sage-200 p-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/consultations')}
                        >
                            <ArrowLeft />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold text-sage-900">
                                    {consultation.patientName}
                                </h2>
                                {getStatusBadge(consultation.status)}
                                {isConnected && (
                                    <Badge variant="green" className="text-xs">
                                        ● Trực tuyến
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-sage-600">{consultation.topic}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Accept button for pending */}
                        {isPending && (
                            <Button
                                variant="primary"
                                onClick={handleAccept}
                                disabled={isProcessing}
                                isLoading={isProcessing}
                                className={`flex items-center gap-2 ${doctorPrimaryButtonClass}`}
                            >
                                <Check className="w-4 h-4" />
                                Chấp nhận
                            </Button>
                        )}

                        {/* Complete button for active consultations */}
                        {canComplete && (
                            <Button
                                variant="primary"
                                onClick={() => setShowCompleteModal(true)}
                                className={`flex items-center gap-2 ${doctorPrimaryButtonClass}`}
                            >
                                <CheckCircle className="w-4 h-4" />
                                Hoàn thành tư vấn
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-sage-50 p-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* Status Messages */}
                    {consultation.status === 'PENDING' && (
                        <div className="text-center py-8">
                            <div className="inline-block p-4 bg-yellow-50 rounded-lg">
                                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                                <p className="text-yellow-900 font-medium">
                                    Yêu cầu đang chờ xác nhận
                                </p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Nhấn "Chấp nhận" để bắt đầu tư vấn với bệnh nhân
                                </p>
                            </div>
                        </div>
                    )}

                    {consultation.status === 'REJECTED' && (
                        <div className="text-center py-8">
                            <div className="inline-block p-4 bg-red-50 rounded-lg">
                                <X className="w-8 h-8 text-red-600 mx-auto mb-2" />
                                <p className="text-red-900 font-medium">Yêu cầu đã bị từ chối</p>
                                {consultation.rejectionReason && (
                                    <p className="text-sm text-red-700 mt-2">
                                        Lý do: {consultation.rejectionReason}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {consultation.status === 'COMPLETED' && (
                        <div className="text-center py-8">
                            <div className="inline-block p-4 bg-green-50 rounded-lg max-w-lg w-full">
                                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <p className="text-green-900 font-medium">Tư vấn đã hoàn thành</p>

                                {consultation.diagnosis && (
                                    <div className="mt-4 text-left bg-white p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Stethoscope className="w-4 h-4 text-sage-600" />
                                            <h4 className="font-semibold text-sage-900">Chẩn đoán:</h4>
                                        </div>
                                        <p className="text-sage-700 text-sm">{consultation.diagnosis}</p>
                                    </div>
                                )}

                                {consultation.prescription && (
                                    <div className="mt-2 text-left bg-white p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Pill className="w-4 h-4 text-sage-600" />
                                            <h4 className="font-semibold text-sage-900">Đơn thuốc:</h4>
                                        </div>
                                        <p className="text-sage-700 text-sm whitespace-pre-wrap">
                                            {consultation.prescription}
                                        </p>
                                    </div>
                                )}

                                {consultation.doctorNotes && (
                                    <div className="mt-2 text-left bg-white p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4 text-sage-600" />
                                            <h4 className="font-semibold text-sage-900">Ghi chú:</h4>
                                        </div>
                                        <p className="text-sage-700 text-sm whitespace-pre-wrap">
                                            {consultation.doctorNotes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    <AnimatePresence>
                        {messages.map((message, index) => {
                            const isMine = isMyMessage(message)
                            return (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] ${isMine ? 'text-white' : 'bg-white text-sage-900'
                                            } rounded-lg p-4 shadow-sm`}
                                        style={isMine ? { backgroundColor: DOCTOR_PRIMARY } : undefined}
                                    >
                                        {!isMine && (
                                            <p className="text-xs font-semibold mb-1 opacity-75">
                                                {message.senderName}
                                            </p>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <p
                                            className={`text-xs mt-2 ${isMine ? 'text-sage-200' : 'text-sage-500'
                                                }`}
                                        >
                                            {format(new Date(message.sentAt), 'HH:mm', { locale: vi })}
                                            {isMine && message.isRead && ' • Đã đọc'}
                                        </p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            {canSendMessage && (
                <div className="bg-white border-t border-sage-200 p-4">
                    <form
                        onSubmit={handleSendMessage}
                        className="max-w-4xl mx-auto flex gap-2"
                    >
                        <Input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            disabled={isSending || !isConnected}
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            disabled={isSending || !newMessage.trim() || !isConnected}
                            isLoading={isSending}
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            )}

            {!canSendMessage && consultation.status !== 'COMPLETED' && (
                <div className="bg-sage-100 text-center p-4">
                    <p className="text-sm text-sage-600">
                        {isPending
                            ? 'Chấp nhận yêu cầu để bắt đầu chat'
                            : 'Không thể gửi tin nhắn ở trạng thái hiện tại'}
                    </p>
                </div>
            )}

            {/* Complete Consultation Modal */}
            <Modal
                isOpen={showCompleteModal}
                onClose={() => setShowCompleteModal(false)}
                title="Hoàn thành tư vấn"
                className="max-w-2xl"
            >
                <div className="space-y-4">
                    <p className="text-sm text-sage-600">
                        Hoàn thành tư vấn với bệnh nhân <strong>{consultation.patientName}</strong>.
                        Vui lòng điền thông tin chẩn đoán và đơn thuốc (nếu có).
                    </p>

                    {/* Diagnosis */}
                    <div>
                        <label className="block text-sm font-medium text-sage-700 mb-2">
                            <div className="flex items-center gap-2">
                                <Stethoscope className="w-4 h-4" />
                                Chẩn đoán <span className="text-red-500">*</span>
                            </div>
                        </label>
                        <Textarea
                            value={completeData.diagnosis}
                            onChange={(e) => setCompleteData(prev => ({ ...prev, diagnosis: e.target.value }))}
                            placeholder="Nhập chẩn đoán của bạn..."
                            rows={3}
                        />
                    </div>

                    {/* Prescription */}
                    <div>
                        <label className="block text-sm font-medium text-sage-700 mb-2">
                            <div className="flex items-center gap-2">
                                <Pill className="w-4 h-4" />
                                Đơn thuốc
                            </div>
                        </label>
                        <Textarea
                            value={completeData.prescription}
                            onChange={(e) => setCompleteData(prev => ({ ...prev, prescription: e.target.value }))}
                            placeholder="Nhập đơn thuốc (nếu có)..."
                            rows={4}
                        />
                    </div>

                    {/* Doctor Notes */}
                    <div>
                        <label className="block text-sm font-medium text-sage-700 mb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Ghi chú thêm
                            </div>
                        </label>
                        <Textarea
                            value={completeData.doctorNotes}
                            onChange={(e) => setCompleteData(prev => ({ ...prev, doctorNotes: e.target.value }))}
                            placeholder="Ghi chú thêm cho bệnh nhân..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowCompleteModal(false)}
                            disabled={isProcessing}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleComplete}
                            disabled={isProcessing || !completeData.diagnosis.trim()}
                            isLoading={isProcessing}
                            className={doctorPrimaryButtonClass}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Hoàn thành tư vấn
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default DoctorConsultationChat
