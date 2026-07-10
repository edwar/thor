import crypto from "node:crypto"
import { prisma } from "@/lib/prisma"

export async function assignRandomPosition(
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  sorteoId: string,
  participanteBonoId: string,
  cantidad: number,
): Promise<number[]> {
  const sorteo = await tx.sorteo.findUnique({
    where: { id: sorteoId },
    select: { rangoPuestosMin: true, rangoPuestosMax: true, totalBonos: true },
  })
  if (!sorteo) throw new Error("Sorteo not found")

  const assigned = await tx.participanteBono.findMany({
    where: { sorteoId, estado: { in: ["ASIGNADO", "ENTREGADO"] } },
    select: { puestos: true },
  })
  const usedSet = new Set<number>()
  for (const p of assigned) {
    for (const puesto of p.puestos) usedSet.add(puesto)
  }

  const { rangoPuestosMin, rangoPuestosMax } = sorteo
  const poolSize = rangoPuestosMax - rangoPuestosMin + 1
  if (usedSet.size + cantidad > poolSize) {
    throw new Error("No hay suficientes puestos disponibles")
  }

  const puestos: number[] = []
  for (let i = 0; i < cantidad; i++) {
    let puesto: number
    let attempts = 0
    do {
      puesto = crypto.randomInt(rangoPuestosMin, rangoPuestosMax + 1)
      attempts++
      if (attempts > poolSize) {
        throw new Error("No se pudo asignar puesto único después de múltiples intentos")
      }
    } while (usedSet.has(puesto))
    usedSet.add(puesto)
    puestos.push(puesto)
  }

  await tx.participanteBono.update({
    where: { id: participanteBonoId },
    data: {
      puestos,
      puestosAsignadosAt: new Date(),
      estado: "ASIGNADO",
    },
  })

  await tx.sorteo.update({
    where: { id: sorteoId },
    data: { bonosVendidos: { increment: cantidad } },
  })

  return puestos
}
