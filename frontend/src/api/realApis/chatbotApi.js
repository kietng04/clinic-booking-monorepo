import { createApiClient } from '../core/createApiClient'

const apiClient = createApiClient()

export const chatbotApi = {
  chat: async (message, options = {}) => {
    const response = await apiClient.post('/api/chatbot/chat', {
      message,
      sessionId: options.sessionId,
    })
    return response.data
  },

  classify: async (question) => {
    const response = await apiClient.post('/api/chatbot/classify', { question })
    return response.data
  },

  getIntents: async () => {
    const response = await apiClient.get('/api/chatbot/intents')
    return response.data
  },

  createSession: async (title) => {
    const response = await apiClient.post('/api/chatbot/sessions', { title })
    return response.data
  },

  getSessions: async () => {
    const response = await apiClient.get('/api/chatbot/sessions')
    return response.data
  },

  getSessionMessages: async (sessionId) => {
    const response = await apiClient.get(`/api/chatbot/sessions/${sessionId}/messages`)
    return response.data
  },
}

export default chatbotApi
