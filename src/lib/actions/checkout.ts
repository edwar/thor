"use server"

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getProviderForSorteo } from "@/lib/payments/provider-factory"
import { env } from "@/lib/env"

export async function initCheckout(sorteoId: string, formData: FormData) {
  const nombre = formData.get("nombre") as string
  const email = formData.get("email") as string
  const telefono = (formData.get("telefono") as string) || undefined

  if (!nombre || !email) throw new Error("Nombre y email son requeridos")

  const sorteo = await prisma.sorteo.findUnique({
    where: { id: sorteoId },
    include: { sorteador: true },
  })
  if (!sorteo || sorteo.estado !== "ACTIVO") throw new Error("Sorteo no disponible")

  const transaccion = await prisma.$transaction(async (tx) => {
    const ref = `THOR-${sorteo.id.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`

    const txRecord = await tx.transaccionPasarela.create({
      data: {
        sorteoId: sorteo.id,
        tipo: "COMPRA",
        referenciaExterna: ref,
        proveedor: "WOMPI",
        monto: sorteo.precioBono,
        moneda: "COP",
        estado: "CREADA",
      },
    })

    const bono = await tx.participanteBono.create({
      data: {
        sorteoId: sorteo.id,
        transaccionId: txRecord.id,
        nombreComprador: nombre,
        emailComprador: email,
        telefono,
        cantidad: 1,
        estado: "PENDIENTE",
      },
    })

    return { bono, txRecord }
  })

  const { provider, config } = await getProviderForSorteo(sorteoId)

  const result = await provider.initCheckout(
    {
      reference: transaccion.txRecord.referenciaExterna,
      amountInCents: Number(sorteo.precioBono) * 100,
      currency: "COP",
      customerEmail: email,
      customerName: nombre,
      redirectUrl: `${env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/s/${sorteo.slug}/bono/${transaccion.bono.id}`,
      webhookUrl: `${env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/webhooks/wompi`,
    },
    config,
  )

  redirect(result.redirectUrl)
}
