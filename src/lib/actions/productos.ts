"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteFile } from "@/lib/r2"

export async function createProducto(formData: FormData) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const sorteador = await prisma.sorteadorProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!sorteador) throw new Error("Perfil no encontrado")

  const titulo = formData.get("titulo") as string
  const descripcion = formData.get("descripcion") as string
  const tipo = formData.get("tipo") as "VIDEO" | "IMAGEN" | "PDF" | "ZIP"
  const precio = Number(formData.get("precio"))
  const archivoUrl = formData.get("archivoUrl") as string
  const archivoKey = formData.get("archivoKey") as string
  const previewUrl = formData.get("previewUrl") as string
  const previewKey = formData.get("previewKey") as string

  const sorteoActivo = await prisma.sorteo.findFirst({
    where: { sorteadorId: sorteador.id, estado: "ACTIVO" },
  })

  await prisma.productoDigital.create({
    data: {
      sorteadorId: sorteador.id,
      sorteoId: sorteoActivo?.id ?? null,
      titulo,
      descripcion: descripcion || null,
      tipo,
      precio,
      archivoUrl,
      archivoKey,
      previewUrl: previewUrl || null,
      previewKey: previewKey || null,
      activo: true,
    },
  })

  revalidatePath("/dashboard/productos")
}

export async function toggleProductoActivo(id: string) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const sorteador = await prisma.sorteadorProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!sorteador) throw new Error("Perfil no encontrado")

  const producto = await prisma.productoDigital.findUnique({
    where: { id },
    select: { sorteadorId: true, activo: true, sorteoId: true },
  })
  if (!producto || producto.sorteadorId !== sorteador.id) throw new Error("No autorizado")

  const sorteoActivo = await prisma.sorteo.findFirst({
    where: { sorteadorId: sorteador.id, estado: "ACTIVO" },
  })

  await prisma.productoDigital.update({
    where: { id },
    data: {
      activo: !producto.activo,
      sorteoId: !producto.activo ? (sorteoActivo?.id ?? producto.sorteoId) : producto.sorteoId,
    },
  })

  revalidatePath("/dashboard/productos")
}

export async function updateProducto(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const sorteador = await prisma.sorteadorProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!sorteador) throw new Error("Perfil no encontrado")

  const producto = await prisma.productoDigital.findUnique({
    where: { id },
    select: { sorteadorId: true, archivoKey: true, previewKey: true },
  })
  if (!producto || producto.sorteadorId !== sorteador.id) throw new Error("No autorizado")

  const oldFileKey = producto.archivoKey
  const oldPreviewKey = producto.previewKey

  const titulo = formData.get("titulo") as string
  const descripcion = formData.get("descripcion") as string
  const tipo = formData.get("tipo") as "VIDEO" | "IMAGEN" | "PDF" | "ZIP"
  const precio = Number(formData.get("precio"))
  const archivoUrl = formData.get("archivoUrl") as string
  const archivoKey = formData.get("archivoKey") as string
  const previewUrl = formData.get("previewUrl") as string
  const previewKey = formData.get("previewKey") as string

  await prisma.productoDigital.update({
    where: { id },
    data: {
      titulo,
      descripcion: descripcion || null,
      tipo,
      precio,
      archivoUrl,
      archivoKey,
      ...(previewUrl ? { previewUrl } : {}),
      ...(previewKey ? { previewKey } : {}),
    },
  })

  if (oldFileKey && archivoKey && oldFileKey !== archivoKey) {
    await deleteFile(oldFileKey).catch(() => {})
  }
  if (oldPreviewKey && previewKey && oldPreviewKey !== previewKey) {
    await deleteFile(oldPreviewKey).catch(() => {})
  }

  revalidatePath("/dashboard/productos")
  revalidatePath(`/dashboard/productos/${id}/edit`)
}
