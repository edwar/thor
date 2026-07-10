"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSeed, commitHash } from "@/lib/crypto/raffle-seed"
import { generarCuentaCobro } from "@/lib/billing/commission"
import { ejecutarSorteo } from "@/lib/sorteo-engine"

export async function cerrarVenta(id: string) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const sorteo = await prisma.sorteo.findUnique({
    where: { id },
    include: { sorteador: true },
  })
  if (!sorteo || sorteo.sorteador.userId !== session.user.id) throw new Error("No autorizado")
  if (sorteo.estado !== "ACTIVO") throw new Error("El sorteo no está activo")

  const seed = generateSeed()
  const hash = commitHash(seed)

  await prisma.sorteo.update({
    where: { id },
    data: {
      estado: "EN_SORTEO",
      commitHash: hash,
    },
  })

  await prisma.sorteo.update({
    where: { id },
    data: { revealSeed: seed },
  })

  revalidatePath(`/dashboard/sorteos/${id}`)
  revalidatePath(`/s/${sorteo.slug}`)
}

export async function ejecutarSorteoFormAction(id: string) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const sorteo = await prisma.sorteo.findUnique({
    where: { id },
    include: { sorteador: true },
  })
  if (!sorteo || sorteo.sorteador.userId !== session.user.id) throw new Error("No autorizado")

  await ejecutarSorteo(id)

  revalidatePath(`/dashboard/sorteos/${id}`)
  revalidatePath(`/s/${sorteo.slug}`)
  revalidatePath(`/s/${sorteo.slug}/ruleta`)
}

export async function cerrarSorteoYGenerarCuenta(id: string) {
  const result = await ejecutarSorteo(id)
  await generarCuentaCobro(id)
  revalidatePath("/dashboard/cuentas-cobro")
  return result
}
