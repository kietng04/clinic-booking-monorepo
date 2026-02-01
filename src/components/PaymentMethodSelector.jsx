import { CreditCard, Wallet, QrCode, Banknote } from 'lucide-react'

const paymentMethods = [
  {
    id: 'momo',
    name: 'Momo',
    description: 'Ví điện tử Momo',
    icon: Wallet,
    color: 'bg-pink-100 text-pink-600',
    minAmount: 0,
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    description: 'Cổng thanh toán VNPay',
    icon: CreditCard,
    color: 'bg-blue-100 text-blue-600',
    minAmount: 0,
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    description: 'Ví điện tử ZaloPay',
    icon: QrCode,
    color: 'bg-cyan-100 text-cyan-600',
    minAmount: 0,
  },
  {
    id: 'cash',
    name: 'Tiền mặt',
    description: 'Thanh toán tại phòng khám',
    icon: Banknote,
    color: 'bg-green-100 text-green-600',
    minAmount: 0,
  },
]

export function PaymentMethodSelector({ selected, onSelect, amount = 0 }) {
  const isMethodAvailable = (method) => {
    return amount >= method.minAmount
  }

  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => {
        const Icon = method.icon
        const isAvailable = isMethodAvailable(method)
        const isSelected = selected === method.id

        return (
          <button
            key={method.id}
            onClick={() => isAvailable && onSelect(method.id)}
            disabled={!isAvailable}
            className={`w-full p-4 rounded-soft border-2 transition-all text-left ${
              isSelected
                ? 'border-sage-600 bg-sage-50 dark:bg-sage-900/50 shadow-soft'
                : isAvailable
                ? 'border-sage-200 dark:border-sage-800 hover:border-sage-400 dark:hover:border-sage-600'
                : 'border-sage-100 dark:border-sage-900 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Radio button */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected
                    ? 'border-sage-600 bg-sage-600'
                    : 'border-sage-300 dark:border-sage-700'
                }`}
              >
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.color}`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h4 className="font-semibold text-sage-900 dark:text-cream-100">
                  {method.name}
                </h4>
                <p className="text-sm text-sage-600 dark:text-sage-400">
                  {method.description}
                </p>

                {!isAvailable && (
                  <p className="text-xs text-red-600 mt-1">
                    Số tiền tối thiểu:{' '}
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(method.minAmount)}
                  </p>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default PaymentMethodSelector
