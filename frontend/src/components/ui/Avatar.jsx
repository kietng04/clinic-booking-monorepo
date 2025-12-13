import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-xl',
}

export function Avatar({ src, name, size = 'md', className }) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [src])

  const shouldShowImage = Boolean(src) && !imgError

  return (
    <div className={cn('relative inline-block', className)}>
      {shouldShowImage ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover', sizes[size])}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-gradient-to-br from-sage-400 to-terra-400 flex items-center justify-center text-white font-semibold',
            sizes[size]
          )}
        >
          {getInitials(name || 'User')}
        </div>
      )}
    </div>
  )
}

export function AvatarGroup({ children, max = 3, className }) {
  const childArray = Array.isArray(children) ? children : [children]
  const visible = childArray.slice(0, max)
  const remaining = childArray.length - max

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((child, i) => (
        <div key={i} className="ring-2 ring-white dark:ring-sage-900 rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="w-12 h-12 rounded-full bg-sage-200 dark:bg-sage-700 ring-2 ring-white dark:ring-sage-900 flex items-center justify-center text-sm font-medium text-sage-700 dark:text-sage-300">
          +{remaining}
        </div>
      )}
    </div>
  )
}
