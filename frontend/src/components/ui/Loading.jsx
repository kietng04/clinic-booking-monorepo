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
        <div className="absolute inset-0 rounded-full border-4 border-sage-600 dark:border-sage-400 border-t-transparent"></div>
      </motion.div>
      {text && (
        <motion.p
          className="text-sage-600 dark:text-sage-400 font-medium"
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
      <div className="fixed inset-0 bg-cream-50 dark:bg-sage-950 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

export function Skeleton({ className, ...props }) {
  return (
    <motion.div
      className={cn('bg-sage-200/50 dark:bg-sage-800/50 rounded', className)}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-sage-800 rounded-soft shadow-soft p-6 border border-sage-100 dark:border-sage-700">
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}
