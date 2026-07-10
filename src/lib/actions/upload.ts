"use server"

import { writeFile, mkdir, unlink } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { auth } from "@/lib/auth"
import { env } from "@/lib/env"
import { uploadFile, deleteFile } from "@/lib/r2"

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads")

export async function uploadImagen(formData: FormData) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const file = formData.get("file") as File
  if (!file) throw new Error("No se envió ningún archivo")

  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten imágenes")
  }

  const oldKey = formData.get("oldKey") as string | null

  const ext = path.extname(file.name) || ".jpg"
  const filename = `${session.user.id}/${Date.now()}${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  if (env.CLOUDFLARE_R2_ENDPOINT) {
    const key = `portal/${filename}`
    await uploadFile(key, buffer, file.type)

    if (oldKey) {
      await deleteFile(oldKey).catch(() => {})
    }

    return { url: `/api/media?key=${key}`, key }
  }

  const filePath = path.join(UPLOAD_DIR, filename)
  if (!existsSync(path.dirname(filePath))) {
    await mkdir(path.dirname(filePath), { recursive: true })
  }
  await writeFile(filePath, buffer)

  if (oldKey) {
    const localPath = path.join(UPLOAD_DIR, oldKey)
    if (existsSync(localPath)) {
      await unlink(localPath).catch(() => {})
    }
  }

  return { url: `/uploads/${filename}`, key: filename }
}
