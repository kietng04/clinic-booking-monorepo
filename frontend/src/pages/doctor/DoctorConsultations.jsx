import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  CheckCheck,
  CheckCircle2,
  MessageSquare,
  Search,
  Send,
  UserRound,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { consultationApi, wsManager } from '@/api/realApis/consultationApi'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { DOCTOR_PRIMARY, doctorPrimaryActiveClass, doctorPrimaryButtonClass } from './theme'

const ACTIVE_STATUSES = new Set(['ACCEPTED', 'IN_PROGRESS'])

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ phản hồi' },
  { id: 'active', label: 'Đang chat' },
  { id: 'completed', label: 'Hoàn thành' },
]

const statusMeta = {
  PENDING: {
    label: 'Chờ phản hồi',
    className: 'border-[#ead7b2] bg-[#fbf6ea] text-[#8a6a28]',
    bannerClassName: 'border-[#ead7b2] bg-[#fbf6ea] text-[#6f5522]',
  },
  ACCEPTED: {
    label: 'Đã nhận',
    className: 'border-[#d7e6f5] bg-[#f2f7fb] text-[#45617a]',
    bannerClassName: 'border-[#d7e6f5] bg-[#f2f7fb] text-[#45617a]',
  },
  IN_PROGRESS: {
    label: 'Đang tư vấn',
    className: 'border-[#d7e6f5] bg-[#eef5fb] text-[#3e627f]',
    bannerClassName: 'border-[#d7e6f5] bg-[#eef5fb] text-[#3e627f]',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    className: 'border-[#d7e5d9] bg-[#f3f7f3] text-[#4f6b57]',
    bannerClassName: 'border-[#d7e5d9] bg-[#f3f7f3] text-[#4f6b57]',
  },
  REJECTED: {
    label: 'Từ chối',
    className: 'border-[#efd3d4] bg-[#fbf2f2] text-[#8a4d52]',
    bannerClassName: 'border-[#efd3d4] bg-[#fbf2f2] text-[#8a4d52]',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'border-slate-200 bg-slate-100 text-slate-600',
    bannerClassName: 'border-slate-200 bg-slate-100 text-slate-600',
  },
}

function getStatusMeta(status) {
  return statusMeta[String(status || '').toUpperCase()] || statusMeta.PENDING
}

function sortConsultations(items) {
  return [...items].sort((left, right) => {
    const leftTime = left.lastMessageTime ? new Date(left.lastMessageTime).getTime() : 0
    const rightTime = right.lastMessageTime ? new Date(right.lastMessageTime).getTime() : 0
    return rightTime - leftTime
  })
}

function normalizeConsultation(consultation) {
  return {
    id: consultation?.id,
    consultationId: consultation?.id,
    patientId: consultation?.patientId,
    patientName: consultation?.patientName || `Bệnh nhân #${consultation?.patientId ?? consultation?.id}`,
    topic: consultation?.topic || 'Tư vấn trực tuyến',
    description: consultation?.description || '',
    status: consultation?.status || 'PENDING',
    unreadCount: Number(consultation?.unreadCount ?? 0),
    latestMessagePreview:
      consultation?.latestMessagePreview || consultation?.latestMessage?.content || '',
    lastMessageTime:
      consultation?.latestMessageTime ||
      consultation?.latestMessage?.sentAt ||
      consultation?.updatedAt ||
      consultation?.createdAt ||
      null,
    createdAt: consultation?.createdAt || null,
    updatedAt: consultation?.updatedAt || null,
    rejectionReason: consultation?.rejectionReason || '',
    diagnosis: consultation?.diagnosis || '',
    doctorNotes: consultation?.doctorNotes || '',
    prescription: consultation?.prescription || '',
  }
}

function normalizeMessage(message) {
  return {
    id: String(message?.id ?? `${message?.senderId ?? 'msg'}-${message?.sentAt ?? Date.now()}`),
    senderId: String(message?.senderId ?? ''),
    senderRole: message?.senderRole || '',
    senderName: message?.senderName || '',
    content: message?.content || '',
    sentAt: message?.sentAt || message?.timestamp || new Date().toISOString(),
    isRead: Boolean(message?.isRead),
  }
}

function formatConversationTime(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const sameDay =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear()

  return sameDay ? format(date, 'HH:mm', { locale: vi }) : format(date, 'dd/MM', { locale: vi })
}

