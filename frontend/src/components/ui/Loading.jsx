import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Loading({ fullScreen = false, text = 'Loading...', size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={cn('relative', sizes[size])}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-sage-200 dark:border-sage-700"></div>
        <div className="absolute inset-0 rounded-full border-4 border-brand-600 dark:border-brand-400 border-t-transparent"></div>
      </motion.div>
      {text && (
        <motion.p
          className="font-medium text-sage-600 dark:text-sage-300"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream-100 dark:bg-sage-950">
        {content}
      </div>
    )
  }

  return content
}

export function Skeleton({ className, ...props }) {
  return (
    <motion.div
      className={cn('rounded bg-sage-200/70 dark:bg-sage-800/70', className)}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-sage-100 bg-white p-6 shadow-soft dark:border-sage-800 dark:bg-sage-900">
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}
