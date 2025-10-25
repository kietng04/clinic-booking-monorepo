import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import apiClient from '@/api/authApi'

export function VerifyEmail() {
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (token) {
      apiClient.get('/api/auth/verify-email', { params: { token } })
        .then((res) => {
          if (res.data.verified) {
            setStatus('success')
            showToast({ type: 'success', message: 'Email đã được xác minh thành công!' })
          } else {
            setStatus('failed')
          }
        })
        .catch(() => setStatus('failed'))
    } else {
      setStatus('failed')
    }
  }, [token])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-sage-600 mx-auto mb-4" />
          <p className="text-sage-600 dark:text-sage-400">Đang xác minh email...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
        <div className="bg-white dark:bg-sage-800 border border-sage-200 dark:border-sage-700 rounded-2xl p-8 shadow-lg">
          {status === 'success' ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-display font-bold text-sage-900 dark:text-cream-100 mb-2">Email đã xác minh!</h1>
              <p className="text-sage-600 dark:text-sage-400 mb-6">Email của bạn đã được xác minh thành công.</p>
              <Button className="w-full" onClick={() => navigate('/dashboard')}>Tiếp tục</Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-display font-bold text-sage-900 dark:text-cream-100 mb-2">Xác minh thất bại</h1>
              <p className="text-sage-600 dark:text-sage-400 mb-6">Link không hợp lệ hoặc đã hết hiệu lực.</p>
              <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>Quay lại bảng tổng quát</Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
