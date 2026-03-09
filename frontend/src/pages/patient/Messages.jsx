import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Send, Video, MoreVertical, Circle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { consultationApi } from '@/api/realApis/consultationApi'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'
import { formatTime } from '@/lib/utils'
import { vi } from '@/lib/translations'

const ACTIVE_CONSULTATION_STATUSES = new Set(['ACCEPTED', 'IN_PROGRESS'])

const normalizeConversation = (consultation, userRole) => {
  const isDoctorView = userRole === 'DOCTOR'
  const participantId = isDoctorView ? consultation?.patientId : consultation?.doctorId
  const participantName = isDoctorView
    ? consultation?.patientName || `Bệnh nhân #${consultation?.patientId ?? consultation?.id}`
    : consultation?.doctorName || `Bác sĩ #${consultation?.doctorId ?? consultation?.id}`

  return {
    id: consultation?.id,
    consultationId: consultation?.id,
    doctorId: consultation?.doctorId,
    participantId,
    name: participantName,
    specialization: consultation?.specialization || 'Tư vấn trực tuyến',
    topic: consultation?.topic || '',
    status: consultation?.status || 'PENDING',
    unreadCount: Number(consultation?.unreadCount ?? 0),
    lastMessagePreview:
      consultation?.latestMessagePreview || consultation?.latestMessage?.content || '',
    lastMessageTime:
      consultation?.latestMessageTime ||
      consultation?.latestMessage?.sentAt ||
      consultation?.updatedAt ||
      consultation?.createdAt ||
      null,
  }
}

const normalizeMessage = (message) => ({
  id: String(message?.id ?? `${message?.senderId ?? 'unknown'}-${message?.sentAt ?? Date.now()}`),
  senderId: String(message?.senderId ?? ''),
  content: message?.content || '',
  timestamp: message?.sentAt || message?.timestamp || new Date().toISOString(),
})

