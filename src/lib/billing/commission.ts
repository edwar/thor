import { prisma } from "@/lib/prisma"

export async function generarCuentaCobro(sorteoId: string) {
  const sorteo = await prisma.sorteo.findUnique({
    where: { id: sorteoId },
    include: {
      sorteador: true,
      transacciones: {
        where: { estado: "APROBADA", tipo: "COMPRA" },
      },
    },
  })
  if (!sorteo) throw new Error("Sorteo not found")

  const totalRecaudado = sorteo.transacciones.reduce(
    (sum, t) => sum + Number(t.monto),
    0,
  )
  const comisionPct = 0.01
  const montoComision = totalRecaudado * comisionPct

  const cuentaCobro = await prisma.cuentaCobro.create({
    data: {
      sorteadorId: sorteo.sorteadorId,
      sorteoId: sorteo.id,
      totalRecaudado,
      comisionPct,
      montoComision,
      estadoCuenta: "PENDIENTE",
    },
  })

  return cuentaCobro
}

export async function marcarCuentaEnviada(id: string) {
  await prisma.cuentaCobro.update({
    where: { id },
    data: {
      estadoCuenta: "ENVIADA",
      enviadaAt: new Date(),
    },
  })
}
