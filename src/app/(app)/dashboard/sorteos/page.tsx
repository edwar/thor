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
          <h1 className="text-2xl font-bold text-zinc-100">Mis sorteos</h1>
          <p className="mt-1 text-zinc-400">
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
        <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
          <p className="text-zinc-400">Aún no tienes sorteos creados.</p>
          <Link
            href="/dashboard/sorteos/nuevo"
            className="mt-3 inline-block text-sm text-thor-400 hover:text-thor-300"
          >
            Crear tu primer sorteo →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sorteos.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700"
            >
              <Link href={`/dashboard/sorteos/${s.id}`} className="flex-1">
                <h3 className="font-semibold text-zinc-100">{s.titulo}</h3>
                <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
                  <span
                    className={`rounded border px-2 py-0.5 text-xs font-medium ${estadoColors[s.estado]}`}
                  >
                    {estadoLabels[s.estado]}
                  </span>
                  <span>$ {Number(s.precioBono).toLocaleString("es-CO")}</span>
                  <span>
                    {s._count.participantes} / {s.totalBonos} bonos
                  </span>
                  <span>
                    {s.fechaSorteo.toLocaleDateString("es-CO")}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/sorteos/${s.id}`}
                  className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                >
                  Ver
                </Link>
                <Link
                  href={`/dashboard/sorteos/${s.id}/edit`}
                  className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
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
