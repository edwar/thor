"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/form-select"
import { ProductFileUpload } from "@/components/product-file-upload"
import { createProducto } from "@/lib/actions/productos"

const TIPO_HINTS: Record<string, { accept: string; hint: string }> = {
  IMAGEN: { accept: "image/*", hint: "JPEG, PNG, WebP" },
  VIDEO: { accept: "video/*", hint: "MP4, WebM, MOV" },
  PDF: { accept: ".pdf", hint: "PDF" },
  ZIP: { accept: ".zip,.rar,.7z", hint: "ZIP, RAR, 7z" },
}

const PREVIEW_HINTS: Record<string, { accept: string; hint: string }> = {
  IMAGEN: { accept: "image/*", hint: "Versión con menor resolución para vista previa" },
  VIDEO: { accept: "video/*", hint: "Clip corto o resumen del video (recomendado <30s)" },
  PDF: { accept: ".pdf", hint: "PDF con contenido parcial como muestra" },
  ZIP: { accept: "image/*,.pdf", hint: "Captura o PDF con muestra del contenido" },
}

export default function NuevoProductoPage() {
  const [tipo, setTipo] = useState("IMAGEN")
  const [archivoUrl, setArchivoUrl] = useState("")
  const [archivoKey, setArchivoKey] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")
  const [previewKey, setPreviewKey] = useState("")

  const tipoHint = TIPO_HINTS[tipo] ?? TIPO_HINTS.IMAGEN
  const previewHint = PREVIEW_HINTS[tipo] ?? PREVIEW_HINTS.IMAGEN

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Nuevo producto</h1>
      <p className="mt-1 text-muted-foreground">
        Crea un producto digital. Se vinculará automáticamente al sorteo activo.
      </p>

      <form action={createProducto} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" name="titulo" required placeholder="Nombre del producto" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            name="descripcion"
            rows={3}
            placeholder="Descripción del producto (opcional)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <FormSelect
              name="tipo"
              required
              defaultValue="IMAGEN"
              onChange={(v) => setTipo(v)}
              options={[
                { value: "IMAGEN", label: "Imagen" },
                { value: "VIDEO", label: "Video" },
                { value: "PDF", label: "PDF" },
                { value: "ZIP", label: "ZIP" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precio">Precio ($)</Label>
            <Input id="precio" name="precio" type="number" required min={0} step={100} placeholder="20000" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <ProductFileUpload
              label="Archivo del producto"
              apiUrl="/api/upload-producto"
              responseField="archivoUrl"
              responseKeyField="archivoKey"
              acceptedExtensions={tipoHint.accept}
              hint={tipoHint.hint}
              onUploaded={(url, key) => { setArchivoUrl(url); setArchivoKey(key) }}
              tipo={tipo}
            />
            <input type="hidden" name="archivoUrl" value={archivoUrl} />
            <input type="hidden" name="archivoKey" value={archivoKey} />
          </div>

          <div>
            <ProductFileUpload
              label="Preview (vista previa pública)"
              apiUrl="/api/upload-producto-preview"
              responseField="previewUrl"
              responseKeyField="previewKey"
              acceptedExtensions={previewHint.accept}
              hint={previewHint.hint}
              onUploaded={(url, key) => { setPreviewUrl(url); setPreviewKey(key) }}
              tipo={tipo}
            />
            <input type="hidden" name="previewUrl" value={previewUrl} />
            <input type="hidden" name="previewKey" value={previewKey} />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={!archivoUrl} className="bg-thor-600 text-white hover:bg-thor-500">
            Crear producto
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/productos" />} className="cursor-default">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
