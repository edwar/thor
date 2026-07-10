"use client"

import { useState, useRef } from "react"
import { Label } from "@/components/ui/label"

interface ProductFileUploadProps {
  label: string
  apiUrl: string
  responseField: "archivoUrl" | "previewUrl"
  responseKeyField: "archivoKey" | "previewKey"
  acceptedExtensions: string
  onUploaded: (url: string, key: string) => void
  defaultUrl?: string
  hint?: string
  tipo?: string
  currentKey?: string
}

export function ProductFileUpload({
  label,
  apiUrl,
  responseField,
  responseKeyField,
  acceptedExtensions,
  onUploaded,
  defaultUrl,
  hint,
  tipo,
  currentKey,
}: ProductFileUploadProps) {
  const [url, setUrl] = useState(defaultUrl ?? "")
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setFileName(file.name)
    const form = new FormData()
    form.append("file", file)
    if (currentKey) form.append("oldKey", currentKey)

    try {
      const res = await fetch(apiUrl, { method: "POST", body: form })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setUrl(data[responseField])
      onUploaded(data[responseField], data[responseKeyField])
    } catch (e) {
      alert("Error al subir archivo: " + (e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}

      {url && (
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
          {tipo === "IMAGEN" ? (
            <a href={url} target="_blank" rel="noreferrer">
              <img
                src={url}
                alt={fileName || label}
                className="max-h-48 w-full object-contain"
              />
            </a>
          ) : tipo === "VIDEO" ? (
            <video src={url} controls className="max-h-48 w-full" />
          ) : tipo === "PDF" ? (
            <div className="flex items-center gap-3 p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded bg-red-500/10 text-sm font-bold text-red-400">
                PDF
              </span>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm text-zinc-300 underline-offset-2 hover:underline"
              >
                {fileName || "Ver PDF"}
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded bg-zinc-700/50 text-sm font-bold text-zinc-400">
                ZIP
              </span>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm text-zinc-300 underline-offset-2 hover:underline"
              >
                {fileName || "Descargar archivo"}
              </a>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-input/30 px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent">
          {uploading ? "Subiendo..." : "Seleccionar archivo"}
          <input
            ref={inputRef}
            type="file"
            accept={acceptedExtensions}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      </div>
    </div>
  )
}
