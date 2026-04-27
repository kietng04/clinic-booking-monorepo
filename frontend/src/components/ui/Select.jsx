import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { forwardRef, useId } from 'react'

export const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder,
  className,
  containerClassName,
  ...props
}, ref) => {
  const selectId = useId()

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="mb-2 block text-sm font-medium text-sage-700 dark:text-cream-200">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-xl border px-4 py-2.5 pr-10 transition-all focus-ring',
            'bg-white dark:bg-sage-900',
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
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-sage-400" />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'
