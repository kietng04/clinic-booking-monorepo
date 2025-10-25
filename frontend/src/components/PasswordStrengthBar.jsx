import { useMemo } from 'react'

export function PasswordStrengthBar({ password = '' }) {
  const strength = useMemo(() => {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }, [password])

  const levels = [
    { label: 'Rất yếu', color: 'bg-red-500' },
    { label: 'Yếu', color: 'bg-orange-500' },
    { label: 'Trung bình', color: 'bg-yellow-500' },
    { label: 'Khá', color: 'bg-lime-500' },
    { label: 'Mạnh', color: 'bg-green-500' },
  ]

  const currentLevel = strength > 0 ? levels[Math.min(strength - 1, 4)] : null

  const checks = [
    { label: 'Ít nhất 8 ký tự', pass: password.length >= 8 },
    { label: 'Có chữ hoa và chữ thường', pass: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: 'Có số', pass: /[0-9]/.test(password) },
    { label: 'Có ký tự đặc biệt', pass: /[^A-Za-z0-9]/.test(password) },
  ]

  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < strength ? currentLevel?.color || 'bg-gray-300' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {currentLevel && (
        <p className="text-xs text-sage-600 dark:text-sage-400">
          Độ bảo mật: <span className="font-medium">{currentLevel.label}</span>
        </p>
      )}
      <div className="space-y-1">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={`text-xs ${check.pass ? 'text-green-600' : 'text-sage-400'}`}>
              {check.pass ? '✓' : '○'}
            </span>
            <span className={`text-xs ${check.pass ? 'text-green-600' : 'text-sage-400'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
