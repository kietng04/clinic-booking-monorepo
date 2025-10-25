import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { forwardRef } from 'react'

export const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder,
  className,
  containerClassName,
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-sage-700 dark:text-cream-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3 pr-10 rounded-soft border transition-all focus-ring appearance-none',
            'bg-white dark:bg-sage-800',
            'border-sage-200 dark:border-sage-700',
            'text-sage-900 dark:text-cream-100',
            error && 'border-red-500 focus:ring-red-400',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'
