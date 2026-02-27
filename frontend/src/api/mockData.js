// Mock data for the clinic booking system

export const mockUsers = [
  {
    id: '1',
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@healthflow.com',
    phone: '+1234567890',
    role: 'DOCTOR',
    specialization: 'Cardiology',
    licenseNumber: 'MD-12345',
    rating: 4.8,
    consultationFee: 150,
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: 'Board-certified cardiologist with 15 years of experience in preventive cardiology and heart disease management.',
    yearsOfExperience: 15,
    education: 'MD from Harvard Medical School',
    languages: ['English', 'Spanish'],
  },
  {
    id: '2',
    name: 'Dr. James Chen',
    email: 'james.chen@healthflow.com',
    phone: '+1234567891',
    role: 'DOCTOR',
    specialization: 'Pediatrics',
    licenseNumber: 'MD-12346',
    rating: 4.9,
    consultationFee: 120,
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: 'Pediatrician specializing in childhood development and preventive care.',
    yearsOfExperience: 10,
    education: 'MD from Johns Hopkins University',
    languages: ['English', 'Mandarin'],
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@healthflow.com',
    phone: '+1234567892',
    role: 'DOCTOR',
    specialization: 'Dermatology',
    licenseNumber: 'MD-12347',
    rating: 4.7,
    consultationFee: 180,
    avatar: 'https://i.pravatar.cc/150?img=9',
    bio: 'Dermatologist with expertise in skin conditions, cosmetic procedures, and skin cancer screening.',
    yearsOfExperience: 12,
    education: 'MD from Stanford University',
    languages: ['English', 'Spanish'],
  },
  {
    id: '4',
    name: 'Dr. Michael Patel',
    email: 'michael.patel@healthflow.com',
    phone: '+1234567893',
    role: 'DOCTOR',
    specialization: 'Orthopedics',
    licenseNumber: 'MD-12348',
    rating: 4.6,
    consultationFee: 200,
    avatar: 'https://i.pravatar.cc/150?img=13',
    bio: 'Orthopedic surgeon specializing in sports medicine and joint replacement.',
    yearsOfExperience: 18,
    education: 'MD from Yale School of Medicine',
    languages: ['English', 'Hindi'],
  },
  {
    id: '5',
    name: 'John Anderson',
    email: 'john.anderson@email.com',
    phone: '+1234567894',
    role: 'PATIENT',
    avatar: 'https://i.pravatar.cc/150?img=33',
    dateOfBirth: '1985-03-15',
    bloodType: 'A+',
    allergies: ['Penicillin'],
    chronicDiseases: [],
  },
  {
    id: '6',
    name: 'Admin User',
    email: 'admin@healthflow.com',
    phone: '+1234567895',
    role: 'ADMIN',
    avatar: 'https://i.pravatar.cc/150?img=68',
  },
]

export const mockAppointments = [
  {
    id: '1',
    patientId: '5',
    patientName: 'John Anderson',
    doctorId: '1',
    doctorName: 'Dr. Sarah Mitchell',
    doctorSpecialization: 'Cardiology',
    date: '2025-01-15',
    time: '10:00',
    type: 'IN_PERSON',
    status: 'CONFIRMED',
    priority: 'NORMAL',
    reason: 'Regular checkup',
    notes: 'Patient has history of high blood pressure',
    createdAt: '2025-01-01T10:00:00Z',
  },
  {
    id: '2',
    patientId: '5',
    patientName: 'John Anderson',
    doctorId: '3',
    doctorName: 'Dr. Emily Rodriguez',
    doctorSpecialization: 'Dermatology',
    date: '2025-01-20',
    time: '14:30',
    type: 'ONLINE',
    status: 'PENDING',
    priority: 'NORMAL',
    reason: 'Skin rash consultation',
    notes: '',
    createdAt: '2025-01-02T14:00:00Z',
  },
  {
    id: '3',
    patientId: '5',
    patientName: 'John Anderson',
    doctorId: '1',
    doctorName: 'Dr. Sarah Mitchell',
    doctorSpecialization: 'Cardiology',
    date: '2024-12-28',
    time: '09:00',
    type: 'IN_PERSON',
    status: 'COMPLETED',
    priority: 'NORMAL',
    reason: 'Follow-up appointment',
    notes: 'Blood pressure stable',
    createdAt: '2024-12-15T10:00:00Z',
  },
]

