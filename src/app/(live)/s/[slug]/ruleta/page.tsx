import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { RuletaClientWrapper } from "@/components/ruleta/ruleta-client-wrapper"
import { ClientRouletteWheel } from "@/components/ruleta/client-roulette"
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
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-thor-600/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">{sorteo.titulo}</h1>
        <p className="mt-2 text-muted-foreground">{sorteo.sorteador.nombrePublico}</p>

        {sorteo.estado === "ACTIVO" && (
          <div className="mt-8 space-y-4">
            <p className="text-muted-foreground">
              La venta sigue abierta hasta:
            </p>
            <div className="flex justify-center">
              <Countdown targetDate={sorteo.fechaCierre.toISOString()} />
            </div>
            {isOwner && (
              <form action={cerrarVenta.bind(null, sorteo.id)}>
                <button
                  type="submit"
                  className="rounded-lg bg-thor-600 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-thor-500 active:scale-[0.97]"
                >
                  Cerrar venta y generar commit hash
                </button>
              </form>
            )}
          </div>
        )}

        {sorteo.estado === "EN_SORTEO" && (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Commit hash publicado</p>
              <p className="mt-2 font-mono text-xs text-thor-400 break-all">
                {commitHashHex}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Este hash garantiza que el resultado no fue manipulado.
                El seed se revelará al ejecutar el sorteo.
              </p>
            </div>

            <p className="text-muted-foreground">
              {totalVendidos} participante{totalVendidos !== 1 ? "s" : ""}
            </p>

            <div className="flex justify-center">
              <ClientRouletteWheel
                participants={participants}
                winnerIndex={null}
                spinning={false}
              />
            </div>

            {isOwner && (
              <form action={ejecutarSorteoFormAction.bind(null, sorteo.id)}>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.97]"
                >
                  ¡SORTEAR!
                </button>
              </form>
            )}
          </div>
        )}

        {sorteo.estado === "FINALIZADO" && (
          <RuletaClientWrapper
            participants={participants}
            winnerIndex={winnerIndex}
            ganadorNombre={ganador?.nombreComprador ?? "—"}
            ganadorPuestos={ganador?.puestos.join(" · ") ?? "—"}
            commitHashHex={commitHashHex}
            revealSeed={sorteo.revealSeed}
            totalVendidos={totalVendidos}
          />
        )}
      </div>
    </div>
  )
}
