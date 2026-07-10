import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { publishSorteo, deleteSorteo } from "@/lib/actions/sorteos"
import { cerrarVenta, ejecutarSorteoFormAction } from "@/lib/actions/sorteo-live"

const estadoLabels: Record<string, string> = {
  BORRADOR: "Borrador",
  ACTIVO: "Activo",
  EN_SORTEO: "En sorteo",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
}

const estadoColors: Record<string, string> = {
  BORRADOR: "bg-zinc-700 text-zinc-200",
  ACTIVO: "bg-green-700 text-green-100",
  EN_SORTEO: "bg-thor-700 text-thor-100",
  FINALIZADO: "bg-blue-700 text-blue-100",
  CANCELADO: "bg-red-700 text-red-100",
}

export default async function SorteoDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect("/signin")

  const sorteo = await prisma.sorteo.findUnique({
    where: { id },
    include: {
      productos: true,
      participantes: { take: 10, orderBy: { createdAt: "desc" } },
      _count: { select: { participantes: true, transacciones: true } },
      sorteador: true,
    },
  })

  if (!sorteo || sorteo.sorteador.userId !== session.user.id) notFound()

  const ganador = sorteo.ganadorBonoId
    ? await prisma.participanteBono.findUnique({ where: { id: sorteo.ganadorBonoId } })
    : null

  const cuentaCobro = await prisma.cuentaCobro.findUnique({
    where: { sorteoId: sorteo.id },
  })

  const totalRecaudo = Number(sorteo.precioBono) * sorteo._count.transacciones

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100">{sorteo.titulo}</h1>
            <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${estadoColors[sorteo.estado]}`}>
              {estadoLabels[sorteo.estado]}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">Slug: /s/{sorteo.slug}</p>
        </div>

        <div className="flex gap-2">
          {sorteo.estado === "BORRADOR" && (
            <>
              <form action={publishSorteo.bind(null, sorteo.id)}>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500"
                >
                  Publicar
                </button>
              </form>
              <Link
                href={`/dashboard/sorteos/${sorteo.id}/edit`}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
              >
                Editar
              </Link>
            </>
          )}
          {sorteo.estado === "ACTIVO" && (
            <>
              <Link
                href={`/s/${sorteo.slug}`}
                className="rounded-lg bg-thor-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-thor-500"
                target="_blank"
              >
                Ver landing
              </Link>
              <Link
                href={`/s/${sorteo.slug}/ruleta`}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
                target="_blank"
              >
                Ruleta en vivo
              </Link>
              <form action={cerrarVenta.bind(null, sorteo.id)}>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500"
                >
                  Cerrar venta
                </button>
              </form>
            </>
          )}
          {sorteo.estado === "EN_SORTEO" && (
            <>
              <Link
                href={`/s/${sorteo.slug}/ruleta`}
                className="rounded-lg bg-thor-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-thor-500"
                target="_blank"
              >
                Ruleta en vivo
              </Link>
              <form action={ejecutarSorteoFormAction.bind(null, sorteo.id)}>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500"
                >
                  ¡Sortear!
                </button>
              </form>
            </>
          )}
          {sorteo.estado === "FINALIZADO" && (
            <>
              <Link
                href={`/s/${sorteo.slug}/ruleta`}
                className="rounded-lg bg-thor-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-thor-500"
                target="_blank"
              >
                Ver resultado
              </Link>
              {cuentaCobro && (
                <Link
                  href={`/dashboard/cuentas-cobro/${cuentaCobro.id}`}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
                >
                  Cuenta de cobro
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Precio bono" value={`$ ${Number(sorteo.precioBono).toLocaleString("es-CO")}`} />
        <StatCard label="Bonos vendidos" value={`${sorteo._count.transacciones} / ${sorteo.totalBonos}`} />
        <StatCard label="Total recaudado" value={`$ ${totalRecaudo.toLocaleString("es-CO")}`} />
        <StatCard
          label="Premio"
          value={
            sorteo.tipoPremio === "FIJO"
              ? `$ ${Number(sorteo.premioFijo ?? 0).toLocaleString("es-CO")}`
              : `${sorteo.porcentajePremio}% del recaudo`
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-3 font-semibold text-zinc-100">Fechas</h2>
          <dl className="space-y-2 text-sm">
            <DateRow label="Inicio venta" date={sorteo.fechaInicio} />
            <DateRow label="Cierre venta" date={sorteo.fechaCierre} />
            <DateRow label="Sorteo en vivo" date={sorteo.fechaSorteo} />
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-3 font-semibold text-zinc-100">Producto digital</h2>
          {sorteo.productos.length > 0 ? (
            <div className="space-y-3">
              {sorteo.productos.map((p) => (
                <div key={p.id} className="text-sm">
                  <p><span className="text-zinc-500">Tipo:</span> <span className="text-zinc-200">{p.tipo}</span></p>
                  <p><span className="text-zinc-500">Título:</span> <span className="text-zinc-200">{p.titulo}</span></p>
                  <p><span className="text-zinc-500">Precio:</span> <span className="text-zinc-200">$ {Number(p.precio).toLocaleString("es-CO")}</span></p>
                  <a
                    href={p.archivoUrl}
                    className="mt-1 inline-block text-thor-400 hover:text-thor-300"
                    target="_blank"
                  >
                    Ver archivo →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Sin productos configurados.</p>
          )}
        </div>
      </div>

      {(sorteo.estado === "EN_SORTEO" || sorteo.estado === "FINALIZADO") && sorteo.commitHash && (
        <div className="rounded-xl border border-thor-800 bg-thor-900/20 p-6">
          <h2 className="font-semibold text-thor-200">Hash de verificación</h2>
          <p className="mt-2 font-mono text-xs text-thor-300 break-all">
            {sorteo.commitHash}
          </p>
          {sorteo.revealSeed && (
            <p className="mt-3">
              <span className="text-sm text-zinc-500">Seed revelado:</span>
              <span className="ml-2 font-mono text-xs text-zinc-400 break-all">
                {sorteo.revealSeed}
              </span>
            </p>
          )}
          <p className="mt-2 text-xs text-zinc-600">
            Puedes verificar: <code className="text-thor-400">sha256(seed) == commitHash</code>
          </p>
        </div>
      )}

      {sorteo.estado === "FINALIZADO" && ganador && (
        <div className="rounded-xl border border-green-800 bg-green-900/20 p-6">
          <h2 className="font-semibold text-green-200">Ganador</h2>
          <p className="mt-2 text-xl font-bold text-green-400">
            {ganador.nombreComprador}
          </p>
          <p className="text-green-300">
            Puesto # {ganador.puestos.join(" · ")}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-100">
            Últimos participantes ({sorteo._count.participantes})
          </h2>
          <span className="text-sm text-zinc-500">Rango de puestos: {sorteo.rangoPuestosMin} – {sorteo.rangoPuestosMax}</span>
        </div>

        {sorteo.participantes.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">Aún no hay participantes.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {sorteo.participantes.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-2">
                <span className="text-sm text-zinc-300">{p.nombreComprador} – {p.emailComprador}</span>
                <span className="text-xs text-zinc-500">
                  {p.puestos.length > 0 ? `Puestos: ${p.puestos.join(", ")}` : "Sin asignar"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-zinc-100">{value}</p>
    </div>
  )
}

function DateRow({ label, date }: { label: string; date: Date }) {
  return (
    <div className="flex justify-between">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-zinc-200">{date.toLocaleString("es-CO")}</dd>
    </div>
  )
}
