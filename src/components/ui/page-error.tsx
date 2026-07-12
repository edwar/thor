"use client"

interface Props {
  error?: Error & { digest?: string }
  reset?: () => void
  title?: string
  message?: string
}

export function PageError({ error, reset, title = "Algo salió mal", message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {message ?? "Ocurrió un error inesperado. Intenta de nuevo."}
      </p>
      {error?.digest && (
        <p className="mt-2 text-xs text-muted-foreground">Error: {error.digest}</p>
      )}
      {reset && (
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition-all hover:opacity-90 active:scale-[0.97]"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}
