import { cn } from '@/lib/utils'
import { forwardRef, useId } from 'react'

export const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  containerClassName,
  ...props
}, ref) => {
  const inputId = useId()

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-sage-700 dark:text-cream-200">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full rounded-xl border px-4 py-2.5 transition-all focus-ring',
            'bg-white dark:bg-sage-900',
            'border-sage-200 dark:border-sage-700',
            'text-sage-900 dark:text-cream-100',
            'placeholder:text-sage-400 dark:placeholder:text-sage-500',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500 focus:ring-red-400',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-sage-500 dark:text-sage-400">{helperText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
