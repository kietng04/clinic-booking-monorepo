import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, Phone, Monitor } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { profileApi } from '@/api/profileApiWrapper'

const DEFAULT_SETTINGS = {
  emailReminders: true,
  emailPrescription: true,
  emailLabResults: true,
  emailMarketing: false,
  smsReminders: true,
  smsUrgent: true,
  pushAll: true,
  reminderTiming: '1_DAY',
}

const normalizeNotificationSettings = (data = {}) => ({
  emailReminders: data.emailReminders ?? DEFAULT_SETTINGS.emailReminders,
  emailPrescription: data.emailPrescription ?? DEFAULT_SETTINGS.emailPrescription,
  emailLabResults: data.emailLabResults ?? DEFAULT_SETTINGS.emailLabResults,
  emailMarketing: data.emailMarketing ?? DEFAULT_SETTINGS.emailMarketing,
  smsReminders: data.smsReminders ?? DEFAULT_SETTINGS.smsReminders,
  smsUrgent: data.smsUrgent ?? DEFAULT_SETTINGS.smsUrgent,
  pushAll: data.pushAll ?? DEFAULT_SETTINGS.pushAll,
  reminderTiming: data.reminderTiming ?? DEFAULT_SETTINGS.reminderTiming,
})

export default function NotificationSettings() {
  const { showToast } = useUIStore()
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const response = await profileApi.getNotifications()
      setSettings(normalizeNotificationSettings(response))
    } catch (error) {
      setSettings(null)
      setLoadError('Không thể tải cài đặt thông báo từ máy chủ.')
      showToast({ type: 'error', message: 'Không thể tải cài đặt thông báo' })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await profileApi.updateNotifications(settings)
      if (response && typeof response === 'object') {
        setSettings(normalizeNotificationSettings(response))
      }
      showToast({ type: 'success', message: 'Cài đặt thông báo đã được lưu!' })
    } catch (error) {
      showToast({ type: 'error', message: 'Lưu thất bại' })
    } finally {
      setSaving(false)
    }
  }

  const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-pressed={checked}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-sage-600' : 'bg-sage-300 dark:bg-sage-600'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
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

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
        <div>
          <div className="h-9 w-56 bg-sage-100 rounded-lg animate-pulse" />
          <div className="h-5 w-72 bg-sage-50 rounded-lg animate-pulse mt-3" />
        </div>
        {[1, 2, 3].map((section) => (
          <div key={section} className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-6 space-y-4">
            <div className="h-10 w-40 bg-sage-50 rounded-lg animate-pulse" />
            <div className="h-6 w-full bg-sage-50 rounded-lg animate-pulse" />
            <div className="h-6 w-full bg-sage-50 rounded-lg animate-pulse" />
          </div>
        ))}
      </motion.div>
    )
  }

  if (!settings) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-sage-800 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center space-y-4">
          <h1 className="text-2xl font-display font-bold text-sage-900 dark:text-cream-100">Cài đặt thông báo</h1>
          <p className="text-sm text-sage-600 dark:text-sage-300">{loadError || 'Không có dữ liệu cài đặt thông báo.'}</p>
          <Button onClick={loadSettings}>Thử lại</Button>
        </div>
      </motion.div>
    )
  }

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
                  <ToggleSwitch
                    checked={settings[item.key]}
                    onChange={() => toggleSetting(item.key)}
                    disabled={saving}
                  />
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
            disabled={saving}
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
