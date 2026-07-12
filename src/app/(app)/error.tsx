"use client"

import { PageError } from "@/components/ui/page-error"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-screen items-center justify-center bg-surface p-8">
      <PageError error={error} reset={reset} />
    </div>
  )
}
