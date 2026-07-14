import { prisma } from "@/lib/prisma"

const estadoLabels: Record<string, string> = {
  BORRADOR: "Borrador",
  ACTIVO: "Activo",
  EN_SORTEO: "En sorteo",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
}

const estadoStyles: Record<string, string> = {
  BORRADOR: "border-zinc-700 text-zinc-400",
  ACTIVO: "border-emerald-700 text-emerald-400 bg-emerald-500/10",
  EN_SORTEO: "border-thor-700 text-thor-400 bg-thor-500/10",
  FINALIZADO: "border-blue-700 text-blue-400 bg-blue-500/10",
  CANCELADO: "border-red-700 text-red-400 bg-red-500/10",
}

export default async function AdminSorteosPage() {
  const sorteos = await prisma.sorteo.findMany({
    include: {
      sorteador: true,
      _count: { select: { participantes: true, transacciones: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Todos los sorteos</h1>
        <p className="mt-1 text-muted-foreground">Administra todos los sorteos de la plataforma.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Título</th>
              <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Sorteador</th>
              <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3.5 text-right font-medium text-muted-foreground">Bonos</th>
              <th className="px-4 py-3.5 text-right font-medium text-muted-foreground">Precio</th>
              <th className="px-4 py-3.5 text-right font-medium text-muted-foreground">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorteos.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{s.titulo}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.sorteador.nombrePublico}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${estadoStyles[s.estado]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      s.estado === "ACTIVO" ? "bg-emerald-400" :
                      s.estado === "FINALIZADO" ? "bg-blue-400" :
                      s.estado === "EN_SORTEO" ? "bg-thor-400" : "bg-zinc-500"
                    }`} />
                    {estadoLabels[s.estado]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {s._count.participantes} / {s.totalBonos}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  $ {Number(s.precioBono).toLocaleString("es-CO")}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                  {s.createdAt.toLocaleDateString("es-CO")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
