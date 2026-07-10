import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { enviarCuentaCobro, marcarCuentaPagada } from "@/lib/actions/cuenta-cobro"
import { renderCuentaCobroHTML } from "@/lib/pdf/cuenta-cobro"

const estadoLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ENVIADA: "Enviada",
  PAGADA: "Pagada",
  VENCIDA: "Vencida",
  RECHAZADA: "Rechazada",
}

const estadoColors: Record<string, string> = {
  PENDIENTE: "text-amber-400 border-amber-800 bg-amber-900/10",
  ENVIADA: "text-blue-400 border-blue-800 bg-blue-900/10",
  PAGADA: "text-green-400 border-green-800 bg-green-900/10",
  VENCIDA: "text-red-400 border-red-800 bg-red-900/10",
  RECHAZADA: "text-red-400 border-red-800 bg-red-900/10",
}

export default async function CuentaCobroDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect("/signin")

  const cuenta = await prisma.cuentaCobro.findUnique({
    where: { id },
    include: {
      sorteo: { include: { sorteador: true } },
      sorteador: { include: { user: true } },
    },
  })

  if (!cuenta || cuenta.sorteador.userId !== session.user.id) notFound()

  const html = renderCuentaCobroHTML({
    nombreOrganizador: cuenta.sorteador.nombrePublico,
    slug: cuenta.sorteador.slug,
    tituloSorteo: cuenta.sorteo.titulo,
    totalRecaudado: String(cuenta.totalRecaudado),
    comisionPct: String(Number(cuenta.comisionPct) * 100),
    montoComision: String(cuenta.montoComision),
    totalBonosVendidos: cuenta.sorteo.bonosVendidos,
    fechaSorteo: cuenta.sorteo.fechaSorteo.toLocaleDateString("es-CO"),
    fechaEmision: cuenta.createdAt.toLocaleDateString("es-CO"),
    referencia: `CC-${cuenta.id.slice(0, 8)}`,
  })

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100">Cuenta de cobro</h1>
            <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${estadoColors[cuenta.estadoCuenta].split(" ")[0]} ${estadoColors[cuenta.estadoCuenta].split(" ")[1]}`}>
              {estadoLabels[cuenta.estadoCuenta]}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Sorteo: {cuenta.sorteo.titulo}
          </p>
        </div>

        <div className="flex gap-2">
          {cuenta.estadoCuenta === "PENDIENTE" && (
            <form action={enviarCuentaCobro.bind(null, cuenta.id)}>
              <button
                type="submit"
                className="rounded-lg bg-thor-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-thor-500"
              >
                Enviar al sorteador
              </button>
            </form>
          )}
          {cuenta.estadoCuenta === "ENVIADA" && (
            <form action={marcarCuentaPagada.bind(null, cuenta.id)}>
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500"
              >
                Marcar como pagada
              </button>
            </form>
          )}
        </div>
      </div>

      <div
        className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8"
        dangerouslySetInnerHTML={{
          __html: html.replace(/^[\s\S]*<body>/, "").replace(/<\/body>[\s\S]*$/, ""),
        }}
      />

      {cuenta.estadoCuenta === "PAGADA" && (
        <div className="rounded-xl border border-green-800 bg-green-900/20 p-6 text-center">
          <p className="text-lg font-semibold text-green-400">
            ✓ Pagada el {cuenta.pagadaAt?.toLocaleDateString("es-CO") ?? "—"}
          </p>
        </div>
      )}
    </div>
  )
}
