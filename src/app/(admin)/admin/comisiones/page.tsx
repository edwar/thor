import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { marcarComisionPagada, marcarComisionPendiente } from "@/lib/actions/admin"
import { enviarCuentaCobro } from "@/lib/actions/cuenta-cobro"

const estadoLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ENVIADA: "Enviada",
  PAGADA: "Pagada",
  VENCIDA: "Vencida",
  RECHAZADA: "Rechazada",
}

const estadoStyles: Record<string, string> = {
  PENDIENTE: "border-amber-accent-700 text-amber-accent-400 bg-amber-accent-500/10",
  ENVIADA: "border-blue-700 text-blue-400 bg-blue-500/10",
  PAGADA: "border-emerald-700 text-emerald-400 bg-emerald-500/10",
  VENCIDA: "border-red-700 text-red-400 bg-red-500/10",
  RECHAZADA: "border-red-700 text-red-400 bg-red-500/10",
}

export default async function AdminComisionesPage() {
  const session = await auth()
  if (!session?.user) redirect("/signin")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const comisiones = await prisma.cuentaCobro.findMany({
    include: {
      sorteo: { select: { titulo: true } },
      sorteador: { select: { nombrePublico: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const totalPendiente = comisiones
    .filter((c) => c.estadoCuenta !== "PAGADA")
    .reduce((sum, c) => sum + Number(c.montoComision), 0)

  const totalCobrado = comisiones
    .filter((c) => c.estadoCuenta === "PAGADA")
    .reduce((sum, c) => sum + Number(c.montoComision), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cobrar comisiones</h1>
        <p className="mt-1 text-muted-foreground">
          Comisiones del 1 % sobre sorteos finalizados.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-accent-800/30 bg-amber-accent-900/10 p-5">
          <p className="text-sm text-amber-accent-300/70">Pendiente por cobrar</p>
          <p className="mt-1 text-2xl font-bold text-amber-accent-300">
            $ {totalPendiente.toLocaleString("es-CO")}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-800/30 bg-emerald-900/10 p-5">
          <p className="text-sm text-emerald-300/70">Total cobrado</p>
          <p className="mt-1 text-2xl font-bold text-emerald-300">
            $ {totalCobrado.toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Sorteo</th>
              <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Sorteador</th>
              <th className="px-4 py-3.5 text-right font-medium text-muted-foreground">Recaudado</th>
              <th className="px-4 py-3.5 text-right font-medium text-muted-foreground">Comisión</th>
              <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Fecha</th>
              <th className="px-4 py-3.5 text-center font-medium text-muted-foreground">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {comisiones.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{c.sorteo.titulo}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.sorteador.nombrePublico}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  $ {Number(c.totalRecaudado).toLocaleString("es-CO")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                  $ {Number(c.montoComision).toLocaleString("es-CO")}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${estadoStyles[c.estadoCuenta]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      c.estadoCuenta === "PENDIENTE" ? "bg-amber-accent-400" :
                      c.estadoCuenta === "ENVIADA" ? "bg-blue-400" :
                      c.estadoCuenta === "PAGADA" ? "bg-emerald-400" : "bg-red-400"
                    }`} />
                    {estadoLabels[c.estadoCuenta]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.createdAt.toLocaleDateString("es-CO")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    {c.estadoCuenta !== "PAGADA" && (
                      <form action={enviarCuentaCobro.bind(null, c.id)}>
                        <button
                          type="submit"
                          className="rounded-lg bg-thor-600 px-3 py-1.5 text-xs text-white transition hover:bg-thor-500"
                        >
                          Enviar correo
                        </button>
                      </form>
                    )}
                    {c.estadoCuenta !== "PAGADA" ? (
                      <form action={marcarComisionPagada.bind(null, c.id)}>
                        <button
                          type="submit"
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white transition hover:bg-green-500"
                        >
                          Pagada
                        </button>
                      </form>
                    ) : (
                      <form action={marcarComisionPendiente.bind(null, c.id)}>
                        <button
                          type="submit"
                          className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-600"
                        >
                          Reabrir
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {comisiones.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No hay comisiones registradas.
          </p>
        )}
      </div>
    </div>
  )
}
