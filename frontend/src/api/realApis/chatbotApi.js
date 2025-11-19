import { createApiClient } from '../core/createApiClient'

const apiClient = createApiClient()

export const chatbotApi = {
  chat: async (message, options = {}) => {
    const payload = {
      message,
      ...(options.userRole ? { userRole: options.userRole } : {}),
    }

    const response = await apiClient.post('/api/chatbot/chat', payload)
    return response.data
  },

  classify: async (question, options = {}) => {
    const payload = {
      question,
      ...(options.userRole ? { userRole: options.userRole } : {}),
    }

    const response = await apiClient.post('/api/chatbot/classify', payload)
    return response.data
  },

  getIntents: async () => {
    const response = await apiClient.get('/api/chatbot/intents')
    return response.data
  },
}

export default chatbotApi
