import { prisma } from "@/lib/prisma"

export default async function AdminDashboardPage() {
  const [
    totalSorteos,
    totalSorteadors,
    totalParticipantes,
    totalRecaudo,
    cuentasPendientes,
    totalComision,
  ] = await Promise.all([
    prisma.sorteo.count(),
    prisma.sorteadorProfile.count(),
    prisma.participanteBono.count(),
    prisma.transaccionPasarela.aggregate({
      _sum: { monto: true },
      where: { estado: "APROBADA" },
    }),
    prisma.cuentaCobro.count({ where: { estadoCuenta: { in: ["PENDIENTE", "ENVIADA"] } } }),
    prisma.cuentaCobro.aggregate({
      _sum: { montoComision: true },
      where: { estadoCuenta: "PAGADA" },
    }),
  ])

  const sorteosPorEstado = await prisma.sorteo.groupBy({
    by: ["estado"],
    _count: true,
  })

  const sorteosRecientes = await prisma.sorteo.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { sorteador: true, _count: { select: { participantes: true } } },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Panel de administración</h1>
        <p className="mt-1 text-zinc-400">
          Métricas globales de la plataforma Thor.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Sorteadors"
          value={totalSorteadors}
        />
        <StatCard
          label="Sorteos totales"
          value={totalSorteos}
        />
        <StatCard
          label="Participantes"
          value={totalParticipantes}
        />
        <StatCard
          label="Recaudado"
          value={`$ ${Number(totalRecaudo._sum.monto ?? 0).toLocaleString("es-CO")}`}
        />
        <StatCard
          label="Cuentas de cobro pendientes"
          value={cuentasPendientes}
        />
        <StatCard
          label="Comisión cobrada"
          value={`$ ${Number(totalComision._sum.montoComision ?? 0).toLocaleString("es-CO")}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 font-semibold text-zinc-100">Sorteos por estado</h2>
          <div className="space-y-3">
            {sorteosPorEstado.map((se) => (
              <div key={se.estado} className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{se.estado}</span>
                <span className="text-sm font-semibold text-zinc-200">{se._count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 font-semibold text-zinc-100">Últimos sorteos</h2>
          <div className="space-y-3">
            {sorteosRecientes.map((s) => (
              <div key={s.id} className="text-sm">
                <span className="text-zinc-200">{s.titulo}</span>
                <span className="ml-2 text-zinc-500">
                  {s.sorteador.nombrePublico}
                </span>
                <span className="ml-2 text-zinc-600">
                  ({s._count.participantes} bonos)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-100">{value}</p>
    </div>
  )
}