export const mockDoctorSchedules = [
  {
    id: '1',
    doctorId: '1',
    date: '2025-01-15',
    slots: [
      { time: '09:00', available: true },
      { time: '10:00', available: false },
      { time: '11:00', available: true },
      { time: '14:00', available: true },
      { time: '15:00', available: true },
      { time: '16:00', available: true },
    ],
  },
  {
    id: '2',
    doctorId: '1',
    date: '2025-01-16',
    slots: [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: true },
      { time: '14:00', available: false },
      { time: '15:00', available: true },
      { time: '16:00', available: true },
    ],
  },
]

export const mockMedicalRecords = [
  {
    id: '1',
    patientId: '5',
    doctorId: '1',
    doctorName: 'Dr. Sarah Mitchell',
    appointmentId: '3',
    date: '2024-12-28',
    diagnosis: 'Hypertension - Stage 1',
    symptoms: ['High blood pressure', 'Occasional headaches'],
    treatment: 'Lifestyle modifications and medication',
    notes: 'Patient advised to monitor blood pressure daily. Follow up in 3 months.',
    vitalSigns: {
      bloodPressure: '138/88',
      heartRate: '78',
      temperature: '98.6',
      weight: '175',
    },
  },
  {
    id: '2',
    patientId: '5',
    doctorId: '1',
    doctorName: 'Dr. Sarah Mitchell',
    appointmentId: null,
    date: '2024-09-15',
    diagnosis: 'Annual Physical - Normal',
    symptoms: [],
    treatment: 'None required',
    notes: 'All vitals within normal range. Continue healthy lifestyle.',
    vitalSigns: {
      bloodPressure: '125/82',
      heartRate: '72',
      temperature: '98.4',
      weight: '178',
    },
  },
]

export const mockPrescriptions = [
  {
    id: '1',
    medicalRecordId: '1',
    patientId: '5',
    doctorId: '1',
    doctorName: 'Dr. Sarah Mitchell',
    date: '2024-12-28',
    medications: [
      {
        id: 'm1',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '3 months',
        instructions: 'Take in the morning with water',
      },
    ],
    notes: 'Take medication as prescribed. Monitor for side effects.',
    validUntil: '2025-03-28',
  },
]

export const mockMedications = [
  { id: 'm1', name: 'Lisinopril', category: 'Blood Pressure', description: 'ACE inhibitor' },
  { id: 'm2', name: 'Metformin', category: 'Diabetes', description: 'Blood sugar control' },
  { id: 'm3', name: 'Amoxicillin', category: 'Antibiotic', description: 'Bacterial infections' },
  { id: 'm4', name: 'Ibuprofen', category: 'Pain Relief', description: 'Anti-inflammatory' },
]

export const mockHealthMetrics = [
  {
    id: '1',
    patientId: '5',
    type: 'BLOOD_PRESSURE',
    value: '135/85',
    date: '2025-01-10',
    unit: 'mmHg',
    notes: 'Morning reading',
  },
  {
    id: '2',
    patientId: '5',
    type: 'HEART_RATE',
    value: '75',
    date: '2025-01-10',
    unit: 'bpm',
    notes: 'Resting heart rate',
  },
  {
    id: '3',
    patientId: '5',
    type: 'WEIGHT',
    value: '175',
    date: '2025-01-10',
    unit: 'lbs',
    notes: '',
  },
  {
    id: '4',
    patientId: '5',
    type: 'BLOOD_PRESSURE',
    value: '132/83',
    date: '2025-01-09',
    unit: 'mmHg',
    notes: 'Evening reading',
  },
]

export const mockFamilyMembers = [
  {
    id: '1',
    userId: '5',
    name: 'Emma Anderson',
    relationship: 'Daughter',
    dateOfBirth: '2015-06-20',
    bloodType: 'A+',
    allergies: [],
    chronicDiseases: [],
    avatar: 'https://i.pravatar.cc/150?img=25',
  },
  {
    id: '2',
    userId: '5',
    name: 'Mary Anderson',
    relationship: 'Wife',
    dateOfBirth: '1987-11-12',
    bloodType: 'O+',
    allergies: ['Latex'],
    chronicDiseases: ['Asthma'],
    avatar: 'https://i.pravatar.cc/150?img=45',
  },
]

