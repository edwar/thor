import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { RouletteWheel } from "@/components/ruleta/roulette-wheel"
import { cerrarVenta, ejecutarSorteoFormAction } from "@/lib/actions/sorteo-live"
import { Countdown } from "@/components/sorteos/countdown"

export default async function RuletaPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const session = await auth()

  const sorteo = await prisma.sorteo.findUnique({
    where: { slug },
    include: {
      sorteador: true,
      participantes: {
        where: { estado: { in: ["ASIGNADO", "ENTREGADO"] } },
        orderBy: { id: "asc" },
      },
    },
  })

  if (!sorteo || sorteo.estado === "BORRADOR") notFound()

  const ganador = sorteo.ganadorBonoId
    ? await prisma.participanteBono.findUnique({ where: { id: sorteo.ganadorBonoId } })
    : null

  const isOwner = session?.user && sorteo.sorteador.userId === session.user.id
  const totalVendidos = sorteo.participantes.length
  const commitHashHex = sorteo.commitHash ?? ""

  const participants = sorteo.participantes.map((p) => ({
    id: p.id,
    nombre: p.nombreComprador,
    puestos: p.puestos,
  }))

  const winnerIndex = ganador
    ? sorteo.participantes.findIndex((p) => p.id === ganador.id)
    : null

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-zinc-100">{sorteo.titulo}</h1>
        <p className="mt-2 text-zinc-400">{sorteo.sorteador.nombrePublico}</p>

        {sorteo.estado === "ACTIVO" && (
          <div className="mt-8 space-y-4">
            <p className="text-zinc-500">
              La venta sigue abierta hasta:
            </p>
            <div className="flex justify-center">
              <Countdown targetDate={sorteo.fechaCierre.toISOString()} />
            </div>
            {isOwner && (
              <form action={cerrarVenta.bind(null, sorteo.id)}>
                <button
                  type="submit"
                  className="rounded-lg bg-thor-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-thor-500"
                >
                  Cerrar venta y generar commit hash
                </button>
              </form>
            )}
          </div>
        )}

        {sorteo.estado === "EN_SORTEO" && (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-thor-800 bg-thor-900/20 p-6">
              <p className="text-sm text-zinc-400">Commit hash publicado</p>
              <p className="mt-2 font-mono text-xs text-thor-300 break-all">
                {commitHashHex}
              </p>
              <p className="mt-2 text-xs text-zinc-600">
                Este hash garantiza que el resultado no fue manipulado.
                El seed se revelará al ejecutar el sorteo.
              </p>
            </div>

            <p className="text-zinc-400">
              {totalVendidos} participante{totalVendidos !== 1 ? "s" : ""}
            </p>

            <div className="flex justify-center">
              <RouletteWheel
                participants={participants}
                winnerIndex={null}
                spinning={false}
              />
            </div>

            {isOwner && (
              <form action={ejecutarSorteoFormAction.bind(null, sorteo.id)}>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-500"
                >
                  ¡SORTEAR!
                </button>
              </form>
            )}
          </div>
        )}

        {sorteo.estado === "FINALIZADO" && (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-green-800 bg-green-900/20 p-6">
              <p className="text-sm text-zinc-400">Ganador</p>
              <p className="mt-2 text-3xl font-bold text-green-400">
                {ganador?.nombreComprador ?? "—"}
              </p>
              <p className="mt-1 text-lg text-green-300">
                Puesto # {ganador?.puestos.join(" · ") ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-left">
              <p className="text-sm font-medium text-zinc-500">Verificación del sorteo</p>

              <div className="mt-4 space-y-3 text-xs text-zinc-400">
                <p>
                  <span className="text-zinc-500">Commit hash:</span>
                  <br />
                  <span className="font-mono break-all">{commitHashHex}</span>
                </p>
                <p>
                  <span className="text-zinc-500">Seed revelado:</span>
                  <br />
                  <span className="font-mono break-all">{sorteo.revealSeed ?? "—"}</span>
                </p>
                <p>
                  <span className="text-zinc-500">Total participantes:</span>{" "}
                  {totalVendidos}
                </p>
              </div>

              <p className="mt-4 text-xs text-zinc-600">
                Puedes verificar el resultado:{" "}
                <code className="text-thor-400">sha256(seed) == commitHash</code>
              </p>
            </div>

            <div className="flex justify-center">
              <RouletteWheel
                participants={participants}
                winnerIndex={winnerIndex}
                spinning={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
