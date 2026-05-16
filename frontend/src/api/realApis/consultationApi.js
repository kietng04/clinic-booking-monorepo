import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'
import { API_BASE_URL, createApiClient } from '../core/createApiClient'

/**
 * Consultation API - Real backend integration
 * Provides online consultation and real-time messaging endpoints
 */

const consultationServiceClient = createApiClient()

export const consultationApi = {
  // ==================== CONSULTATION ENDPOINTS ====================

  /**
   * Create a new consultation request
   * @param {Object} data - Consultation request data
   * @returns {Promise} Created consultation
   */
  createConsultation: async (data) => {
    const response = await consultationServiceClient.post('/api/consultations', data)
    return response.data
  },

  /**
   * Get consultation by ID
   * @param {number} consultationId - Consultation ID
   * @returns {Promise} Consultation details
   */
  getConsultationById: async (consultationId) => {
    const response = await consultationServiceClient.get(`/api/consultations/${consultationId}`)
    return response.data
  },

  /**
   * Get consultations for a patient
   * @param {number} patientId - Patient ID
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Page size (default: 20)
   * @returns {Promise} Paginated consultations
   */
  getConsultationsByPatient: async (patientId, page = 0, size = 20) => {
    const response = await consultationServiceClient.get(
      `/api/consultations/patient/${patientId}`,
      { params: { page, size } }
    )
    return response.data
  },

  /**
   * Get consultations for a doctor
   * @param {number} doctorId - Doctor ID
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Page size (default: 20)
   * @returns {Promise} Paginated consultations
   */
  getConsultationsByDoctor: async (doctorId, page = 0, size = 20) => {
    const response = await consultationServiceClient.get(
      `/api/consultations/doctor/${doctorId}`,
      { params: { page, size } }
    )
    return response.data
  },

  /**
   * Get pending consultations for a doctor
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} List of pending consultations
   */
  getPendingConsultations: async (doctorId) => {
    const response = await consultationServiceClient.get(
      `/api/consultations/doctor/${doctorId}/pending`
    )
    return response.data
  },

  /**
   * Get active consultations for a doctor
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} List of active consultations
   */
  getActiveConsultationsForDoctor: async (doctorId) => {
    const response = await consultationServiceClient.get(
      `/api/consultations/doctor/${doctorId}/active`
    )
    return response.data
  },

  /**
   * Get active consultations for a patient
   * @param {number} patientId - Patient ID
   * @returns {Promise} List of active consultations
   */
  getActiveConsultationsForPatient: async (patientId) => {
    const response = await consultationServiceClient.get(
      `/api/consultations/patient/${patientId}/active`
    )
    return response.data
  },

  /**
   * Doctor accepts a consultation request
   * @param {number} consultationId - Consultation ID
   * @returns {Promise} Updated consultation
   */
  acceptConsultation: async (consultationId) => {
    const response = await consultationServiceClient.put(
      `/api/consultations/${consultationId}/accept`
    )
    return response.data
  },

  /**
   * Doctor rejects a consultation request
   * @param {number} consultationId - Consultation ID
   * @param {string} reason - Rejection reason
   * @returns {Promise} Updated consultation
   */
  rejectConsultation: async (consultationId, reason) => {
    const response = await consultationServiceClient.put(
      `/api/consultations/${consultationId}/reject`,
      { reason }
    )
    return response.data
  },

  /**
   * Doctor completes a consultation
   * @param {number} consultationId - Consultation ID
   * @param {Object} data - Completion data (doctorNotes, diagnosis, prescription)
   * @returns {Promise} Updated consultation
   */
  completeConsultation: async (consultationId, data) => {
    const response = await consultationServiceClient.put(
      `/api/consultations/${consultationId}/complete`,
      data
    )
    return response.data
  },

  /**
   * Patient cancels a consultation
   * @param {number} consultationId - Consultation ID
   * @returns {Promise} Updated consultation
   */
  cancelConsultation: async (consultationId) => {
    const response = await consultationServiceClient.delete(
      `/api/consultations/${consultationId}`
    )
    return response.data
  },

  /**
   * Patient cancels a consultation draft waiting for payment.
   * @param {number} consultationId
   * @returns {Promise} Updated consultation
   */
  cancelDraftConsultation: async (consultationId) => {
    const response = await consultationServiceClient.delete(
      `/api/consultations/${consultationId}/draft`
    )
    return response.data
  },

  /**
   * Get total unread consultation count
   * @returns {Promise} Unread count
   */
  getTotalUnreadCount: async () => {
    const response = await consultationServiceClient.get('/api/consultations/unread-count')
    return response.data
  },

  // ==================== MESSAGE ENDPOINTS ====================

  /**
   * Send a message in a consultation
   * @param {Object} data - Message data
   * @returns {Promise} Sent message
   */
  sendMessage: async (data) => {
    const response = await consultationServiceClient.post('/api/messages', data)
    return response.data
  },

  /**
   * Get all messages for a consultation
   * @param {number} consultationId - Consultation ID
   * @returns {Promise} List of messages
   */
  getMessages: async (consultationId) => {
    const response = await consultationServiceClient.get(
      `/api/messages/consultation/${consultationId}`
    )
    return response.data
  },

  /**
   * Get messages with pagination
   * @param {number} consultationId - Consultation ID
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} Paginated messages
   */
  getMessagesPaginated: async (consultationId, page = 0, size = 50) => {
    const response = await consultationServiceClient.get(
      `/api/messages/consultation/${consultationId}/paginated`,
      { params: { page, size } }
    )
    return response.data
  },

  /**
   * Get unread messages for a consultation
   * @param {number} consultationId - Consultation ID
   * @returns {Promise} List of unread messages
   */
  getUnreadMessages: async (consultationId) => {
    const response = await consultationServiceClient.get(
      `/api/messages/consultation/${consultationId}/unread`
    )
    return response.data
  },

  /**
   * Mark messages as read
   * @param {number} consultationId - Consultation ID
   * @returns {Promise}
   */
  markMessagesAsRead: async (consultationId) => {
    const response = await consultationServiceClient.put(
      `/api/messages/consultation/${consultationId}/read`
    )
    return response.data
  },

  /**
   * Count unread messages for a consultation
   * @param {number} consultationId - Consultation ID
   * @returns {Promise} Unread count
   */
  countUnreadMessages: async (consultationId) => {
    const response = await consultationServiceClient.get(
      `/api/messages/consultation/${consultationId}/unread-count`
    )
    return response.data
  },

  /**
   * Delete a message
   * @param {number} messageId - Message ID
   * @returns {Promise}
   */
  deleteMessage: async (messageId) => {
    const response = await consultationServiceClient.delete(`/api/messages/${messageId}`)
    return response.data
  },
}

