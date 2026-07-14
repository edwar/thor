import type { ReactNode } from "react"

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
      {icon && <div className="mb-4 text-3xl opacity-40">{icon}</div>}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm opacity-60">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
