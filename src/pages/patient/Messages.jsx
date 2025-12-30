import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Send, Video, MoreVertical, Circle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { messageApi } from '@/api/mockApi'
import { formatTime } from '@/lib/utils'
import { vi } from '@/lib/translations'

const Messages = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id)
    }
  }, [activeChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    try {
      const data = await messageApi.getConversations(user.id)
      setConversations(data)
      if (data.length > 0 && !activeChat) {
        setActiveChat(data[0])
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải tin nhắn' })
    }
  }

  const fetchMessages = async (doctorId) => {
    try {
      const data = await messageApi.getMessages(user.id, doctorId)
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      await messageApi.sendMessage({
        from: user.id,
        to: activeChat.id,
        content: newMessage,
      })

      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          senderId: user.id,
          content: newMessage,
          timestamp: new Date().toISOString(),
        },
      ])

      setNewMessage('')

      // Simulate doctor reply after 2 seconds
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            senderId: activeChat.id,
            content: 'Cảm ơn bạn đã nhắn tin. Tôi sẽ phản hồi sớm nhất có thể.',
            timestamp: new Date().toISOString(),
          },
        ])
      }, 2000)
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể gửi tin nhắn' })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-12rem)]">
      <Card className="h-full">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-full lg:w-80 border-r border-sage-200 flex flex-col">
            <div className="p-4 border-b border-sage-200">
              <h2 className="text-lg font-semibold text-sage-900 mb-3">
                {vi.chat.title}
              </h2>
              <Input
                type="text"
                placeholder={vi.chat.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <motion.button
                  key={conv.id}
                  onClick={() => setActiveChat(conv)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-sage-50 transition-colors ${
                    activeChat?.id === conv.id ? 'bg-sage-100' : ''
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div className="relative">
                    <Avatar
                      src={conv.avatar || `https://i.pravatar.cc/150?u=${conv.id}`}
                      alt={conv.name}
                    />
                    <Circle
                      className={`w-3 h-3 absolute bottom-0 right-0 ${
                        conv.online ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sage-900">{conv.name}</p>
                      {conv.lastMessage && (
                        <span className="text-xs text-sage-500">
                          {formatTime(conv.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-sage-600 truncate">
                      {conv.specialization}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-sage-600 text-white rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          {activeChat ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-sage-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={activeChat.avatar || `https://i.pravatar.cc/150?u=${activeChat.id}`}
                    alt={activeChat.name}
                  />
                  <div>
                    <h3 className="font-semibold text-sage-900">{activeChat.name}</h3>
                    <p className="text-sm text-sage-600">{activeChat.specialization}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === user.id

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                        {!isOwn && (
                          <Avatar
                            src={activeChat.avatar || `https://i.pravatar.cc/150?u=${activeChat.id}`}
                            size="sm"
                          />
                        )}
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
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-sage-200">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={vi.chat.typeMessage}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sage-500">
              Chọn một cuộc trò chuyện để bắt đầu
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Messages
