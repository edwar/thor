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
    <div className="flex min-h-screen items-center justify-center bg-bone px-6">
      <PageError error={error} reset={reset} />
    </div>
  )
}
