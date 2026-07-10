"use server"

import { auth } from "@/lib/auth"
import { uploadFile, deleteFile } from "@/lib/r2"
import { env } from "@/lib/env"

const PREFIX = "productos"

export async function uploadProductoFile(formData: FormData) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const file = formData.get("file") as File
  if (!file) throw new Error("No file provided")

  const oldKey = formData.get("oldKey") as string | null

  const buffer = Buffer.from(await file.arrayBuffer())
  const key = `${PREFIX}/${session.user.id}/${Date.now()}-${file.name}`

  await uploadFile(key, buffer, file.type)

  if (oldKey) {
    await deleteFile(oldKey).catch(() => {})
  }

  return { archivoUrl: `/api/media?key=${key}`, archivoKey: key }
}

export async function uploadProductoPreview(formData: FormData) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const file = formData.get("file") as File
  if (!file) throw new Error("No file provided")

  const oldKey = formData.get("oldKey") as string | null

  const buffer = Buffer.from(await file.arrayBuffer())
  const key = `previews/${session.user.id}/${Date.now()}-${file.name}`

  await uploadFile(key, buffer, file.type)

  if (oldKey) {
    await deleteFile(oldKey).catch(() => {})
  }

  return { previewUrl: `/api/media?key=${key}`, previewKey: key }
}
