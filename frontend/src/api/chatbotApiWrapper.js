import { chatbotApi as realChatbotApi } from './realApis/chatbotApi'
import { chatbotApi as mockChatbotApi } from './mockApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

export const chatbotApi = USE_MOCK_BACKEND ? mockChatbotApi : realChatbotApi

export default chatbotApi
