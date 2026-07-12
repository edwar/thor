export function PageLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-lg bg-muted" />
        <div className="h-4 w-96 rounded-md bg-muted" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  )
}
