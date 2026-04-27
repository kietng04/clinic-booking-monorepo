import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft',
  secondary: 'bg-terra-500 text-white hover:bg-terra-600 shadow-soft',
  outline: 'border border-sage-300 bg-white text-sage-700 hover:bg-cream-50 dark:border-sage-700 dark:bg-sage-900 dark:text-cream-100 dark:hover:bg-sage-800',
  ghost: 'text-sage-700 hover:bg-sage-100 dark:text-sage-200 dark:hover:bg-sage-800',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  isLoading,
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.99 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </motion.button>
  )
}