export const mockMessages = [
  {
    id: '1',
    senderId: '5',
    senderName: 'John Anderson',
    receiverId: '1',
    receiverName: 'Dr. Sarah Mitchell',
    content: 'Hi Dr. Mitchell, I wanted to follow up on my last appointment.',
    timestamp: '2025-01-10T14:30:00Z',
    read: true,
  },
  {
    id: '2',
    senderId: '1',
    senderName: 'Dr. Sarah Mitchell',
    receiverId: '5',
    receiverName: 'John Anderson',
    content: 'Hello John, how have you been feeling? Are you taking your medication regularly?',
    timestamp: '2025-01-10T15:00:00Z',
    read: true,
  },
  {
    id: '3',
    senderId: '5',
    senderName: 'John Anderson',
    receiverId: '1',
    receiverName: 'Dr. Sarah Mitchell',
    content: 'Yes, taking it every morning as prescribed. Blood pressure has been stable around 130/82.',
    timestamp: '2025-01-10T15:15:00Z',
    read: false,
  },
]

export const mockNotifications = [
  {
    id: '1',
    userId: '5',
    type: 'APPOINTMENT_CONFIRMED',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. Sarah Mitchell on Jan 15, 2025 at 10:00 AM has been confirmed.',
    timestamp: '2025-01-01T11:00:00Z',
    read: false,
  },
  {
    id: '2',
    userId: '5',
    type: 'PRESCRIPTION_READY',
    title: 'Prescription Ready',
    message: 'Your prescription from Dr. Sarah Mitchell is ready for pickup.',
    timestamp: '2024-12-28T16:00:00Z',
    read: true,
  },
  {
    id: '3',
    userId: '5',
    type: 'MESSAGE_RECEIVED',
    title: 'New Message',
    message: 'You have a new message from Dr. Sarah Mitchell.',
    timestamp: '2025-01-10T15:00:00Z',
    read: false,
  },
]

export const mockConsultations = [
  {
    id: '1',
    appointmentId: '2',
    patientId: '5',
    patientName: 'John Anderson',
    doctorId: '3',
    doctorName: 'Dr. Emily Rodriguez',
    scheduledTime: '2025-01-20T14:30:00Z',
    status: 'SCHEDULED',
    type: 'VIDEO',
    roomId: 'room-abc123',
  },
]

export const mockAIAnalyses = [
  {
    id: '1',
    patientId: '5',
    type: 'BLOOD_PRESSURE_TREND',
    date: '2025-01-10',
    insights: [
      'Your blood pressure has improved by 5% over the last month',
      'Readings are consistently in the pre-hypertension range',
      'Morning readings tend to be higher than evening readings',
    ],
    recommendations: [
      'Continue taking prescribed medication',
      'Reduce sodium intake to less than 2000mg daily',
      'Aim for 30 minutes of moderate exercise 5 days a week',
    ],
    riskLevel: 'MODERATE',
  },
]

// Health Metrics History (for charts) - 30 days of data
export const mockHealthMetricsHistory = {
  BLOOD_PRESSURE: Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split('T')[0],
      systolic: 120 + Math.floor(Math.random() * 20),
      diastolic: 75 + Math.floor(Math.random() * 15),
    }
  }),
  HEART_RATE: Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split('T')[0],
      value: 65 + Math.floor(Math.random() * 20),
    }
  }),
  WEIGHT: Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split('T')[0],
      value: 175 - i * 0.2 + Math.random() * 2,
    }
  }),
  BLOOD_SUGAR: Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split('T')[0],
      value: 85 + Math.floor(Math.random() * 30),
    }
  }),
}

