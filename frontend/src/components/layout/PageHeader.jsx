import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  action,
  className,
}) {
  return (
    <div className={cn('flex flex-col gap-4 rounded-2xl border border-sage-100 bg-white/72 px-5 py-5 shadow-soft dark:border-sage-800 dark:bg-sage-900/70 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-sage-900 dark:text-cream-100 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm text-sage-600 dark:text-sage-300 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
