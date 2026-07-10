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
    <>
      <div className="space-y-2">
        <Label>Logo</Label>
        <div className="flex items-center gap-4">
          {logo && (
            <img src={logo} alt="Logo" className="h-16 w-16 rounded-lg object-cover" />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-input/30 px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent">
            {uploading === "logo" ? "Subiendo..." : "Seleccionar imagen"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload("logo", e.target.files[0])}
            />
          </label>
        </div>
        <input type="hidden" name="logoUrl" value={logo} />
      </div>

      <div className="space-y-2">
        <Label>Banner</Label>
        <div className="flex items-center gap-4">
          {banner && (
            <img src={banner} alt="Banner" className="h-24 w-full rounded-lg object-cover" />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-input/30 px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent">
            {uploading === "banner" ? "Subiendo..." : "Seleccionar imagen"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload("banner", e.target.files[0])}
            />
          </label>
        </div>
        <input type="hidden" name="bannerUrl" value={banner} />
      </div>
    </>
  )
}
