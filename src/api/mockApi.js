import {
  mockUsers,
  mockAppointments,
  mockDoctorSchedules,
  mockMedicalRecords,
  mockPrescriptions,
  mockMedications,
  mockHealthMetrics,
  mockFamilyMembers,
  mockMessages,
  mockNotifications,
  mockConsultations,
  mockAIAnalyses,
  mockStats,
} from './mockData'

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock local storage for persistence
let users = [...mockUsers]
let appointments = [...mockAppointments]
let doctorSchedules = [...mockDoctorSchedules]
let medicalRecords = [...mockMedicalRecords]
let prescriptions = [...mockPrescriptions]
let medications = [...mockMedications]
let healthMetrics = [...mockHealthMetrics]
let familyMembers = [...mockFamilyMembers]
let messages = [...mockMessages]
let notifications = [...mockNotifications]
let consultations = [...mockConsultations]
let aiAnalyses = [...mockAIAnalyses]

// Auth API
export const authApi = {
  login: async (credentials) => {
    await delay(800)
    // Support both object format { email, password } and separate parameters
    const email = typeof credentials === 'string' ? credentials : credentials?.email
    const password = typeof credentials === 'string' ? arguments[1] : credentials?.password

    const user = users.find(u => u.email === email)

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Mock JWT token
    const token = btoa(JSON.stringify({ userId: user.id, role: user.role }))

    return {
      user: {
        userId: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role,
        avatar: user.avatar,
        emailVerified: true,
        phoneVerified: true,
      },
      token,
      refreshToken: 'mock-refresh-token',
    }
  },

  register: async (userData) => {
    await delay(1000)

    const existingUser = users.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('Email already exists')
    }

    const newUser = {
      id: String(users.length + 1),
      ...userData,
      avatar: `https://i.pravatar.cc/150?img=${users.length + 1}`,
    }

    users.push(newUser)

    const token = btoa(JSON.stringify({ userId: newUser.id, role: newUser.role }))

    return {
      user: newUser,
      token,
      refreshToken: 'mock-refresh-token',
    }
  },

  logout: async () => {
    await delay(300)
    return { success: true }
  },

  refreshToken: async (refreshToken) => {
    await delay(500)
    return {
      token: 'new-mock-token',
      refreshToken: 'new-mock-refresh-token',
    }
  },
}

// User API
export const userApi = {
  getProfile: async (userId) => {
    await delay(400)
    const user = users.find(u => u.id === userId)
    if (!user) throw new Error('User not found')
    return user
  },

  updateProfile: async (userId, updates) => {
    await delay(600)
    const index = users.findIndex(u => u.id === userId)
    if (index === -1) throw new Error('User not found')

    users[index] = { ...users[index], ...updates }
    return users[index]
  },

  getAllUsers: async (filters = {}) => {
    await delay(500)
    let filtered = [...users]

    if (filters.role) {
      filtered = filtered.filter(u => u.role === filters.role)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      )
    }

    return filtered
  },

  getDoctors: async (filters = {}) => {
    await delay(400)
    let doctors = users.filter(u => u.role === 'DOCTOR')

    if (filters.specialization) {
      doctors = doctors.filter(d => d.specialization === filters.specialization)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      doctors = doctors.filter(d =>
        d.name.toLowerCase().includes(search) ||
        d.specialization.toLowerCase().includes(search)
      )
    }

    return doctors
  },
}

// Appointment API
export const appointmentApi = {
  getAppointments: async (filters = {}) => {
    await delay(500)
    let filtered = [...appointments]

    if (filters.patientId) {
      filtered = filtered.filter(a => a.patientId === filters.patientId)
    }

    if (filters.doctorId) {
      filtered = filtered.filter(a => a.doctorId === filters.doctorId)
    }

    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status)
    }

    if (filters.date) {
      filtered = filtered.filter(a => a.date === filters.date)
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  getAppointment: async (id) => {
    await delay(400)
    const appointment = appointments.find(a => a.id === id)
    if (!appointment) throw new Error('Appointment not found')
    return appointment
  },

  createAppointment: async (appointmentData) => {
    await delay(800)

    const newAppointment = {
      id: String(appointments.length + 1),
      ...appointmentData,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }

    appointments.push(newAppointment)

    // Create notification
    notifications.push({
      id: String(notifications.length + 1),
      userId: appointmentData.doctorId,
      type: 'NEW_APPOINTMENT',
      title: 'New Appointment Request',
      message: `New appointment request from ${appointmentData.patientName}`,
      timestamp: new Date().toISOString(),
      read: false,
    })

    return newAppointment
  },

  updateAppointment: async (id, updates) => {
    await delay(600)
    const index = appointments.findIndex(a => a.id === id)
    if (index === -1) throw new Error('Appointment not found')

    appointments[index] = { ...appointments[index], ...updates }
    return appointments[index]
  },

  cancelAppointment: async (id) => {
    await delay(500)
    return appointmentApi.updateAppointment(id, { status: 'CANCELLED' })
  },

  confirmAppointment: async (id) => {
    await delay(500)
    return appointmentApi.updateAppointment(id, { status: 'CONFIRMED' })
  },

  completeAppointment: async (id) => {
    await delay(500)
    return appointmentApi.updateAppointment(id, { status: 'COMPLETED' })
  },
}

