import { useState } from 'react'
import { motion } from 'framer-motion'
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { vi } from '@/lib/translations'

const DoctorConsultations = () => {
  const [activeConsultation, setActiveConsultation] = useState(null)
  const [notes, setNotes] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  const scheduledConsultations = [
    {
      id: 1,
      patientName: 'John Anderson',
      patientAvatar: 'https://i.pravatar.cc/150?img=33',
      scheduledTime: '2025-01-15T14:30:00',
      reason: 'Tư vấn da liễu',
      type: 'VIDEO',
    },
    {
      id: 2,
      patientName: 'Mary Johnson',
      patientAvatar: 'https://i.pravatar.cc/150?img=45',
      scheduledTime: '2025-01-15T15:00:00',
      reason: 'Kiểm tra định kỳ',
      type: 'VIDEO',
    },
  ]

  const startConsultation = (consultation) => {
    setActiveConsultation(consultation)
  }

  const endConsultation = () => {
    if (confirm('Bạn có chắc muốn kết thúc cuộc tư vấn?')) {
      setActiveConsultation(null)
      setNotes('')
      setIsMuted(false)
      setIsVideoOff(false)
    }
  }

  if (activeConsultation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-sage-900">
            Tư vấn với {activeConsultation.patientName}
          </h2>
          <Badge className="bg-red-100 text-red-800">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            Đang tư vấn
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-sage-900 rounded-lg overflow-hidden">
                  {/* Mock video area */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Avatar
                        src={activeConsultation.patientAvatar}
                        alt={activeConsultation.patientName}
                        size="xl"
                        className="mx-auto mb-4"
                      />
                      <p className="text-lg">{activeConsultation.patientName}</p>
                      <p className="text-sm text-sage-300">Mock Video Call</p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant={isMuted ? 'danger' : 'ghost'}
                        size="lg"
                        onClick={() => setIsMuted(!isMuted)}
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </Button>
                      <Button
                        variant={isVideoOff ? 'danger' : 'ghost'}
                        size="lg"
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                      </Button>
                      <Button
                        variant="danger"
                        size="lg"
                        onClick={endConsultation}
                      >
                        <PhoneOff className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {vi.doctor.consultations.consultationNotes}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  as="textarea"
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú trong quá trình tư vấn..."
                />
                <Button className="mt-3">
                  {vi.doctor.consultations.saveNotes}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Patient Info & Chat */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{vi.doctor.consultations.patientInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-sage-600">Tên bệnh nhân</label>
                  <p className="font-medium text-sage-900">{activeConsultation.patientName}</p>
                </div>
                <div>
                  <label className="text-sm text-sage-600">Lý do tư vấn</label>
                  <p className="font-medium text-sage-900">{activeConsultation.reason}</p>
                </div>
                <div>
                  <label className="text-sm text-sage-600">Thời gian</label>
                  <p className="font-medium text-sage-900">
                    {new Date(activeConsultation.scheduledTime).toLocaleTimeString('vi-VN')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-sage-50 rounded-lg p-4 mb-3 overflow-y-auto">
                  <p className="text-sm text-sage-500 text-center">
                    Chức năng chat trong cuộc tư vấn
                  </p>
                </div>
                <Input placeholder="Nhập tin nhắn..." />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900 mb-2">
          {vi.doctor.consultations.title}
        </h1>
        <p className="text-sage-600">Quản lý các buổi tư vấn trực tuyến</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{vi.doctor.consultations.scheduledConsultations}</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledConsultations.length === 0 ? (
            <p className="text-center py-8 text-sage-500">
              {vi.doctor.consultations.noConsultations}
            </p>
          ) : (
            <div className="space-y-3">
              {scheduledConsultations.map((consultation, index) => (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={consultation.patientAvatar}
                      alt={consultation.patientName}
                    />
                    <div>
                      <h4 className="font-semibold text-sage-900">{consultation.patientName}</h4>
                      <p className="text-sm text-sage-600">{consultation.reason}</p>
                      <p className="text-xs text-sage-500 mt-1">
                        {new Date(consultation.scheduledTime).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => startConsultation(consultation)}
                    leftIcon={<Video />}
                  >
                    {vi.doctor.consultations.joinConsultation}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DoctorConsultations
