import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteSorteo } from "@/lib/actions/sorteos"

const estadoLabels: Record<string, string> = {
  BORRADOR: "Borrador",
  ACTIVO: "Activo",
  EN_SORTEO: "En sorteo",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
}

const estadoColors: Record<string, string> = {
  BORRADOR: "text-zinc-400 border-zinc-700",
  ACTIVO: "text-green-400 border-green-800",
  EN_SORTEO: "text-thor-400 border-thor-800",
  FINALIZADO: "text-blue-400 border-blue-800",
  CANCELADO: "text-red-400 border-red-800",
}

export default async function SorteosListPage() {
  const session = await auth()
  const sorteador = await prisma.sorteadorProfile.findUnique({
    where: { userId: session!.user.id },
  })

  const sorteos = sorteador
    ? await prisma.sorteo.findMany({
        where: { sorteadorId: sorteador.id },
        include: { _count: { select: { participantes: true, transacciones: true } } },
        orderBy: { createdAt: "desc" },
      })
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis sorteos</h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona tus sorteos y productos digitales.
          </p>
        </div>
        <Link
          href="/dashboard/sorteos/nuevo"
          className="rounded-lg bg-thor-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-thor-500"
        >
          + Nuevo sorteo
        </Link>
      </div>

      {sorteos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">Aún no tienes sorteos creados.</p>
          <Link
            href="/dashboard/sorteos/nuevo"
            className="mt-3 inline-block text-sm text-thor-400 hover:text-thor-300"
          >
            Crear tu primer sorteo →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {sorteos.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <Link href={`/dashboard/sorteos/${s.id}`} className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground">{s.titulo}</span>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      s.estado === "ACTIVO" ? "bg-green-900/20 text-green-400" :
                      s.estado === "EN_SORTEO" ? "bg-thor-900/20 text-thor-400" :
                      s.estado === "FINALIZADO" ? "bg-blue-900/20 text-blue-400" :
                      s.estado === "CANCELADO" ? "bg-red-900/20 text-red-400" :
                      "bg-muted text-muted-foreground"
                    }`}
                  >
                    {estadoLabels[s.estado]}
                  </span>
                  <span>$ {Number(s.precioBono).toLocaleString("es-CO")}</span>
                  <span>
                    {s._count.participantes} / {s.totalBonos}
                  </span>
                  <span className="hidden sm:inline">
                    {s.fechaSorteo.toLocaleDateString("es-CO")}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href={`/dashboard/sorteos/${s.id}`}
                  className="rounded-md px-2.5 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  Ver
                </Link>
                <Link
                  href={`/dashboard/sorteos/${s.id}/edit`}
                  className="rounded-md px-2.5 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
