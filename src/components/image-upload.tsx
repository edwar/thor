"use client"

import { useState, useRef } from "react"
import { Label } from "@/components/ui/label"

interface ImageUploadProps {
  name: string
  label: string
  currentUrl?: string | null
  onUploaded: (url: string, key: string) => void
}

export function ImageUpload({ name, label, currentUrl, onUploaded }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return

    setUploading(true)
    const form = new FormData()
    form.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const data = await res.json()
      setPreview(data.url)
      onUploaded(data.url, data.key)
    } catch {
      const localUrl = URL.createObjectURL(file)
      setPreview(localUrl)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {preview && (
          <img src={preview} alt="" className="h-16 w-16 rounded-lg object-cover" />
        )}
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-input/30 px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent">
          {uploading ? "Subiendo..." : "Seleccionar archivo"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      </div>
      <input type="hidden" name={name} value={preview ?? ""} />
    </div>
  )
}
