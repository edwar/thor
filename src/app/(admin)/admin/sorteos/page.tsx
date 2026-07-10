import { prisma } from "@/lib/prisma"

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
        <h1 className="text-2xl font-bold text-zinc-100">Todos los sorteos</h1>
        <p className="mt-1 text-zinc-400">Administra todos los sorteos de la plataforma.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Título</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Sorteador</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Estado</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">Bonos</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">Precio</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sorteos.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-900/30">
                <td className="px-4 py-3 text-zinc-200 font-medium">{s.titulo}</td>
                <td className="px-4 py-3 text-zinc-400">{s.sorteador.nombrePublico}</td>
                <td className="px-4 py-3">
                  <span className={`rounded border px-2 py-0.5 text-xs font-medium ${estadoColors[s.estado]}`}>
                    {estadoLabels[s.estado]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-zinc-300">
                  {s._count.participantes} / {s.totalBonos}
                </td>
                <td className="px-4 py-3 text-right text-zinc-300">
                  $ {Number(s.precioBono).toLocaleString("es-CO")}
                </td>
                <td className="px-4 py-3 text-right text-zinc-500">
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
