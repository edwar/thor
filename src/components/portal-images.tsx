"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"

interface PortalImagesProps {
  logoUrl: string | null
  bannerUrl: string | null
}

export function PortalImages({ logoUrl, bannerUrl }: PortalImagesProps) {
  const [logo, setLogo] = useState(logoUrl ?? "")
  const [banner, setBanner] = useState(bannerUrl ?? "")
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null)

  function extractKey(url: string): string | null {
    const m = url.match(/[?&]key=([^&]+)/)
    return m ? decodeURIComponent(m[1]) : null
  }

  async function handleUpload(type: "logo" | "banner", file: File) {
    if (!file.type.startsWith("image/")) return
    setUploading(type)
    const form = new FormData()
    form.append("file", file)

    const currentUrl = type === "logo" ? logo : banner
    const oldKey = currentUrl ? extractKey(currentUrl) : null
    if (oldKey) form.append("oldKey", oldKey)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const data = await res.json()
      if (type === "logo") setLogo(data.url)
      else setBanner(data.url)
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Logo</Label>
        <label className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-input/20 px-4 py-8 text-center text-sm text-muted-foreground transition-colors hover:bg-accent">
          {logo ? (
            <img src={logo} alt="Logo" className="h-20 w-20 rounded-lg object-cover" />
          ) : (
            <svg className="h-8 w-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          <span>{uploading === "logo" ? "Subiendo..." : logo ? "Cambiar logo" : "Subir logo"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload("logo", e.target.files[0])}
          />
        </label>
        <input type="hidden" name="logoUrl" value={logo} />
      </div>

      <div className="space-y-2">
        <Label>Banner</Label>
        <label className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-input/20 px-4 py-8 text-center text-sm text-muted-foreground transition-colors hover:bg-accent">
          {banner ? (
            <img src={banner} alt="Banner" className="h-20 w-full max-w-[200px] rounded-lg object-cover" />
          ) : (
            <svg className="h-8 w-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          <span>{uploading === "banner" ? "Subiendo..." : banner ? "Cambiar banner" : "Subir banner"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload("banner", e.target.files[0])}
          />
        </label>
        <input type="hidden" name="bannerUrl" value={banner} />
      </div>
    </div>
  )
}
