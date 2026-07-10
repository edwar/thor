"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { renderCuentaCobroHTML } from "@/lib/pdf/cuenta-cobro"
import { sendEmail } from "@/lib/email/send"
import { marcarCuentaEnviada } from "@/lib/billing/commission"

export async function enviarCuentaCobro(id: string) {
  const cuenta = await prisma.cuentaCobro.findUnique({
    where: { id },
    include: {
      sorteo: { include: { sorteador: true } },
      sorteador: { include: { user: true } },
    },
  })
  if (!cuenta) throw new Error("Cuenta de cobro no encontrada")

  const html = renderCuentaCobroHTML({
    nombreOrganizador: cuenta.sorteador.nombrePublico,
    slug: cuenta.sorteador.slug,
    tituloSorteo: cuenta.sorteo.titulo,
    totalRecaudado: String(cuenta.totalRecaudado),
    comisionPct: String(Number(cuenta.comisionPct) * 100),
    montoComision: String(cuenta.montoComision),
    totalBonosVendidos: cuenta.sorteo.bonosVendidos,
    fechaSorteo: cuenta.sorteo.fechaSorteo.toLocaleDateString("es-CO"),
    fechaEmision: new Date().toLocaleDateString("es-CO"),
    referencia: `CC-${cuenta.id.slice(0, 8)}`,
  })

  const emailDestino = cuenta.sorteador.user.email
  if (emailDestino) {
    await sendEmail({
      to: emailDestino,
      subject: `💰 Cuenta de cobro Thor — ${cuenta.sorteo.titulo}`,
      html,
    })
  }

  await marcarCuentaEnviada(id)
  revalidatePath("/dashboard/cuentas-cobro")
  revalidatePath(`/dashboard/cuentas-cobro/${id}`)
}

export async function marcarCuentaPagada(id: string) {
  const session = await prisma.cuentaCobro.findUnique({
    where: { id },
    include: { sorteador: { include: { user: true } } },
  })
  if (!session) throw new Error("Cuenta de cobro no encontrada")

  await prisma.cuentaCobro.update({
    where: { id },
    data: {
      estadoCuenta: "PAGADA",
      pagadaAt: new Date(),
    },
  })

  revalidatePath("/dashboard/cuentas-cobro")
  revalidatePath(`/dashboard/cuentas-cobro/${id}`)
}
