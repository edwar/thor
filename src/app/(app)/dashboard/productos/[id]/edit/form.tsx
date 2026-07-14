"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/form-select"
import { ProductFileUpload } from "@/components/product-file-upload"
import { updateProducto } from "@/lib/actions/productos"

interface ProductoData {
  id: string
  titulo: string
  descripcion: string | null
  tipo: string
  precio: { toString(): string }
  archivoUrl: string
  archivoKey: string
  previewUrl: string | null
  previewKey: string | null
}

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

export function EditarProductoForm({ producto }: { producto: ProductoData }) {
  const router = useRouter()
  const initial = useRef(producto).current
  const [tipo, setTipo] = useState(initial.tipo)
  const [archivoUrl, setArchivoUrl] = useState(initial.archivoUrl)
  const [archivoKey, setArchivoKey] = useState(initial.archivoKey)
  const [previewUrl, setPreviewUrl] = useState(initial.previewUrl ?? "")
  const [previewKey, setPreviewKey] = useState(initial.previewKey ?? "")

  const tipoHint = TIPO_HINTS[tipo] ?? TIPO_HINTS.IMAGEN
  const previewHint = PREVIEW_HINTS[tipo] ?? PREVIEW_HINTS.IMAGEN
  const updateAction = updateProducto.bind(null, initial.id)

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-zinc-100">Editar producto</h1>
      <p className="mt-1 text-zinc-400">{initial.titulo}</p>

      <form action={updateAction} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" name="titulo" required defaultValue={initial.titulo} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            name="descripcion"
            rows={3}
            defaultValue={initial.descripcion ?? ""}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <FormSelect
              name="tipo"
              required
              defaultValue={initial.tipo}
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
            <Input id="precio" name="precio" type="number" required min={0} step={100} defaultValue={String(initial.precio)} />
          </div>
        </div>

        <ProductFileUpload
          label="Archivo del producto"
          apiUrl="/api/upload-producto"
          responseField="archivoUrl"
          responseKeyField="archivoKey"
          acceptedExtensions={tipoHint.accept}
          hint={tipoHint.hint}
          defaultUrl={archivoUrl}
          onUploaded={(url, key) => { setArchivoUrl(url); setArchivoKey(key) }}
          tipo={tipo}
          currentKey={archivoKey}
        />
        <input type="hidden" name="archivoUrl" value={archivoUrl} />
        <input type="hidden" name="archivoKey" value={archivoKey} />

        <ProductFileUpload
          label="Preview (vista previa pública)"
          apiUrl="/api/upload-producto-preview"
          responseField="previewUrl"
          responseKeyField="previewKey"
          acceptedExtensions={previewHint.accept}
          hint={previewHint.hint}
          defaultUrl={previewUrl}
          onUploaded={(url, key) => { setPreviewUrl(url); setPreviewKey(key) }}
          tipo={tipo}
          currentKey={previewKey}
        />
        <input type="hidden" name="previewUrl" value={previewUrl} />
        <input type="hidden" name="previewKey" value={previewKey} />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={!archivoUrl} className="bg-thor-600 text-white hover:bg-thor-500">
            Guardar cambios
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/productos")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
