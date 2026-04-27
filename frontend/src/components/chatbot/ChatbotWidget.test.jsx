import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import ChatbotWidget from './ChatbotWidget'

const {
  mockChat,
  mockShowToast,
  mockUseAuthStore,
} = vi.hoisted(() => ({
  mockChat: vi.fn(),
  mockShowToast: vi.fn(),
  mockUseAuthStore: vi.fn(),
}))

vi.mock('@/api/chatbotApiWrapper', () => ({
  chatbotApi: {
    chat: mockChat,
  },
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}))

vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    showToast: mockShowToast,
  }),
}))

describe('ChatbotWidget', () => {
  beforeEach(() => {
    mockChat.mockReset()
    mockShowToast.mockReset()
    mockUseAuthStore.mockReset()
    Element.prototype.scrollTo = vi.fn()
  })

  it('does not render for unauthenticated users', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
    })

    render(<ChatbotWidget />)

    expect(screen.queryByRole('button', { name: 'Open chatbot' })).not.toBeInTheDocument()
  })

  it('opens the widget and sends a message', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Kiet', role: 'doctor' },
    })
    mockChat.mockResolvedValue({
      answer: 'Lich kham con trong vao sang mai.',
      sources: [{ title: 'Lich bac si' }],
      answerProvider: 'RULES',
    })

    render(<ChatbotWidget />)

    await userEvent.click(screen.getByRole('button', { name: 'Open chatbot' }))
    expect(screen.getByText(/Xin chao Kiet/)).toBeInTheDocument()

    await userEvent.type(screen.getByPlaceholderText(/Nhập câu hỏi/), 'Con lich trong khong?')
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => {
      expect(mockChat).toHaveBeenCalledWith('Con lich trong khong?', { userRole: 'DOCTOR' })
    })

    expect(await screen.findByText('Lich kham con trong vao sang mai.')).toBeInTheDocument()
    expect(screen.getByText(/Nguon: Lich bac si/)).toBeInTheDocument()
  })
})