// Doctor Analytics Data
export const mockDoctorAnalytics = {
  appointments: [
    { month: 'Tháng 7', count: 45, revenue: 22500000, completed: 42 },
    { month: 'Tháng 8', count: 52, revenue: 26000000, completed: 50 },
    { month: 'Tháng 9', count: 48, revenue: 24000000, completed: 45 },
    { month: 'Tháng 10', count: 55, revenue: 27500000, completed: 52 },
    { month: 'Tháng 11', count: 60, revenue: 30000000, completed: 58 },
    { month: 'Tháng 12', count: 58, revenue: 29000000, completed: 55 },
  ],
  appointmentTypes: [
    { name: 'Trực tiếp', value: 65, count: 195 },
    { name: 'Trực tuyến', value: 35, count: 105 },
  ],
  timeSlots: [
    { time: '08:00', bookings: 12 },
    { time: '09:00', bookings: 18 },
    { time: '10:00', bookings: 22 },
    { time: '11:00', bookings: 20 },
    { time: '14:00', bookings: 25 },
    { time: '15:00', bookings: 20 },
    { time: '16:00', bookings: 15 },
    { time: '17:00', bookings: 10 },
  ],
  patientDemographics: {
    ageDistribution: [
      { range: '0-18', count: 25 },
      { range: '19-30', count: 40 },
      { range: '31-45', count: 55 },
      { range: '46-60', count: 35 },
      { range: '60+', count: 20 },
    ],
    genderRatio: [
      { name: 'Nam', value: 45 },
      { name: 'Nữ', value: 55 },
    ],
  },
}

