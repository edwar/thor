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
        <h1 className="text-2xl font-bold text-foreground">Comisiones</h1>
        <p className="mt-1 text-muted-foreground">
          Comisión del 1% sobre sorteos finalizados. Este es el monto que debes pagar a Thor.
        </p>
      </div>

      {cuentas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-sm font-medium text-muted-foreground">No tienes comisiones pendientes.</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Las comisiones aparecerán aquí cuando finalices un sorteo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cuentas.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-5"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-foreground">
                    {c.sorteo.titulo}
                  </h3>
                  <span
                    className={`rounded border px-2 py-0.5 text-xs font-medium ${estadoColors[c.estadoCuenta]}`}
                  >
                    {estadoLabels[c.estadoCuenta]}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
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
                      Descargar factura
                    </button>
                  </form>
                )}
                <a
                  href={`/dashboard/cuentas-cobro/${c.id}`}
                  className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
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
