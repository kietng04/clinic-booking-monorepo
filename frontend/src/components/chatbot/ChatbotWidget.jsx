import { useEffect, useState } from 'react'
import { Bot, Loader2, MessageCircle, Send, User, X } from 'lucide-react'
import { chatbotApi } from '@/api/chatbotApiWrapper'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

const buildWelcomeMessage = (name) => ({
  id: 'welcome',
  role: 'assistant',
  text: `Xin chao ${name || 'ban'}, toi la tro ly AI cua HealthFlow. Ban can ho tro gi?`,
  sources: [],
})

const sessionStorageKey = (userId) => `chatbot-session-${userId || 'anonymous'}`

export function ChatbotWidget() {
  const { isAuthenticated, user } = useAuthStore()
  const { showToast } = useUIStore()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [initializing, setInitializing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState(() => [buildWelcomeMessage(user?.name)])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setSessionId(null)
      setMessages([buildWelcomeMessage(user?.name)])
      return
    }

    let cancelled = false

    const initSession = async () => {
      setInitializing(true)
      try {
        const storedSessionId = localStorage.getItem(sessionStorageKey(user.id))
        const sessions = await chatbotApi.getSessions()
        let selectedSession = sessions.find((session) => session.id === storedSessionId) || sessions[0]

        if (!selectedSession) {
          selectedSession = await chatbotApi.createSession(`Chat voi ${user.name || 'HealthFlow AI'}`)
        }

        if (cancelled) return

        localStorage.setItem(sessionStorageKey(user.id), selectedSession.id)
        setSessionId(selectedSession.id)

        const history = await chatbotApi.getSessionMessages(selectedSession.id)
        if (cancelled) return

        if (Array.isArray(history) && history.length > 0) {
          setMessages(history.map((message) => ({
            id: message.id,
            role: message.role,
            text: message.text,
            sources: message.sources || [],
            meta: message.answerProvider || 'UNKNOWN',
          })))
        } else {
          setMessages([buildWelcomeMessage(user?.name)])
        }
      } catch (error) {
        if (!cancelled) {
          setSessionId(null)
          setMessages([buildWelcomeMessage(user?.name)])
        }
      } finally {
        if (!cancelled) {
          setInitializing(false)
        }
      }
    }

    initSession()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user?.id, user?.name])

  const disabled = !input.trim() || loading

  if (!isAuthenticated) {
    return null
  }

  const sendMessage = async () => {
    const content = input.trim()
    if (!content || loading) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: content,
      sources: [],
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      let activeSessionId = sessionId
      if (!activeSessionId) {
        const session = await chatbotApi.createSession(`Chat voi ${user?.name || 'HealthFlow AI'}`)
        activeSessionId = session.id
        setSessionId(activeSessionId)
        if (user?.id) {
          localStorage.setItem(sessionStorageKey(user.id), activeSessionId)
        }
      }

      const response = await chatbotApi.chat(content, { sessionId: activeSessionId })

      if (response.sessionId && response.sessionId !== activeSessionId) {
        activeSessionId = response.sessionId
        setSessionId(activeSessionId)
        if (user?.id) {
          localStorage.setItem(sessionStorageKey(user.id), activeSessionId)
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.answer || 'Toi khong co cau tra loi phu hop ngay luc nay.',
          sources: response.sources || [],
          meta: response.answerProvider || 'UNKNOWN',
        },
      ])
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Chatbot dang ban, vui long thu lai.'
      showToast({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-sage-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-sage-900 px-4 py-3 text-cream-50">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">HealthFlow AI</p>
                <p className="text-xs text-cream-200">Hybrid classify + RAG</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded p-1 text-cream-100 hover:bg-sage-800"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto bg-cream-50 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'bg-sage-700 text-cream-50'
                      : 'border border-sage-200 bg-white text-sage-900'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-1 text-xs opacity-75">
                    {message.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    <span>{message.role === 'user' ? 'Ban' : 'AI'}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {Array.isArray(message.sources) && message.sources.length > 0 && (
                    <p className="mt-2 text-xs opacity-70">
                      Nguon: {message.sources.map((source) => source.title).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-xl border border-sage-200 bg-white px-3 py-2 text-xs text-sage-600">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Dang phan tich va retrieve du lieu...
                </div>
              </div>
            )}
            {initializing && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-xl border border-sage-200 bg-white px-3 py-2 text-xs text-sage-600">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Dang tai lich su tro chuyen...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-sage-200 bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Nhap cau hoi ve lich kham, gia dich vu, gio mo cua..."
                className="flex-1 rounded-xl border border-sage-300 px-3 py-2 text-sm outline-none focus:border-sage-500"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={disabled}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sage-700 text-cream-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage-700 text-cream-50 shadow-xl transition hover:scale-105"
        aria-label="Open chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  )
}

export default ChatbotWidget
