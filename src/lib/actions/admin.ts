"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { env } from "@/lib/env"

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
