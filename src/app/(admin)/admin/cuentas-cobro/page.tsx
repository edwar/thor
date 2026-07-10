import { prisma } from "@/lib/prisma"

const estadoLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ENVIADA: "Enviada",
  PAGADA: "Pagada",
  VENCIDA: "Vencida",
  RECHAZADA: "Rechazada",
}

const estadoColors: Record<string, string> = {
  PENDIENTE: "text-amber-400 border-amber-800",
  ENVIADA: "text-blue-400 border-blue-800",
  PAGADA: "text-green-400 border-green-800",
  VENCIDA: "text-red-400 border-red-800",
  RECHAZADA: "text-red-400 border-red-800",
}

export default async function AdminCuentasCobroPage() {
  const cuentas = await prisma.cuentaCobro.findMany({
    include: {
      sorteo: true,
      sorteador: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const totalPendiente = cuentas
    .filter((c) => c.estadoCuenta === "PENDIENTE" || c.estadoCuenta === "ENVIADA")
    .reduce((sum, c) => sum + Number(c.montoComision), 0)

  const totalCobrado = cuentas
    .filter((c) => c.estadoCuenta === "PAGADA")
    .reduce((sum, c) => sum + Number(c.montoComision), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Cuentas de cobro</h1>
        <p className="mt-1 text-zinc-400">
          Comisiones del 1% sobre sorteos finalizados.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-800 bg-amber-900/10 p-5">
          <p className="text-sm text-amber-300/70">Pendiente por cobrar</p>
          <p className="mt-1 text-2xl font-bold text-amber-300">
            $ {totalPendiente.toLocaleString("es-CO")}
          </p>
        </div>
        <div className="rounded-xl border border-green-800 bg-green-900/10 p-5">
          <p className="text-sm text-green-300/70">Total cobrado</p>
          <p className="mt-1 text-2xl font-bold text-green-300">
            $ {totalCobrado.toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Sorteo</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Sorteador</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">Recaudado</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">Comisión</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {cuentas.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-900/30">
                <td className="px-4 py-3 text-zinc-200 font-medium">{c.sorteo.titulo}</td>
                <td className="px-4 py-3 text-zinc-400">{c.sorteador.nombrePublico}</td>
                <td className="px-4 py-3 text-right text-zinc-300">
                  $ {Number(c.totalRecaudado).toLocaleString("es-CO")}
                </td>
                <td className="px-4 py-3 text-right text-zinc-300">
                  $ {Number(c.montoComision).toLocaleString("es-CO")}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded border px-2 py-0.5 text-xs font-medium ${estadoColors[c.estadoCuenta]}`}>
                    {estadoLabels[c.estadoCuenta]}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {c.createdAt.toLocaleDateString("es-CO")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cuentas.length === 0 && (
          <p className="p-6 text-center text-sm text-zinc-500">
            No hay cuentas de cobro registradas.
          </p>
        )}
      </div>
    </div>
  )
}
