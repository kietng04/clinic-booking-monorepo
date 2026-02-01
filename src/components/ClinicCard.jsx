import { MapPin, Clock, Star, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function ClinicCard({ clinic, selected = false, onClick }) {
  const getTodayHours = () => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const today = days[new Date().getDay()]
    return clinic.openingHours?.[today] || 'Closed'
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
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-sage-100 dark:bg-sage-800 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-sage-600 dark:text-sage-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-sage-900 dark:text-cream-100 mb-1 truncate">
            {clinic.name}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-sm text-sage-600 dark:text-sage-400 mb-3">
            {clinic.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-terra-400 text-terra-400" />
                <span className="font-medium">{clinic.rating}</span>
              </div>
            )}

            {clinic.distance && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{clinic.distance}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className={getTodayHours() === 'Closed' ? 'text-red-600' : ''}>
                {getTodayHours()}
              </span>
            </div>
          </div>

          <p className="text-sm text-sage-700 dark:text-sage-300 mb-2 line-clamp-2">
            {clinic.address}
          </p>

          {clinic.servicesCount !== undefined && (
            <div className="flex items-center gap-2 text-xs text-sage-500 dark:text-sage-400">
              <span className="px-2 py-1 bg-sage-100 dark:bg-sage-800 rounded">
                {clinic.servicesCount} dịch vụ
              </span>
              {clinic.doctorsCount !== undefined && (
                <span className="px-2 py-1 bg-sage-100 dark:bg-sage-800 rounded">
                  {clinic.doctorsCount} bác sĩ
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ClinicCard
