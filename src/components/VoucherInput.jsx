import { useState } from 'react'
import { Tag, X, Check, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function VoucherInput({ onApply, onRemove, amount, appliedVoucher = null }) {
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Vui lòng nhập mã voucher')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      await onApply(code.trim(), amount)
      setCode('')
    } catch (err) {
      setError(err.message || 'Mã voucher không hợp lệ')
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemove = () => {
    setError('')
    setCode('')
    onRemove()
  }

  const formatDiscount = (discount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(discount)
  }

  if (appliedVoucher) {
    return (
      <div className="flex items-center justify-between p-4 rounded-soft bg-green-50 border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">Mã voucher đã áp dụng</p>
            <p className="text-xs text-green-700">
              <span className="font-bold">{appliedVoucher.code}</span> -{' '}
              Giảm {formatDiscount(appliedVoucher.discount)}
            </p>
          </div>
        </div>

        <button
          onClick={handleRemove}
          className="text-green-600 hover:text-green-800 transition-colors"
          aria-label="Xóa voucher"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Nhập mã voucher"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError('')
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleApply()
              }
            }}
            leftIcon={<Tag className="w-5 h-5" />}
            disabled={isValidating}
            error={!!error}
          />
        </div>

        <Button
          onClick={handleApply}
          disabled={!code.trim() || isValidating}
          variant="outline"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang kiểm tra...
            </>
          ) : (
            'Áp dụng'
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

export default VoucherInput