const Messages = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [conversationError, setConversationError] = useState('')
  const [messageError, setMessageError] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (user?.id) {
      fetchConversations()
    }
  }, [user?.id])

  useEffect(() => {
    if (activeChat?.consultationId) {
      fetchMessages(activeChat.consultationId)
    } else {
      setMessages([])
      setMessageError('')
    }
  }, [activeChat?.consultationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async (preferredConsultationId) => {
    setIsLoadingConversations(true)
    setConversationError('')

    try {
      const response =
        user.role === 'DOCTOR'
          ? await consultationApi.getConsultationsByDoctor(user.id, 0, 50)
          : await consultationApi.getConsultationsByPatient(user.id, 0, 50)
      const nextConversations = (response?.content || response || [])
        .map((consultation) => normalizeConversation(consultation, user.role))
        .sort((left, right) => {
          const leftTime = left.lastMessageTime ? new Date(left.lastMessageTime).getTime() : 0
          const rightTime = right.lastMessageTime ? new Date(right.lastMessageTime).getTime() : 0
          return rightTime - leftTime
        })

      setConversations(nextConversations)

      if (nextConversations.length === 0) {
        setActiveChat(null)
        return
      }

      const selectedConversation =
        nextConversations.find(
          (conversation) =>
            String(conversation.consultationId) ===
            String(preferredConsultationId ?? activeChat?.consultationId ?? '')
        ) || nextConversations[0]

      setActiveChat(selectedConversation)
    } catch (error) {
      const message = extractApiErrorMessage(error, 'Không thể tải danh sách tư vấn')
      setConversationError(message)
      setConversations([])
      setActiveChat(null)
      showToast({ type: 'error', message })
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const fetchMessages = async (consultationId) => {
    setIsLoadingMessages(true)
    setMessageError('')

    try {
      const response = await consultationApi.getMessages(Number(consultationId))
      const nextMessages = Array.isArray(response) ? response.map(normalizeMessage) : []
      setMessages(nextMessages)

      if (nextMessages.length > 0) {
        consultationApi.markMessagesAsRead(Number(consultationId)).catch(() => {})
      }
    } catch (error) {
      const message = extractApiErrorMessage(error, 'Không thể tải tin nhắn')
      setMessageError(message)
      setMessages([])
      showToast({ type: 'error', message })
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    const trimmedMessage = newMessage.trim()
    if (!trimmedMessage || !activeChat) return

    if (!ACTIVE_CONSULTATION_STATUSES.has(activeChat.status)) {
      showToast({
        type: 'error',
        message: 'Chỉ có thể nhắn khi tư vấn đã được chấp nhận hoặc đang diễn ra',
      })
      return
    }

    setIsSending(true)
    try {
      const sentMessage = await consultationApi.sendMessage({
        consultationId: Number(activeChat.consultationId),
        type: 'TEXT',
        content: trimmedMessage,
      })

      if (sentMessage?.id) {
        const normalizedMessage = normalizeMessage(sentMessage)
        setMessages((currentMessages) => [...currentMessages, normalizedMessage])
      } else {
        await fetchMessages(activeChat.consultationId)
      }

      const sentAt = sentMessage?.sentAt || new Date().toISOString()
      setConversations((currentConversations) =>
        currentConversations
          .map((conversation) =>
            conversation.consultationId === activeChat.consultationId
              ? {
                  ...conversation,
                  lastMessagePreview: trimmedMessage,
                  lastMessageTime: sentAt,
                }
              : conversation
          )
          .sort((left, right) => {
            const leftTime = left.lastMessageTime ? new Date(left.lastMessageTime).getTime() : 0
            const rightTime = right.lastMessageTime ? new Date(right.lastMessageTime).getTime() : 0
            return rightTime - leftTime
          })
      )

      setActiveChat((currentChat) =>
        currentChat
          ? {
              ...currentChat,
              lastMessagePreview: trimmedMessage,
              lastMessageTime: sentAt,
            }
          : currentChat
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

  const filteredConversations = conversations.filter((conversation) => {
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) return true

    return [conversation.name, conversation.specialization, conversation.topic]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword))
  })

  const canSendMessage = activeChat && ACTIVE_CONSULTATION_STATUSES.has(activeChat.status)

  return (
    <div className="h-[calc(100vh-12rem)]">
      <Card className="h-full">
        <div className="flex h-full">
          <div className="w-full lg:w-80 border-r border-sage-200 flex flex-col">
            <div className="p-4 border-b border-sage-200">
              <h2 className="text-lg font-semibold text-sage-900 mb-3">
                {vi.chat.title}
              </h2>
              <Input
                type="text"
                placeholder={vi.chat.search}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingConversations ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-20 rounded-2xl bg-sage-50 animate-pulse" />
                  ))}
                </div>
              ) : conversationError ? (
                <div className="p-4 text-sm text-sage-600 space-y-3">
                  <p>{conversationError}</p>
                  <Button variant="outline" size="sm" onClick={() => fetchConversations()}>
                    Tải lại
                  </Button>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-sm text-sage-500">
                  {conversations.length === 0
                    ? 'Bạn chưa có cuộc tư vấn nào để nhắn tin.'
                    : 'Không tìm thấy cuộc trò chuyện phù hợp.'}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <motion.button
                    key={conversation.consultationId}
                    type="button"
                    onClick={() => setActiveChat(conversation)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-sage-50 transition-colors ${
                      activeChat?.consultationId === conversation.consultationId ? 'bg-sage-100' : ''
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="relative">
                      <Avatar
                        src={`https://i.pravatar.cc/150?u=${conversation.participantId ?? conversation.consultationId}`}
                        alt={conversation.name}
                      />
                      <Circle
                        className={`w-3 h-3 absolute bottom-0 right-0 ${
                          ACTIVE_CONSULTATION_STATUSES.has(conversation.status)
                            ? 'fill-green-500 text-green-500'
                            : 'fill-gray-400 text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sage-900 truncate">{conversation.name}</p>
                        {conversation.lastMessageTime ? (
                          <span className="text-xs text-sage-500 shrink-0">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-sage-600 truncate">
                        {conversation.lastMessagePreview || conversation.topic || conversation.specialization}
                      </p>
                      {conversation.specialization ? (
                        <p className="text-xs text-sage-500 truncate mt-1">
                          {conversation.specialization}
                        </p>
                      ) : null}
                      {conversation.unreadCount > 0 ? (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-sage-600 text-white rounded-full">
                          {conversation.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>

          {activeChat ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-sage-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={`https://i.pravatar.cc/150?u=${activeChat.participantId ?? activeChat.consultationId}`}
                    alt={activeChat.name}
                  />
                  <div>
                    <h3 className="font-semibold text-sage-900">{activeChat.name}</h3>
                    <p className="text-sm text-sage-600">{activeChat.topic || activeChat.specialization}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" disabled>
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" disabled>
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="px-4 py-2 border-b border-sage-100 text-xs text-sage-500">
                Trạng thái tư vấn: {activeChat.status}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-16 rounded-2xl bg-sage-50 animate-pulse" />
                    ))}
                  </div>
                ) : messageError ? (
                  <div className="text-center py-12 text-sage-600 space-y-3">
                    <p>{messageError}</p>
                    <Button variant="outline" size="sm" onClick={() => fetchMessages(activeChat.consultationId)}>
                      Tải lại tin nhắn
                    </Button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-sage-500">
                    Chưa có tin nhắn nào trong cuộc tư vấn này.
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = String(message.senderId) === String(user.id)

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                          {!isOwn ? (
                            <Avatar
                              src={`https://i.pravatar.cc/150?u=${activeChat.participantId ?? activeChat.consultationId}`}
                              size="sm"
                            />
                          ) : null}
                          <div>
                            <div
                              className={`p-3 rounded-2xl ${
                                isOwn
                                  ? 'bg-sage-600 text-white rounded-br-none'
                                  : 'bg-sage-100 text-sage-900 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className={`text-xs text-sage-500 mt-1 ${isOwn ? 'text-right' : ''}`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-sage-200 space-y-2">
                {!canSendMessage ? (
                  <p className="text-xs text-amber-700">
                    Chỉ có thể nhắn khi tư vấn đã được chấp nhận hoặc đang diễn ra.
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={vi.chat.typeMessage}
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleSendMessage()
                      }
                    }}
                    className="flex-1"
                    disabled={!canSendMessage || isSending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !canSendMessage || isSending}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sage-500 px-6 text-center">
              Chọn một cuộc tư vấn để xem tin nhắn thật từ backend.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Messages
