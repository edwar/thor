"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteFile } from "@/lib/r2"
import { redirect } from "next/navigation"

function parseForm(formData: FormData, id?: string) {
  const data: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    data[key] = value
  }
  data.tipoPremio = formData.get("tipoPremio") as string
  data.precioBono = Number(formData.get("precioBono"))
  data.totalBonos = Number(formData.get("totalBonos"))
  data.rangoPuestosMin = Number(formData.get("rangoPuestosMin") ?? 10000)
  data.rangoPuestosMax = Number(formData.get("rangoPuestosMax") ?? 99999)
  data.premioFijo = formData.get("premioFijo") ? Number(formData.get("premioFijo")) : null
  data.porcentajePremio = formData.get("porcentajePremio") ? Number(formData.get("porcentajePremio")) : null
  data.fechaInicio = formData.get("fechaInicio") as string
  data.fechaCierre = formData.get("fechaCierre") as string
  data.fechaSorteo = formData.get("fechaSorteo") as string

  const productoTipo = formData.get("productoTipo") as string
  if (productoTipo) {
    data.producto = {
      tipo: productoTipo,
      titulo: formData.get("productoTitulo") as string,
      archivoUrl: formData.get("productoArchivoUrl") as string,
      archivoKey: formData.get("productoArchivoKey") as string,
      previewUrl: formData.get("productoPreviewUrl") as string || null,
      previewKey: formData.get("productoPreviewKey") as string || null,
    }
  }

  return data as {
    titulo: string
    descripcion?: string
    bannerUrl?: string
    tipoPremio: "FIJO" | "PORCENTAJE"
    premioFijo?: number | null
    porcentajePremio?: number | null
    precioBono: number
    totalBonos: number
    rangoPuestosMin: number
    rangoPuestosMax: number
    fechaInicio: string
    fechaCierre: string
    fechaSorteo: string
  }
}

export async function createSorteo(formData: FormData) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const sorteador = await prisma.sorteadorProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!sorteador) throw new Error("Perfil de sorteador no encontrado")

  const input = parseForm(formData)
  const slug = `${sorteador.slug}-${Date.now().toString(36)}`

  const sorteo = await prisma.sorteo.create({
    data: {
      sorteadorId: sorteador.id,
      slug,
      titulo: input.titulo,
      descripcion: (input.descripcion as string) ?? null,
      bannerUrl: input.bannerUrl ?? null,
      tipoPremio: input.tipoPremio as "FIJO" | "PORCENTAJE",
      premioFijo: input.premioFijo ?? null,
      porcentajePremio: (input.porcentajePremio as number) ?? null,
      precioBono: input.precioBono,
      totalBonos: input.totalBonos,
      rangoPuestosMin: input.rangoPuestosMin,
      rangoPuestosMax: input.rangoPuestosMax,
      fechaInicio: new Date(input.fechaInicio),
      fechaCierre: new Date(input.fechaCierre),
      fechaSorteo: new Date(input.fechaSorteo),
      estado: "BORRADOR",
    },
  })

  revalidatePath("/dashboard/sorteos")
  redirect(`/dashboard/sorteos/${sorteo.id}`)
}

export async function updateSorteo(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const sorteo = await prisma.sorteo.findUnique({
    where: { id },
    include: { sorteador: true, productos: true },
  })
  if (!sorteo || sorteo.sorteador.userId !== session.user.id) {
    throw new Error("No autorizado")
  }

  const oldBannerKey = sorteo.bannerUrl ? extractKey(sorteo.bannerUrl) : null

  const input = parseForm(formData)

  await prisma.sorteo.update({
    where: { id },
    data: {
      titulo: input.titulo,
      descripcion: (input.descripcion as string) ?? null,
      bannerUrl: input.bannerUrl ?? null,
      tipoPremio: input.tipoPremio as "FIJO" | "PORCENTAJE",
      premioFijo: input.premioFijo ?? null,
      porcentajePremio: (input.porcentajePremio as number) ?? null,
      precioBono: input.precioBono,
      totalBonos: input.totalBonos,
      rangoPuestosMin: input.rangoPuestosMin,
      rangoPuestosMax: input.rangoPuestosMax,
      fechaInicio: new Date(input.fechaInicio),
      fechaCierre: new Date(input.fechaCierre),
      fechaSorteo: new Date(input.fechaSorteo),
    },
  })

  const newBannerKey = input.bannerUrl ? extractKey(input.bannerUrl) : null
  if (oldBannerKey && newBannerKey && oldBannerKey !== newBannerKey) {
    await deleteFile(oldBannerKey).catch(() => {})
  }

  const prod = (input as Record<string, unknown>).producto as Record<string, string> | undefined
  const currentProduct = sorteo.productos[0]
  if (prod?.titulo && currentProduct) {
    await prisma.productoDigital.update({
      where: { id: currentProduct.id },
      data: {
        tipo: prod.tipo as "VIDEO" | "IMAGEN" | "PDF" | "ZIP",
        titulo: prod.titulo,
        archivoUrl: prod.archivoUrl,
        archivoKey: prod.archivoKey,
        previewUrl: prod.previewUrl ?? null,
        previewKey: prod.previewKey ?? null,
      },
    })
  } else if (prod?.titulo && !currentProduct) {
    await prisma.productoDigital.create({
      data: {
        sorteadorId: sorteo.sorteadorId,
        sorteoId: sorteo.id,
        tipo: prod.tipo as "VIDEO" | "IMAGEN" | "PDF" | "ZIP",
        titulo: prod.titulo,
        archivoUrl: prod.archivoUrl,
        archivoKey: prod.archivoKey,
        previewUrl: prod.previewUrl ?? null,
        previewKey: prod.previewKey ?? null,
        precio: 0,
      },
    })
  }

  revalidatePath(`/dashboard/sorteos/${id}`)
  revalidatePath("/dashboard/sorteos")
}

export async function deleteSorteo(id: string) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const sorteo = await prisma.sorteo.findUnique({
    where: { id },
    include: { sorteador: true },
  })
  if (!sorteo || sorteo.sorteador.userId !== session.user.id) {
    throw new Error("No autorizado")
  }

  await prisma.sorteo.delete({ where: { id } })
  revalidatePath("/dashboard/sorteos")
  redirect("/dashboard/sorteos")
}

export async function publishSorteo(id: string) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const sorteo = await prisma.sorteo.findUnique({
    where: { id },
    include: { sorteador: { include: { pasarelaConfig: true } } },
  })
  if (!sorteo || sorteo.sorteador.userId !== session.user.id) {
    throw new Error("No autorizado")
  }

  if (sorteo.estado !== "BORRADOR") {
    throw new Error("El sorteo ya fue publicado")
  }

  if (!sorteo.sorteador.pasarelaConfig) {
    throw new Error("Debes configurar tu pasarela de pago antes de publicar")
  }

  await prisma.sorteo.update({
    where: { id },
    data: { estado: "ACTIVO" },
  })

  const sorteadorId = sorteo.sorteador.id
  await prisma.productoDigital.updateMany({
    where: { sorteadorId, activo: true, sorteoId: null },
    data: { sorteoId: id },
  })

  revalidatePath(`/dashboard/sorteos/${id}`)
  revalidatePath("/dashboard/sorteos")
}

function extractKey(url: string): string | null {
  const match = url.match(/[?&]key=([^&]+)/)
  return match ? decodeURIComponent(match[1]) : null
}
