import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-sage-100 text-sage-700 dark:bg-sage-800 dark:text-cream-100',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  warning: 'bg-terra-100 text-terra-700 dark:bg-terra-900/40 dark:text-terra-200',
  danger: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  info: 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-200',
}

export function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