// Doctor Schedule API
export const scheduleApi = {
  getSchedule: async (doctorId, date) => {
    await delay(400)
    const schedule = doctorSchedules.find(
      s => s.doctorId === doctorId && s.date === date
    )
    return schedule || null
  },

  getSchedules: async (doctorId, startDate, endDate) => {
    await delay(500)
    return doctorSchedules.filter(s => s.doctorId === doctorId)
  },

  updateSchedule: async (doctorId, date, slots) => {
    await delay(600)
    const index = doctorSchedules.findIndex(
      s => s.doctorId === doctorId && s.date === date
    )

    if (index === -1) {
      const newSchedule = {
        id: String(doctorSchedules.length + 1),
        doctorId,
        date,
        slots,
      }
      doctorSchedules.push(newSchedule)
      return newSchedule
    }

    doctorSchedules[index].slots = slots
    return doctorSchedules[index]
  },
}

// Medical Record API
export const medicalRecordApi = {
  getRecords: async (patientId) => {
    await delay(500)
    return medicalRecords
      .filter(r => r.patientId === patientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  getRecord: async (id) => {
    await delay(400)
    const record = medicalRecords.find(r => r.id === id)
    if (!record) throw new Error('Record not found')
    return record
  },

  createRecord: async (recordData) => {
    await delay(800)
    const newRecord = {
      id: String(medicalRecords.length + 1),
      ...recordData,
      date: new Date().toISOString().split('T')[0],
    }
    medicalRecords.push(newRecord)
    return newRecord
  },
}

// Prescription API
export const prescriptionApi = {
  getPrescriptions: async (patientId) => {
    await delay(500)
    return prescriptions
      .filter(p => p.patientId === patientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  getPrescription: async (id) => {
    await delay(400)
    const prescription = prescriptions.find(p => p.id === id)
    if (!prescription) throw new Error('Prescription not found')
    return prescription
  },

  createPrescription: async (prescriptionData) => {
    await delay(800)
    const newPrescription = {
      id: String(prescriptions.length + 1),
      ...prescriptionData,
      date: new Date().toISOString().split('T')[0],
    }
    prescriptions.push(newPrescription)
    return newPrescription
  },
}

// Health Metrics API
export const healthMetricsApi = {
  getMetrics: async (patientId, filters = {}) => {
    await delay(400)
    let filtered = healthMetrics.filter(m => m.patientId === patientId)

    if (filters.type) {
      filtered = filtered.filter(m => m.type === filters.type)
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  getMetricsByPatient: async (patientId) => {
    await delay(400)
    return healthMetrics.filter(m => m.patientId === patientId).sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  logMetric: async (metricData) => {
    await delay(600)
    const newMetric = {
      id: String(healthMetrics.length + 1),
      ...metricData,
    }
    healthMetrics.push(newMetric)
    return newMetric
  },

  addMetric: async (metricData) => {
    await delay(600)
    const newMetric = {
      id: String(healthMetrics.length + 1),
      ...metricData,
      date: new Date().toISOString().split('T')[0],
    }
    healthMetrics.push(newMetric)
    return newMetric
  },
}

// Family Member API
export const familyMemberApi = {
  getMembers: async (userId) => {
    await delay(400)
    return familyMembers.filter(m => m.userId === userId)
  },

  addMember: async (memberData) => {
    await delay(600)
    const newMember = {
      id: String(familyMembers.length + 1),
      ...memberData,
      avatar: `https://i.pravatar.cc/150?img=${familyMembers.length + 20}`,
    }
    familyMembers.push(newMember)
    return newMember
  },

  updateMember: async (id, updates) => {
    await delay(500)
    const index = familyMembers.findIndex(m => m.id === id)
    if (index === -1) throw new Error('Member not found')
    familyMembers[index] = { ...familyMembers[index], ...updates }
    return familyMembers[index]
  },

  deleteMember: async (id) => {
    await delay(500)
    familyMembers = familyMembers.filter(m => m.id !== id)
    return { success: true }
  },
}

// Message API
export const messageApi = {
  getConversations: async (userId) => {
    await delay(400)
    const relatedMessages = messages.filter(
      m => m.senderId === userId || m.receiverId === userId
    )

    const conversationMap = new Map()
    relatedMessages.forEach((message) => {
      const otherId = message.senderId === userId ? message.receiverId : message.senderId
      const existing = conversationMap.get(otherId)
      const messageTime = new Date(message.timestamp).getTime()

      if (!existing || messageTime > existing.lastMessageTime) {
        conversationMap.set(otherId, {
          id: otherId,
          name: message.senderId === userId ? message.receiverName : message.senderName,
          specialization: '',
          lastMessage: message,
          lastMessageTime: messageTime,
          unreadCount: 0,
          online: false,
        })
      }
    })

    return Array.from(conversationMap.values()).sort(
      (a, b) => b.lastMessageTime - a.lastMessageTime
    )
  },

  getConversation: async (userId1, userId2) => {
    await delay(400)
    return messages
      .filter(m =>
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  },

  getMessages: async (userId, otherUserId) => {
    return messageApi.getConversation(userId, otherUserId)
  },

  sendMessage: async (messageData) => {
    await delay(300)
    const senderId = messageData.senderId || messageData.from
    const receiverId = messageData.receiverId || messageData.to
    const senderProfile = users.find(u => u.id === senderId)
    const receiverProfile = users.find(u => u.id === receiverId)

    const newMessage = {
      id: String(messages.length + 1),
      senderId,
      senderName: messageData.senderName || senderProfile?.name || `User ${senderId}`,
      receiverId,
      receiverName: messageData.receiverName || receiverProfile?.name || `User ${receiverId}`,
      content: messageData.content,
      timestamp: new Date().toISOString(),
      read: false,
    }
    messages.push(newMessage)

    notifications.push({
      id: String(notifications.length + 1),
      userId: receiverId,
      type: 'MESSAGE_RECEIVED',
      title: 'New Message',
      message: `You have a new message from ${newMessage.senderName}`,
      timestamp: new Date().toISOString(),
      read: false,
    })

    return newMessage
  },

  markAsRead: async (messageId) => {
    await delay(200)
    const index = messages.findIndex(m => m.id === messageId)
    if (index !== -1) {
      messages[index].read = true
    }
    return { success: true }
  },
}

// Notification API
export const notificationApi = {
  getNotifications: async (userId) => {
    await delay(400)
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  },

  markAsRead: async (notificationId) => {
    await delay(200)
    const index = notifications.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      notifications[index].read = true
    }
    return { success: true }
  },

  markAllAsRead: async (userId) => {
    await delay(300)
    notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true
      }
    })
    return { success: true }
  },
}

// Statistics API
export const statsApi = {
  getPatientStats: async (patientId) => {
    await delay(400)
    return mockStats.patient
  },

  getDoctorStats: async (doctorId) => {
    await delay(400)
    return mockStats.doctor
  },

  getAdminStats: async () => {
    await delay(500)
    return mockStats.admin
  },
}

// AI Analysis API
export const aiApi = {
  getAnalyses: async (patientId) => {
    await delay(600)
    return aiAnalyses.filter(a => a.patientId === patientId)
  },

  generateAnalysis: async (patientId, type) => {
    await delay(1200) // Simulate AI processing
    const newAnalysis = {
      id: String(aiAnalyses.length + 1),
      patientId,
      type,
      date: new Date().toISOString().split('T')[0],
      insights: [
        'Analysis generated successfully',
        'Please consult with your doctor for detailed interpretation',
      ],
      recommendations: [
        'Continue monitoring your health metrics',
        'Schedule a follow-up appointment if needed',
      ],
      riskLevel: 'LOW',
    }
    aiAnalyses.push(newAnalysis)
    return newAnalysis
  },
}

// Consultation API
export const consultationApi = {
  getConsultations: async (userId, role) => {
    await delay(400)
    if (role === 'DOCTOR') {
      return consultations.filter(c => c.doctorId === userId)
    }
    return consultations.filter(c => c.patientId === userId)
  },

  getConsultation: async (id) => {
    await delay(300)
    const consultation = consultations.find(c => c.id === id)
    if (!consultation) throw new Error('Consultation not found')
    return consultation
  },

  startConsultation: async (consultationId) => {
    await delay(500)
    const index = consultations.findIndex(c => c.id === consultationId)
    if (index === -1) throw new Error('Consultation not found')
    consultations[index].status = 'IN_PROGRESS'
    return consultations[index]
  },

  endConsultation: async (consultationId) => {
    await delay(500)
    const index = consultations.findIndex(c => c.id === consultationId)
    if (index === -1) throw new Error('Consultation not found')
    consultations[index].status = 'COMPLETED'
    return consultations[index]
  },
}