// ==================== WEBSOCKET CONNECTION ====================

/**
 * WebSocket connection manager for real-time chat
 */
class WebSocketManager {
  constructor() {
    this.stompClient = null
    this.subscriptions = new Map()
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
  }

  /**
   * Connect to WebSocket server
   */
  connect(onConnected, onError) {
    const token = localStorage.getItem('accessToken')
    const socket = new SockJS(`${API_BASE_URL}/ws`)
    this.stompClient = Stomp.over(socket)

    // Disable debug logging
    this.stompClient.debug = () => {}

    // Connect with JWT token in headers
    this.stompClient.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log('WebSocket connected')
        this.connected = true
        this.reconnectAttempts = 0
        if (onConnected) onConnected()
      },
      (error) => {
        console.error('WebSocket connection error:', error)
        this.connected = false
        if (onError) onError(error)

        // Auto reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          setTimeout(() => {
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
            this.connect(onConnected, onError)
          }, this.reconnectDelay)
        }
      }
    )
  }

  /**
   * Subscribe to consultation messages
   */
  subscribeToConsultation(consultationId, onMessage) {
    if (!this.connected || !this.stompClient) {
      console.warn('WebSocket not connected')
      return null
    }

    // Prevent duplicate subscriptions for the same consultation topic.
    const existing = this.subscriptions.get(consultationId)
    if (existing) {
      existing.unsubscribe()
      this.subscriptions.delete(consultationId)
    }

    const topic = `/topic/consultation/${consultationId}`
    const subscription = this.stompClient.subscribe(topic, (message) => {
      const messageData = JSON.parse(message.body)
      if (onMessage) onMessage(messageData)
    })

    this.subscriptions.set(consultationId, subscription)
    console.log(`Subscribed to consultation ${consultationId}`)
    return subscription
  }

  /**
   * Subscribe to message read events
   */
  subscribeToReadEvents(consultationId, onRead) {
    if (!this.connected || !this.stompClient) {
      console.warn('WebSocket not connected')
      return null
    }

    const topic = `/topic/consultation/${consultationId}/read`
    const subscription = this.stompClient.subscribe(topic, (message) => {
      const readData = JSON.parse(message.body)
      if (onRead) onRead(readData)
    })

    const key = `${consultationId}-read`
    this.subscriptions.set(key, subscription)
    return subscription
  }

  /**
   * Unsubscribe from consultation
   */
  unsubscribeFromConsultation(consultationId) {
    const subscription = this.subscriptions.get(consultationId)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(consultationId)
      console.log(`Unsubscribed from consultation ${consultationId}`)
    }

    const readSubscription = this.subscriptions.get(`${consultationId}-read`)
    if (readSubscription) {
      readSubscription.unsubscribe()
      this.subscriptions.delete(`${consultationId}-read`)
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.stompClient && this.connected) {
      // Unsubscribe all
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe()
      })
      this.subscriptions.clear()

      this.stompClient.disconnect(() => {
        console.log('WebSocket disconnected')
      })
      this.connected = false
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager()

export default consultationApi
