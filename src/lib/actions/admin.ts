"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function promoteToAdmin(secret: string) {
  const adminSecret = process.env.ADMIN_SECRET_KEY
  if (!adminSecret || secret !== adminSecret) {
    throw new Error("Secret inválido")
  }

  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "ADMIN" },
  })

  return { ok: true }
}

export async function isAdminUser(): Promise<boolean> {
  const session = await auth()
  if (!session?.user) return false
  return session.user.role === "ADMIN"
}

async function assertAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado")
  }
}

export async function marcarComisionPagada(id: string) {
  await assertAdmin()

  await prisma.cuentaCobro.update({
    where: { id },
    data: {
      estadoCuenta: "PAGADA",
      pagadaAt: new Date(),
    },
  })

  revalidatePath("/admin/comisiones")
}

export async function marcarComisionPendiente(id: string) {
  await assertAdmin()

  await prisma.cuentaCobro.update({
    where: { id },
    data: {
      estadoCuenta: "PENDIENTE",
      pagadaAt: null,
    },
  })

  revalidatePath("/admin/comisiones")
}
