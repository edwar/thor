"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"

interface SlugInputProps {
  defaultValue: string
}

export function SlugInput({ defaultValue }: SlugInputProps) {
  const [slug, setSlug] = useState(defaultValue)
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")

  const checkSlug = useCallback(async (value: string) => {
    if (value.length < 3) {
      setStatus("idle")
      return
    }
    setStatus("checking")
    const res = await fetch(`/api/portal/slug-check?slug=${encodeURIComponent(value)}&currentSlug=${encodeURIComponent(defaultValue)}`)
    const data = await res.json()
    setStatus(data.available ? "available" : "taken")
  }, [defaultValue])

  useEffect(() => {
    const timer = setTimeout(() => checkSlug(slug), 500)
    return () => clearTimeout(timer)
  }, [slug, checkSlug])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        {status === "checking" && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
            Verificando...
          </span>
        )}
      </div>
      {status === "available" && (
        <p className="text-xs text-green-500">Slug disponible</p>
      )}
      {status === "taken" && (
        <p className="text-xs text-red-500">Ese slug ya está en uso</p>
      )}
    </div>
  )
}