function filterConsultations(consultations, filterId, query) {
  let nextConsultations = consultations

  if (filterId === 'pending') {
    nextConsultations = consultations.filter((item) => item.status === 'PENDING')
  }

  if (filterId === 'active') {
    nextConsultations = consultations.filter((item) => ACTIVE_STATUSES.has(item.status))
  }

  if (filterId === 'completed') {
    nextConsultations = consultations.filter((item) => item.status === 'COMPLETED')
  }

  const keyword = query.trim().toLowerCase()
  if (!keyword) return nextConsultations

  return nextConsultations.filter((item) =>
    [item.patientName, item.topic, item.description, item.latestMessagePreview]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword))
  )
}

export default function DoctorConsultations() {
  const navigate = useNavigate()
  const { consultationId } = useParams()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const messagesEndRef = useRef(null)

  const [consultations, setConsultations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [newMessage, setNewMessage] = useState('')
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [conversationError, setConversationError] = useState('')
  const [messageError, setMessageError] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [completeData, setCompleteData] = useState({
    diagnosis: '',
    doctorNotes: '',
    prescription: '',
  })

  useEffect(() => {
    if (!user?.id) return

    let disposed = false

    const handleConnected = () => {
      if (!disposed) {
        setIsConnected(true)
      }
    }

    const handleError = () => {
      if (!disposed) {
        setIsConnected(false)
      }
    }

    if (!wsManager.isConnected()) {
      wsManager.connect(handleConnected, handleError)
    } else {
      setIsConnected(true)
    }

    return () => {
      disposed = true
      wsManager.disconnect()
      setIsConnected(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      fetchConsultations()
    }
  }, [user?.id])

  useEffect(() => {
    if (!consultationId) {
      setActiveConversation(null)
      setMessages([])
      setMessageError('')
      return
    }

    const matchedConversation = consultations.find(
      (item) => String(item.consultationId) === String(consultationId)
    )

    if (matchedConversation) {
      setActiveConversation(matchedConversation)
      return
    }

    if (!user?.id) return

    let cancelled = false

    const loadConsultationDetail = async () => {
      try {
        const data = await consultationApi.getConsultationById(Number(consultationId))
        if (cancelled) return

        const normalized = normalizeConsultation(data)
        setConsultations((current) => {
          const next = current.some(
            (item) => String(item.consultationId) === String(normalized.consultationId)
          )
            ? current.map((item) =>
                String(item.consultationId) === String(normalized.consultationId) ? normalized : item
              )
            : [...current, normalized]

          return sortConsultations(next)
        })
        setActiveConversation(normalized)
      } catch (error) {
        if (!cancelled) {
          showToast({
            type: 'error',
            message: extractApiErrorMessage(error, 'Không thể tải cuộc trò chuyện'),
          })
        }
      }
    }

    loadConsultationDetail()

    return () => {
      cancelled = true
    }
  }, [consultationId, consultations, user?.id, showToast])

  useEffect(() => {
    if (!activeConversation?.consultationId) return
    fetchMessages(activeConversation.consultationId)
  }, [activeConversation?.consultationId])

  useEffect(() => {
    if (!activeConversation?.consultationId || !isConnected) return

    const selectedId = Number(activeConversation.consultationId)
    wsManager.subscribeToConsultation(selectedId, (incomingMessage) => {
      const normalized = normalizeMessage(incomingMessage)

      setMessages((current) => {
        if (current.some((message) => message.id === normalized.id)) {
          return current
        }
        return [...current, normalized]
      })

      setConsultations((current) =>
        sortConsultations(
          current.map((item) =>
            item.consultationId === selectedId
              ? {
                  ...item,
                  latestMessagePreview: normalized.content,
                  lastMessageTime: normalized.sentAt,
                  unreadCount: 0,
                }
              : item
          )
        )
      )
    })

    return () => {
      wsManager.unsubscribeFromConsultation(selectedId)
    }
  }, [activeConversation?.consultationId, isConnected])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!activeConversation?.consultationId || messages.length === 0) return

    const timer = setTimeout(() => {
      consultationApi.markMessagesAsRead(Number(activeConversation.consultationId)).catch(() => {})
      setConsultations((current) =>
        current.map((item) =>
          item.consultationId === activeConversation.consultationId
            ? { ...item, unreadCount: 0 }
            : item
        )
      )
    }, 600)

    return () => clearTimeout(timer)
  }, [activeConversation?.consultationId, messages])

  async function fetchConsultations() {
    setIsLoadingConsultations(true)
    setConversationError('')

    try {
      const response = await consultationApi.getConsultationsByDoctor(user.id, 0, 50)
      const nextConsultations = sortConsultations(
        (response?.content || response || []).map(normalizeConsultation)
      )
      setConsultations(nextConsultations)

      if (consultationId) {
        const matchedConversation = nextConsultations.find(
          (item) => String(item.consultationId) === String(consultationId)
        )
        setActiveConversation(matchedConversation || null)
      }
    } catch (error) {
      const message = extractApiErrorMessage(error, 'Không thể tải danh sách tin nhắn')
      setConversationError(message)
      setConsultations([])
      showToast({ type: 'error', message })
    } finally {
      setIsLoadingConsultations(false)
    }
  }

  async function fetchMessages(targetConsultationId) {
    setIsLoadingMessages(true)
    setMessageError('')

    try {
      const response = await consultationApi.getMessages(Number(targetConsultationId))
      setMessages(Array.isArray(response) ? response.map(normalizeMessage) : [])
    } catch (error) {
      const message = extractApiErrorMessage(error, 'Không thể tải nội dung trò chuyện')
      setMessageError(message)
      setMessages([])
      showToast({ type: 'error', message })
    } finally {
      setIsLoadingMessages(false)
    }
  }

  function selectConversation(conversation) {
    navigate(`/doctor/consultations/${conversation.consultationId}`)
  }

  function clearSelection() {
    navigate('/doctor/messages')
  }

  function isMyMessage(message) {
    const senderId = message?.senderId
    const currentUserId = user?.id

    if (senderId != null && currentUserId != null && String(senderId) === String(currentUserId)) {
      return true
    }

    if (message?.senderRole && user?.role) {
      return String(message.senderRole).toUpperCase() === String(user.role).toUpperCase()
    }

    return false
  }

  async function refreshActiveConversation(targetId = activeConversation?.consultationId) {
    if (!targetId) return

    try {
      const data = await consultationApi.getConsultationById(Number(targetId))
      const normalized = normalizeConsultation(data)

      setConsultations((current) => {
        const exists = current.some(
          (item) => String(item.consultationId) === String(normalized.consultationId)
        )
        const next = exists
          ? current.map((item) =>
              String(item.consultationId) === String(normalized.consultationId) ? normalized : item
            )
          : [...current, normalized]

        return sortConsultations(next)
      })

      setActiveConversation(normalized)
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể cập nhật cuộc trò chuyện'),
      })
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault()

    const content = newMessage.trim()
    if (!content || !activeConversation) return

    if (!ACTIVE_STATUSES.has(activeConversation.status)) {
      showToast({
        type: 'error',
        message: 'Chỉ có thể nhắn tin khi phiên tư vấn đang hoạt động',
      })
      return
    }

    setIsSending(true)
    try {
      const response = await consultationApi.sendMessage({
        consultationId: Number(activeConversation.consultationId),
        type: 'TEXT',
        content,
      })

      const normalized = normalizeMessage(response)
      setMessages((current) =>
        current.some((message) => message.id === normalized.id) ? current : [...current, normalized]
      )

      setConsultations((current) =>
        sortConsultations(
          current.map((item) =>
            item.consultationId === activeConversation.consultationId
              ? {
                  ...item,
                  latestMessagePreview: content,
                  lastMessageTime: normalized.sentAt,
                }
              : item
          )
        )
      )

      setActiveConversation((current) =>
        current
          ? {
              ...current,
              latestMessagePreview: content,
              lastMessageTime: normalized.sentAt,
            }
          : current
      )
      setNewMessage('')
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể gửi tin nhắn'),
      })
    } finally {
      setIsSending(false)
    }
  }

  async function handleAccept() {
    if (!activeConversation) return

    setIsProcessing(true)
    try {
      await consultationApi.acceptConsultation(Number(activeConversation.consultationId))
      showToast({ type: 'success', message: 'Đã nhận phiên tư vấn' })
      await refreshActiveConversation(activeConversation.consultationId)
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể nhận phiên tư vấn'),
      })
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleReject() {
    if (!activeConversation || !rejectionReason.trim()) return

    setIsProcessing(true)
    try {
      await consultationApi.rejectConsultation(
        Number(activeConversation.consultationId),
        rejectionReason.trim()
      )
      showToast({ type: 'success', message: 'Đã từ chối phiên tư vấn' })
      setShowRejectModal(false)
      setRejectionReason('')
      await refreshActiveConversation(activeConversation.consultationId)
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể từ chối phiên tư vấn'),
      })
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleComplete() {
    if (!activeConversation) return

    if (!completeData.diagnosis.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập kết luận' })
      return
    }

    if (!completeData.doctorNotes.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập dặn dò' })
      return
    }

    setIsProcessing(true)
    try {
      await consultationApi.completeConsultation(Number(activeConversation.consultationId), {
        diagnosis: completeData.diagnosis.trim(),
        doctorNotes: completeData.doctorNotes.trim(),
        prescription: completeData.prescription.trim(),
      })
      showToast({ type: 'success', message: 'Phiên tư vấn đã hoàn thành' })
      setShowCompleteModal(false)
      setCompleteData({ diagnosis: '', doctorNotes: '', prescription: '' })
      await refreshActiveConversation(activeConversation.consultationId)
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể hoàn thành phiên tư vấn'),
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredConsultations = filterConsultations(consultations, activeFilter, searchQuery)
  const pendingCount = consultations.filter((item) => item.status === 'PENDING').length
  const activeCount = consultations.filter((item) => ACTIVE_STATUSES.has(item.status)).length
  const completedCount = consultations.filter((item) => item.status === 'COMPLETED').length

  return (
    <div>
      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.06)]">
        <div className="flex h-[calc(100vh-14rem)] min-h-[680px]">
          <aside
            className={cn(
              'w-full shrink-0 border-r border-slate-200 bg-[#fbfbfc] md:w-[360px]',
              activeConversation ? 'hidden md:flex md:flex-col' : 'flex flex-col'
            )}
          >
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">
                    Tin nhắn
                  </div>
                  <div className="mt-1 text-[14px] text-slate-500">
                    {consultations.length} cuộc hội thoại
                  </div>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-[999px] border px-3 py-1.5 text-[12px] font-semibold',
                    isConnected
                      ? 'border-[#d7e5d9] bg-[#f3f7f3] text-[#4f6b57]'
                      : 'border-slate-200 bg-slate-100 text-slate-500'
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      isConnected ? 'bg-[#6d8b73]' : 'bg-slate-400'
                    )}
                  />
                  {isConnected ? 'Đang kết nối' : 'Ngoại tuyến'}
                </span>
              </div>

              <div className="mt-4">
                <Input
                  type="text"
                  placeholder="Tìm theo bệnh nhân hoặc nội dung..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  className="rounded-[12px] border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {FILTERS.map((filter) => {
                  const count =
                    filter.id === 'pending'
                      ? pendingCount
                      : filter.id === 'active'
                        ? activeCount
                        : filter.id === 'completed'
                          ? completedCount
                          : consultations.length

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveFilter(filter.id)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-[12px] border px-3 py-2 text-[13px] font-semibold transition',
                        activeFilter === filter.id
                          ? doctorPrimaryActiveClass
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                      )}
                    >
                      <span>{filter.label}</span>
                      <span
                        className={cn(
                          'rounded-[999px] px-2 py-0.5 text-[11px]',
                          activeFilter === filter.id
                            ? 'bg-white/15 text-white'
                            : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              {isLoadingConsultations ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="h-[108px] animate-pulse rounded-[16px] border border-slate-200 bg-white"
                    />
                  ))}
                </div>
              ) : conversationError ? (
                <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4 text-[14px] text-slate-600">
                  <p>{conversationError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchConsultations}
                    className="mt-3 rounded-[12px] border-slate-200"
                  >
                    Tải lại
                  </Button>
                </div>
              ) : filteredConsultations.length === 0 ? (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-[18px] border border-dashed border-slate-200 bg-white px-6 text-center">
                  <MessageSquare className="h-10 w-10 text-slate-300" />
                  <div className="mt-4 text-[16px] font-semibold text-slate-900">
                    Chưa có cuộc trò chuyện
                  </div>
                  <div className="mt-2 text-[14px] leading-6 text-slate-500">
                    Danh sách hội thoại với bệnh nhân sẽ xuất hiện tại đây.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConsultations.map((conversation) => {
                    const meta = getStatusMeta(conversation.status)
                    const isActive =
                      String(activeConversation?.consultationId) ===
                      String(conversation.consultationId)

                    return (
                      <button
                        key={conversation.consultationId}
                        type="button"
                        onClick={() => selectConversation(conversation)}
                        className={cn(
                          'w-full rounded-[16px] border px-4 py-4 text-left transition',
                          isActive
                            ? `${doctorPrimaryActiveClass} shadow-[0_18px_36px_rgba(41,53,43,0.2)]`
                            : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={`https://i.pravatar.cc/160?u=${conversation.patientId || conversation.consultationId}`}
                            name={conversation.patientName}
                            size="lg"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-[16px] font-semibold">
                                  {conversation.patientName}
                                </div>
                                <div
                                  className={cn(
                                    'mt-1 truncate text-[13px]',
                                    isActive ? 'text-slate-300' : 'text-slate-500'
                                  )}
                                >
                                  {conversation.topic}
                                </div>
                              </div>

                              <div
                                className={cn(
                                  'shrink-0 text-[12px] font-semibold',
                                  isActive ? 'text-slate-300' : 'text-slate-400'
                                )}
                              >
                                {formatConversationTime(conversation.lastMessageTime)}
                              </div>
                            </div>

                            <div
                              className={cn(
                                'mt-3 line-clamp-2 text-[13px] leading-6',
                                isActive ? 'text-slate-200' : 'text-slate-600'
                              )}
                            >
                              {conversation.latestMessagePreview ||
                                conversation.description ||
                                'Chưa có nội dung tin nhắn.'}
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <span
                                className={cn(
                                  'inline-flex rounded-[999px] border px-2.5 py-1 text-[11px] font-semibold',
                                  isActive ? 'border-white/15 bg-white/10 text-white' : meta.className
                                )}
                              >
                                {meta.label}
                              </span>

                              {conversation.unreadCount > 0 && (
                                <span
                                  className={cn(
                                    'inline-flex min-w-[24px] items-center justify-center rounded-[999px] px-2 py-1 text-[11px] font-semibold',
                                    isActive
                                      ? 'bg-white text-slate-900'
                                      : 'bg-[#29352B] text-white'
                                  )}
                                >
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </aside>

          <section
            className={cn(
              'flex-1 flex-col bg-white',
              activeConversation ? 'flex' : 'hidden md:flex'
            )}
          >
            {activeConversation ? (
              <>
                <div className="border-b border-slate-200 px-5 py-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex items-start gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                        leftIcon={<ArrowLeft className="h-4 w-4" />}
                        className="rounded-[10px] px-0 text-slate-600 hover:bg-transparent hover:text-slate-900 md:hidden"
                      >
                        Danh sách
                      </Button>

                      <Avatar
                        src={`https://i.pravatar.cc/200?u=${activeConversation.patientId || activeConversation.consultationId}`}
                        name={activeConversation.patientName}
                        size="xl"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">
                            {activeConversation.patientName}
                          </h2>
                          <span
                            className={cn(
                              'inline-flex rounded-[999px] border px-3 py-1 text-[12px] font-semibold',
                              getStatusMeta(activeConversation.status).className
                            )}
                          >
                            {getStatusMeta(activeConversation.status).label}
                          </span>
                        </div>

                        <div className="mt-2 text-[15px] text-slate-600">
                          {activeConversation.topic}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={cn(
                                'h-2 w-2 rounded-full',
                                isConnected ? 'bg-[#6d8b73]' : 'bg-slate-400'
                              )}
                            />
                            {isConnected ? 'Kết nối realtime' : 'Đang mất kết nối realtime'}
                          </span>
                          {activeConversation.createdAt && (
                            <span>
                              Mở từ{' '}
                              {formatDistanceToNow(new Date(activeConversation.createdAt), {
                                addSuffix: true,
                                locale: vi,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {activeConversation.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRejectModal(true)}
                            disabled={isProcessing}
                            className="rounded-[12px] border-[#efd3d4] text-[#8a4d52] hover:bg-[#fbf2f2]"
                          >
                            Từ chối
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleAccept}
                            disabled={isProcessing}
                            isLoading={isProcessing}
                            leftIcon={<Check className="h-4 w-4" />}
                            className={`rounded-[12px] ${doctorPrimaryButtonClass}`}
                          >
                            Nhận phiên tư vấn
                          </Button>
                        </>
                      )}

                      {ACTIVE_STATUSES.has(activeConversation.status) && (
                        <Button
                          size="sm"
                          onClick={() => setShowCompleteModal(true)}
                          leftIcon={<CheckCircle2 className="h-4 w-4" />}
                          className={`rounded-[12px] ${doctorPrimaryButtonClass}`}
                        >
                          Hoàn thành
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-[#f7f8fa] px-4 py-4 md:px-6">
                  <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
                    {activeConversation.status === 'PENDING' && (
                      <div
                        className={cn(
                          'mb-4 rounded-[16px] border px-4 py-4 text-[14px] leading-6',
                          getStatusMeta(activeConversation.status).bannerClassName
                        )}
                      >
                        Phiên tư vấn này đang chờ bác sĩ tiếp nhận. Sau khi nhận, bạn có thể nhắn
                        tin trực tiếp với bệnh nhân ngay trong khung chat này.
                      </div>
                    )}

                    {activeConversation.status === 'REJECTED' && (
                      <div
                        className={cn(
                          'mb-4 rounded-[16px] border px-4 py-4 text-[14px] leading-6',
                          getStatusMeta(activeConversation.status).bannerClassName
                        )}
                      >
                        Phiên tư vấn đã bị từ chối.
                        {activeConversation.rejectionReason
                          ? ` Lý do: ${activeConversation.rejectionReason}`
                          : ''}
                      </div>
                    )}

                    {activeConversation.status === 'COMPLETED' && (
                      <div className="mb-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            Kết luận
                          </div>
                          <div className="mt-2 text-[14px] leading-6 text-slate-900">
                            {activeConversation.diagnosis || 'Chưa cập nhật'}
                          </div>
                        </div>
                        <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            Dặn dò
                          </div>
                          <div className="mt-2 text-[14px] leading-6 text-slate-900">
                            {activeConversation.doctorNotes || 'Chưa cập nhật'}
                          </div>
                        </div>
                        <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            Đơn thuốc
                          </div>
                          <div className="mt-2 text-[14px] leading-6 text-slate-900">
                            {activeConversation.prescription || 'Không có'}
                          </div>
                        </div>
                      </div>
                    )}

                    {isLoadingMessages ? (
                      <div className="space-y-3 py-4">
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className={cn(
                              'h-20 max-w-[72%] animate-pulse rounded-[18px] border border-slate-200 bg-white',
                              item % 2 === 0 ? 'ml-auto' : ''
                            )}
                          />
                        ))}
                      </div>
                    ) : messageError ? (
                      <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4 text-[14px] text-slate-600">
                        <p>{messageError}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchMessages(activeConversation.consultationId)}
                          className="mt-3 rounded-[12px] border-slate-200"
                        >
                          Tải lại tin nhắn
                        </Button>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center">
                        <div className="rounded-[20px] border border-dashed border-slate-200 bg-white px-8 py-10 text-center">
                          <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
                          <div className="mt-4 text-[18px] font-semibold text-slate-900">
                            Chưa có tin nhắn
                          </div>
                          <div className="mt-2 max-w-sm text-[14px] leading-6 text-slate-500">
                            Khi bác sĩ và bệnh nhân bắt đầu trao đổi, nội dung hội thoại sẽ hiển
                            thị tại đây.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 py-1">
                        {messages.map((message) => {
                          const mine = isMyMessage(message)

                          return (
                            <div
                              key={message.id}
                              className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                            >
                              <div
                                className={cn(
                                  'max-w-[78%] rounded-[18px] px-4 py-3 shadow-sm',
                                  mine
                                    ? 'rounded-br-[8px] text-white'
                                    : 'rounded-bl-[8px] border border-slate-200 bg-white text-slate-900'
                                )}
                                style={mine ? { backgroundColor: DOCTOR_PRIMARY } : undefined}
                              >
                                {!mine && (
                                  <div className="mb-1 text-[12px] font-semibold text-slate-500">
                                    {message.senderName || activeConversation.patientName}
                                  </div>
                                )}
                                <div className="whitespace-pre-wrap text-[14px] leading-6">
                                  {message.content}
                                </div>
                                <div
                                  className={cn(
                                    'mt-2 flex items-center gap-1 text-[11px] font-medium',
                                    mine ? 'text-slate-300' : 'text-slate-400'
                                  )}
                                >
                                  <span>{format(new Date(message.sentAt), 'HH:mm', { locale: vi })}</span>
                                  {mine && message.isRead && <CheckCheck className="h-3.5 w-3.5" />}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-white px-4 py-4 md:px-6">
                  {ACTIVE_STATUSES.has(activeConversation.status) ? (
                    <form
                      onSubmit={handleSendMessage}
                      className="mx-auto flex w-full max-w-4xl items-end gap-3"
                    >
                      <div className="flex-1">
                        <Textarea
                          value={newMessage}
                          onChange={(event) => setNewMessage(event.target.value)}
                          placeholder="Nhập tin nhắn gửi cho bệnh nhân..."
                          rows={2}
                          className="min-h-[56px] rounded-[14px] border-slate-200 px-4 py-3 text-[14px] text-slate-900 focus:border-slate-300 focus:ring-slate-200"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSending || !newMessage.trim()}
                        isLoading={isSending}
                        className={`h-[56px] rounded-[14px] px-5 ${doctorPrimaryButtonClass}`}
                      >
                        {!isSending && <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                  ) : (
                    <div className="mx-auto w-full max-w-4xl rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-500">
                      {activeConversation.status === 'PENDING'
                        ? 'Nhận phiên tư vấn để bắt đầu nhắn tin với bệnh nhân.'
                        : activeConversation.status === 'COMPLETED'
                          ? 'Phiên tư vấn đã hoàn thành. Khung chat được lưu để tra cứu lại nội dung.'
                          : 'Không thể gửi tin nhắn ở trạng thái hiện tại.'}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center bg-[#f8f9fb] px-8 text-center">
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-white px-10 py-12 shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-slate-100">
                    <UserRound className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-slate-900">
                    Chọn một bệnh nhân để bắt đầu
                  </div>
                  <div className="mt-3 max-w-md text-[15px] leading-7 text-slate-500">
                    Danh sách hội thoại nằm ở cột bên trái. Chọn đúng bệnh nhân để mở toàn bộ tin
                    nhắn trong một màn hình chat tập trung.
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false)
          setRejectionReason('')
        }}
        title="Từ chối phiên tư vấn"
      >
        <div className="space-y-4">
          <div className="rounded-[14px] border border-[#efd3d4] bg-[#fbf2f2] px-4 py-4 text-[14px] leading-6 text-[#8a4d52]">
            Phiên tư vấn với <strong>{activeConversation?.patientName}</strong> sẽ bị từ chối nếu
            bạn xác nhận thao tác này.
          </div>

          <Textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Nhập lý do từ chối..."
            rows={4}
            className="rounded-[12px] border-slate-200 px-4 py-3 text-[14px] focus:border-slate-300 focus:ring-slate-200"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowRejectModal(false)
                setRejectionReason('')
              }}
              className="rounded-[12px] border-slate-200"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
              isLoading={isProcessing}
              className={`rounded-[12px] ${doctorPrimaryButtonClass}`}
            >
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Hoàn thành tư vấn"
      >
        <div className="space-y-4">
          <div className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-4 text-[14px] leading-6 text-slate-600">
            Lưu kết quả phiên chat với <strong>{activeConversation?.patientName}</strong> để kết
            thúc buổi tư vấn trực tuyến.
          </div>

          <Textarea
            value={completeData.diagnosis}
            onChange={(event) =>
              setCompleteData((current) => ({ ...current, diagnosis: event.target.value }))
            }
            placeholder="Kết luận"
            rows={3}
            className="rounded-[12px] border-slate-200 px-4 py-3 text-[14px] focus:border-slate-300 focus:ring-slate-200"
          />

          <Textarea
            value={completeData.doctorNotes}
            onChange={(event) =>
              setCompleteData((current) => ({ ...current, doctorNotes: event.target.value }))
            }
            placeholder="Dặn dò"
            rows={3}
            className="rounded-[12px] border-slate-200 px-4 py-3 text-[14px] focus:border-slate-300 focus:ring-slate-200"
          />

          <Textarea
            value={completeData.prescription}
            onChange={(event) =>
              setCompleteData((current) => ({ ...current, prescription: event.target.value }))
            }
            placeholder="Đơn thuốc (optional)"
            rows={3}
            className="rounded-[12px] border-slate-200 px-4 py-3 text-[14px] focus:border-slate-300 focus:ring-slate-200"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompleteModal(false)}
              className="rounded-[12px] border-slate-200"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={isProcessing}
              isLoading={isProcessing}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              className={`rounded-[12px] ${doctorPrimaryButtonClass}`}
            >
              Lưu kết quả
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