// Admin Analytics Data
export const mockAdminAnalytics = {
  userGrowth: [
    { month: 'Tháng 1', patients: 120, doctors: 15, total: 135 },
    { month: 'Tháng 2', patients: 145, doctors: 18, total: 163 },
    { month: 'Tháng 3', patients: 168, doctors: 22, total: 190 },
    { month: 'Tháng 4', patients: 195, doctors: 25, total: 220 },
    { month: 'Tháng 5', patients: 225, doctors: 28, total: 253 },
    { month: 'Tháng 6', patients: 258, doctors: 32, total: 290 },
    { month: 'Tháng 7', patients: 290, doctors: 35, total: 325 },
    { month: 'Tháng 8', patients: 325, doctors: 38, total: 363 },
    { month: 'Tháng 9', patients: 358, doctors: 40, total: 398 },
    { month: 'Tháng 10', patients: 395, doctors: 42, total: 437 },
    { month: 'Tháng 11', patients: 430, doctors: 44, total: 474 },
    { month: 'Tháng 12', patients: 465, doctors: 45, total: 510 },
  ],
  revenue: [
    { month: 'Tháng 1', thisYear: 85000000, lastYear: 65000000 },
    { month: 'Tháng 2', thisYear: 92000000, lastYear: 70000000 },
    { month: 'Tháng 3', thisYear: 98000000, lastYear: 75000000 },
    { month: 'Tháng 4', thisYear: 105000000, lastYear: 82000000 },
    { month: 'Tháng 5', thisYear: 112000000, lastYear: 88000000 },
    { month: 'Tháng 6', thisYear: 120000000, lastYear: 95000000 },
    { month: 'Tháng 7', thisYear: 128000000, lastYear: 102000000 },
    { month: 'Tháng 8', thisYear: 135000000, lastYear: 108000000 },
    { month: 'Tháng 9', thisYear: 142000000, lastYear: 115000000 },
    { month: 'Tháng 10', thisYear: 150000000, lastYear: 122000000 },
    { month: 'Tháng 11', thisYear: 158000000, lastYear: 130000000 },
    { month: 'Tháng 12', thisYear: 165000000, lastYear: 138000000 },
  ],
  appointmentTrends: [
    { month: 'Tháng 1', total: 280, completed: 265, cancelled: 15 },
    { month: 'Tháng 2', total: 320, completed: 305, cancelled: 15 },
    { month: 'Tháng 3', total: 350, completed: 330, cancelled: 20 },
    { month: 'Tháng 4', total: 385, completed: 365, cancelled: 20 },
    { month: 'Tháng 5', total: 420, completed: 400, cancelled: 20 },
    { month: 'Tháng 6', total: 455, completed: 435, cancelled: 20 },
    { month: 'Tháng 7', total: 490, completed: 465, cancelled: 25 },
    { month: 'Tháng 8', total: 525, completed: 500, cancelled: 25 },
    { month: 'Tháng 9', total: 560, completed: 530, cancelled: 30 },
    { month: 'Tháng 10', total: 595, completed: 565, cancelled: 30 },
    { month: 'Tháng 11', total: 630, completed: 598, cancelled: 32 },
    { month: 'Tháng 12', total: 665, completed: 630, cancelled: 35 },
  ],
  appointmentStatus: [
    { name: 'Đã hoàn thành', value: 630, color: '#5d7a60' },
    { name: 'Đã xác nhận', value: 85, color: '#bfa094' },
    { name: 'Chờ xác nhận', value: 45, color: '#f4c430' },
    { name: 'Đã hủy', value: 35, color: '#dc2626' },
  ],
  specializationDistribution: [
    { specialization: 'Tim mạch', count: 8, percentage: 18 },
    { specialization: 'Nhi khoa', count: 7, percentage: 16 },
    { specialization: 'Da liễu', count: 6, percentage: 13 },
    { specialization: 'Chỉnh hình', count: 6, percentage: 13 },
    { specialization: 'Thần kinh', count: 5, percentage: 11 },
    { specialization: 'Đa khoa', count: 13, percentage: 29 },
  ],
  topDoctors: [
    {
      id: '1',
      name: 'Dr. Sarah Mitchell',
      specialization: 'Tim mạch',
      appointments: 156,
      revenue: 78000000,
      rating: 4.9,
      completionRate: 98,
    },
    {
      id: '2',
      name: 'Dr. James Chen',
      specialization: 'Nhi khoa',
      appointments: 142,
      revenue: 71000000,
      rating: 4.8,
      completionRate: 97,
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialization: 'Da liễu',
      appointments: 138,
      revenue: 82800000,
      rating: 4.9,
      completionRate: 99,
    },
    {
      id: '4',
      name: 'Dr. Michael Patel',
      specialization: 'Chỉnh hình',
      appointments: 125,
      revenue: 93750000,
      rating: 4.7,
      completionRate: 96,
    },
    {
      id: '5',
      name: 'Dr. David Kim',
      specialization: 'Thần kinh',
      appointments: 118,
      revenue: 70800000,
      rating: 4.8,
      completionRate: 97,
    },
  ],
  recentActivities: [
    {
      id: '1',
      type: 'NEW_USER',
      message: 'Nguyễn Văn A đã đăng ký tài khoản bệnh nhân',
      timestamp: '2025-01-14T10:30:00Z',
    },
    {
      id: '2',
      type: 'DOCTOR_APPLICATION',
      message: 'Dr. Linda Park đã nộp đơn xin trở thành bác sĩ',
      timestamp: '2025-01-14T09:15:00Z',
    },
    {
      id: '3',
      type: 'APPOINTMENT_COMPLETED',
      message: '45 lịch hẹn đã được hoàn thành hôm nay',
      timestamp: '2025-01-14T08:00:00Z',
    },
    {
      id: '4',
      type: 'NEW_USER',
      message: 'Trần Thị B đã đăng ký tài khoản bệnh nhân',
      timestamp: '2025-01-13T16:45:00Z',
    },
    {
      id: '5',
      type: 'DOCTOR_APPROVED',
      message: 'Dr. Robert Lee đã được phê duyệt',
      timestamp: '2025-01-13T14:20:00Z',
    },
  ],
}

// Statistics for dashboards
export const mockStats = {
  patient: {
    upcomingAppointments: 2,
    completedAppointments: 12,
    activePrescriptions: 1,
    healthMetricsLogged: 45,
  },
  doctor: {
    todayAppointments: 8,
    totalPatients: 156,
    pendingAppointments: 12,
    avgRating: 4.8,
    monthlyRevenue: 24500,
    weeklyAppointments: 18,
    completionRate: 98,
  },
  admin: {
    totalUsers: 1247,
    totalDoctors: 45,
    totalPatients: 1198,
    totalAppointments: 3421,
    pendingApprovals: 8,
    monthlyRevenue: 456780,
    activeUsers: 895,
    todayAppointments: 56,
  },
}
