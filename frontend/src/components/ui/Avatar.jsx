import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { resolveAvatarSrc } from '@/lib/avatarUtils'

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-xl',
  '2xl': 'w-32 h-32 text-2xl',
  '3xl': 'w-36 h-36 text-3xl',
}

export function Avatar({ src, name, size = 'md', className, shape = 'square' }) {
  const [imgError, setImgError] = useState(false)
  const resolvedSrc = resolveAvatarSrc(src, name, { name })
  const radiusClass = shape === 'square' ? 'rounded-[6px]' : 'rounded-full'

  useEffect(() => {
    setImgError(false)
  }, [resolvedSrc])

  const shouldShowImage = Boolean(resolvedSrc) && !imgError

  return (
    <div className={cn('relative inline-block', className)}>
      {shouldShowImage ? (
        <img
          src={resolvedSrc}
          alt={name}
          className={cn(radiusClass, 'object-cover', sizes[size])}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={cn(
            radiusClass,
            'bg-gradient-to-br from-sage-400 to-terra-400 flex items-center justify-center text-white font-semibold',
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
        <div key={i} className="rounded-[6px] ring-2 ring-white dark:ring-sage-900">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="flex h-12 w-12 items-center justify-center rounded-[6px] bg-sage-200 text-sm font-medium text-sage-700 ring-2 ring-white dark:bg-sage-700 dark:text-sage-300 dark:ring-sage-900">
          +{remaining}
        </div>
      )}
    </div>
  )
}
