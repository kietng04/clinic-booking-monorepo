import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, CheckCircle, Loader2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { OtpInput } from '@/components/OtpInput'
import apiClient from '@/api/authApi'

export function VerifyPhone() {
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const handleVerify = async () => {
    if (code.length !== 6) return
    setLoading(true)
    try {
      await apiClient.post('/api/auth/verify-sms', { code })
      setSuccess(true)
      showToast({ type: 'success', message: 'Số điện thoại đã được xác minh!' })
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Mã không đúng' })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    try {
      await apiClient.post('/api/auth/send-sms-verification', { phone: '' })
      showToast({ type: 'success', message: 'Mã SMS đã được gửi lại' })
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể gửi mã. Thử lại sau.' })
    } finally {
      setResendLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-display font-bold text-sage-900 dark:text-cream-100 mb-2">Thành công!</h1>
            <p className="text-sage-600 dark:text-sage-400 mb-6">Số điện thoại đã được xác minh.</p>
            <Button className="w-full" onClick={() => navigate('/dashboard')}>Tiếp tục</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-sage-100 dark:bg-sage-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Phone className="w-8 h-8 text-sage-600 dark:text-sage-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-sage-900 dark:text-cream-100 mb-2">Xác minh số điện thoại</h1>
          <p className="text-sage-600 dark:text-sage-400 mb-6">Nhập mã SMS đã gửi đến số điện thoại của bạn.</p>
          <div className="mb-6">
            <OtpInput length={6} onComplete={handleVerify} onChange={setCode} />
          </div>
          <Button type="button" className="w-full" size="lg" isLoading={loading} onClick={handleVerify} disabled={code.length !== 6}>
            Xác minh
          </Button>
          <button onClick={handleResend} disabled={resendLoading} className="mt-4 text-sm text-sage-600 dark:text-sage-400 hover:text-sage-900 dark:hover:text-cream-100">
            {resendLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Gửi lại mã'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
