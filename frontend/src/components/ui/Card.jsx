import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function Card({ children, className, hover = false, ...props }) {
  const MotionCard = hover ? motion.div : 'div'

  const motionProps = hover ? {
    whileHover: { y: -4, boxShadow: '0 16px 48px rgba(93, 122, 96, 0.12)' },
    transition: { duration: 0.3 }
  } : {}

  return (
    <MotionCard
      className={cn(
        'bg-white dark:bg-sage-800 rounded-soft shadow-soft p-6 border border-sage-100 dark:border-sage-700',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </MotionCard>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-xl font-display font-semibold text-sage-900 dark:text-cream-100', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-sage-600 dark:text-sage-400 mt-1', className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-sage-100 dark:border-sage-700', className)}>
      {children}
    </div>
  )
}
