import { prisma } from "@/lib/prisma"
import { verifyReveal, computeWinnerIndex } from "@/lib/crypto/raffle-seed"

export async function ejecutarSorteo(id: string) {
  const sorteo = await prisma.sorteo.findUnique({
    where: { id },
    include: {
      participantes: {
        where: { estado: { in: ["ASIGNADO", "ENTREGADO"] } },
        orderBy: { id: "asc" },
      },
      sorteador: true,
    },
  })

  if (!sorteo) throw new Error("Sorteo not found")
  if (sorteo.estado !== "EN_SORTEO") throw new Error("El sorteo no está listo")
  if (!sorteo.commitHash || !sorteo.revealSeed) throw new Error("Commit hash o seed faltante")

  const isValid = verifyReveal(sorteo.revealSeed, sorteo.commitHash)
  if (!isValid) throw new Error("El seed no coincide con el commit hash — posible manipulación")

  const participantes = sorteo.participantes
  if (participantes.length === 0) throw new Error("No hay participantes")

  const puestosSnapshot = participantes.map((p) => ({
    id: p.id,
    puestos: p.puestos,
  }))

  const winnerIndex = computeWinnerIndex(sorteo.revealSeed, puestosSnapshot, participantes.length)
  const ganador = participantes[winnerIndex]

  await prisma.sorteo.update({
    where: { id },
    data: {
      estado: "FINALIZADO",
      ganadorBonoId: ganador.id,
    },
  })

  return {
    ganadorId: ganador.id,
    ganadorNombre: ganador.nombreComprador,
    ganadorPuestos: ganador.puestos,
    totalParticipantes: participantes.length,
    winnerIndex,
    revealSeed: sorteo.revealSeed,
    commitHash: sorteo.commitHash,
    puestosSnapshot,
  }
}
