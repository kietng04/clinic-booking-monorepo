import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, Phone, Monitor } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { profileApi } from '@/api/profileApiWrapper'

export default function NotificationSettings() {
  const { showToast } = useUIStore()
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    emailReminders: true,
    emailPrescription: true,
    emailLabResults: true,
    emailMarketing: false,
    smsReminders: true,
    smsUrgent: true,
    pushAll: true,
    reminderTiming: '1_DAY',
  })

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await profileApi.updateNotifications(settings)
      showToast({ type: 'success', message: 'Cài đặt thông báo đã được lưu!' })
    } catch (error) {
      showToast({ type: 'error', message: 'Lưu thất bại' })
    } finally {
      setSaving(false)
    }
  }

  const ToggleSwitch = ({ checked, onChange }) => (
    <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-sage-600' : 'bg-sage-300 dark:bg-sage-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )

  const sections = [
    {
      title: 'Email', icon: Mail, items: [
        { key: 'emailReminders', label: 'Nhắc lịch hẹn' },
        { key: 'emailPrescription', label: 'Đơn thuốc sẵn sàng' },
        { key: 'emailLabResults', label: 'Kết quả xét nghiệm' },
        { key: 'emailMarketing', label: 'Tin tức & khuyến mãi' },
      ]
    },
    {
      title: 'SMS', icon: Phone, items: [
        { key: 'smsReminders', label: 'Nhắc lịch hẹn' },
        { key: 'smsUrgent', label: 'Cảnh báo khẩn' },
      ]
    },
    {
      title: 'Push Notification', icon: Monitor, items: [
        { key: 'pushAll', label: 'Tất cả thông báo' },
      ]
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-sage-900 dark:text-cream-100">Cài đặt thông báo</h1>
        <p className="text-sage-600 dark:text-sage-400 mt-1">Chọn loại thông báo bạn muốn nhận</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sage-100 dark:bg-sage-700 rounded-xl flex items-center justify-center">
                <section.icon className="w-5 h-5 text-sage-600 dark:text-sage-400" />
              </div>
              <h3 className="font-semibold text-sage-900 dark:text-cream-100">{section.title}</h3>
            </div>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <span className="text-sm text-sage-700 dark:text-sage-300">{item.label}</span>
                  <ToggleSwitch checked={settings[item.key]} onChange={() => toggleSetting(item.key)} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-sage-100 dark:bg-sage-700 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-sage-600 dark:text-sage-400" />
            </div>
            <h3 className="font-semibold text-sage-900 dark:text-cream-100">Thời gian nhắc</h3>
          </div>
          <select
            value={settings.reminderTiming}
            onChange={(e) => setSettings({ ...settings, reminderTiming: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-sage-300 dark:border-sage-600 bg-white dark:bg-sage-700 text-sage-900 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-sage-500"
          >
            <option value="1_HOUR">1 giờ trước</option>
            <option value="2_HOURS">2 giờ trước</option>
            <option value="1_DAY">1 ngày trước</option>
            <option value="2_DAYS">2 ngày trước</option>
          </select>
        </div>

        <Button className="w-full" size="lg" isLoading={saving} onClick={handleSave}>
          Lưu cài đặt
        </Button>
      </div>
    </motion.div>
  )
}
