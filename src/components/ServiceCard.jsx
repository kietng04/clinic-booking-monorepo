import { Clock, Tag, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'

const categoryColors = {
  General: 'bg-blue-100 text-blue-800 border-blue-200',
  Specialist: 'bg-purple-100 text-purple-800 border-purple-200',
  Lab: 'bg-green-100 text-green-800 border-green-200',
  Imaging: 'bg-orange-100 text-orange-800 border-orange-200',
  Procedure: 'bg-pink-100 text-pink-800 border-pink-200',
}

const categoryLabels = {
  General: 'Khám tổng quát',
  Specialist: 'Chuyên khoa',
  Lab: 'Xét nghiệm',
  Imaging: 'Chẩn đoán hình ảnh',
  Procedure: 'Thủ thuật',
}

export function ServiceCard({ service, selected = false, onClick, onViewDetails }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: service.currency || 'VND',
    }).format(price)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-5 rounded-soft border-2 transition-all cursor-pointer ${
        selected
          ? 'border-sage-600 bg-sage-50 dark:bg-sage-900/50 shadow-soft'
          : 'border-sage-200 dark:border-sage-800 hover:border-sage-400 dark:hover:border-sage-600'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg text-sage-900 dark:text-cream-100 flex-1 pr-2">
          {service.name}
        </h3>

        {service.category && (
          <Badge className={categoryColors[service.category] || 'bg-gray-100 text-gray-800'}>
            {categoryLabels[service.category] || service.category}
          </Badge>
        )}
      </div>

      {service.description && (
        <p className="text-sm text-sage-600 dark:text-sage-400 mb-4 line-clamp-2">
          {service.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-sage-600 dark:text-sage-400">
          {service.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{service.duration} phút</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            <span className="font-bold text-terra-600 dark:text-terra-400">
              {formatPrice(service.price)}
            </span>
          </div>
        </div>

        {onViewDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(service)
            }}
            className="text-sm text-sage-600 hover:text-sage-900 dark:text-sage-400 dark:hover:text-cream-100 flex items-center gap-1"
          >
            <Info className="w-4 h-4" />
            Chi tiết
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default ServiceCard
