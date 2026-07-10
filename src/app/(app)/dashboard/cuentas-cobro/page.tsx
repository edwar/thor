import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { enviarCuentaCobro } from "@/lib/actions/cuenta-cobro"

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

export default async function CuentasCobroPage() {
  const session = await auth()
  if (!session?.user) redirect("/signin")

  const cuentas = await prisma.cuentaCobro.findMany({
    where: { sorteador: { userId: session.user.id } },
    include: { sorteo: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Cuentas de cobro</h1>
        <p className="mt-1 text-zinc-400">
          Comisión del 1% sobre sorteos finalizados.
        </p>
      </div>

      {cuentas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
          <p className="text-zinc-400">No tienes cuentas de cobro pendientes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cuentas.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-zinc-100">
                    {c.sorteo.titulo}
                  </h3>
                  <span
                    className={`rounded border px-2 py-0.5 text-xs font-medium ${estadoColors[c.estadoCuenta]}`}
                  >
                    {estadoLabels[c.estadoCuenta]}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
                  <span>
                    Recaudado: ${Number(c.totalRecaudado).toLocaleString("es-CO")}
                  </span>
                  <span>
                    Comisión: ${Number(c.montoComision).toLocaleString("es-CO")}
                  </span>
                  <span>
                    {c.createdAt.toLocaleDateString("es-CO")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {c.estadoCuenta === "PENDIENTE" && (
                  <form action={enviarCuentaCobro.bind(null, c.id)}>
                    <button
                      type="submit"
                      className="rounded-lg bg-thor-600 px-3 py-1.5 text-sm text-white transition hover:bg-thor-500"
                    >
                      Enviar
                    </button>
                  </form>
                )}
                <a
                  href={`/dashboard/cuentas-cobro/${c.id}`}
                  className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                >
                  Ver
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
