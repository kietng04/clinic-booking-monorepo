import { createApiClient } from '../core/createApiClient'

const apiClient = createApiClient()

export const chatbotApi = {
  chat: async (message) => {
    const response = await apiClient.post('/api/chatbot/chat', { message })
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
}

export default chatbotApi
