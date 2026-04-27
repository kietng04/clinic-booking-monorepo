import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function Card({ children, className, hover = false, ...props }) {
  const MotionCard = hover ? motion.div : 'div'

  const motionProps = hover ? {
    whileHover: { y: -2, boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' },
    transition: { duration: 0.2 }
  } : {}

  return (
    <MotionCard
      className={cn(
        'rounded-2xl border border-sage-100 bg-white p-5 shadow-soft dark:border-sage-800 dark:bg-sage-900',
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
    <h3 className={cn('text-lg font-semibold tracking-tight text-sage-900 dark:text-cream-100', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('mt-1 text-sm text-sage-600 dark:text-sage-300', className)}>
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
    <div className={cn('mt-4 border-t border-sage-100 pt-4 dark:border-sage-800', className)}>
      {children}
    </div>
  )
}
