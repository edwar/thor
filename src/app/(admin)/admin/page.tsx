import { prisma } from "@/lib/prisma"
import { Users, Gift, Ticket, DollarSign, FileText, Percent } from "lucide-react"

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
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de administración</h1>
        <p className="mt-1.5 text-muted-foreground">
          Métricas globales de la plataforma Thor.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5 text-thor-400" />}
          label="Sorteadors"
          value={totalSorteadors}
        />
        <StatCard
          icon={<Gift className="h-5 w-5 text-thor-400" />}
          label="Sorteos totales"
          value={totalSorteos}
        />
        <StatCard
          icon={<Ticket className="h-5 w-5 text-thor-400" />}
          label="Participantes"
          value={totalParticipantes}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5 text-emerald-400" />}
          label="Recaudado"
          value={`$ ${Number(totalRecaudo._sum.monto ?? 0).toLocaleString("es-CO")}`}
        />
        <StatCard
          icon={<FileText className="h-5 w-5 text-amber-accent-400" />}
          label="Cuentas pendientes"
          value={cuentasPendientes}
        />
        <StatCard
          icon={<Percent className="h-5 w-5 text-thor-400" />}
          label="Comisión cobrada"
          value={`$ ${Number(totalComision._sum.montoComision ?? 0).toLocaleString("es-CO")}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-5 font-semibold">Sorteos por estado</h2>
          <div className="space-y-3">
            {sorteosPorEstado.map((se) => (
              <div key={se.estado} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{se.estado}</span>
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      se.estado === "ACTIVO" ? "bg-emerald-400" :
                      se.estado === "FINALIZADO" ? "bg-blue-400" :
                      se.estado === "EN_SORTEO" ? "bg-thor-400" :
                      se.estado === "BORRADOR" ? "bg-zinc-500" :
                      "bg-red-400"
                    }`}
                  />
                  <span className="text-sm font-semibold">{se._count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-5 font-semibold">Últimos sorteos</h2>
          <div className="space-y-3">
            {sorteosRecientes.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{s.titulo}</span>
                  <span className="text-muted-foreground">
                    {s.sorteador.nombrePublico}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {s._count.participantes} bonos
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-thor-700/30 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-thor-600/10 ring-1 ring-thor-600/20">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}
