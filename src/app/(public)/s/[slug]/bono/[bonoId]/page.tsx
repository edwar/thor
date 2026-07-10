import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSignedDownloadUrl } from "@/lib/r2"

export default async function BonoPage(props: { params: Promise<{ slug: string; bonoId: string }> }) {
  const { slug, bonoId } = await props.params

  const bono = await prisma.participanteBono.findUnique({
    where: { id: bonoId },
    include: {
      sorteo: {
        include: { sorteador: true, productos: true },
      },
    },
  })

  if (!bono || bono.sorteo.slug !== slug) notFound()

  const sorteo = bono.sorteo
  const pagoExitoso = bono.estado !== "PENDIENTE"

  let descargaUrl: string | null = null
  const producto = sorteo.productos[0]
  if (producto?.archivoKey) {
    try {
      descargaUrl = await getSignedDownloadUrl(producto.archivoKey)
    } catch {
      descargaUrl = producto.archivoUrl
    }
  }

  const premioDescripcion =
    sorteo.tipoPremio === "FIJO"
      ? `$ ${Number(sorteo.premioFijo ?? 0).toLocaleString("es-CO")}`
      : `${sorteo.porcentajePremio}% del recaudo`

  return (
    <div className="min-h-screen bg-bone px-6 py-16">
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-stone-800">
            {pagoExitoso ? "🎉 ¡Participación confirmada!" : "⏳ Pago pendiente"}
          </h1>

          {pagoExitoso && (
            <div className="mt-8 rounded-2xl border border-thor-800 bg-thor-900/20 p-8">
              <p className="text-sm text-stone-500">Tu puesto(s) asignado(s)</p>
              <p className="mt-2 text-5xl font-bold tracking-widest text-thor-400">
                # {bono.puestos.join(" · ")}
              </p>

              <div className="mt-6 space-y-3 text-left text-sm text-stone-500">
                <p>
                  <span className="text-stone-400">Sorteo:</span>{" "}
                  <span className="text-stone-700">{sorteo.titulo}</span>
                </p>
                <p>
                  <span className="text-stone-400">Organizador:</span>{" "}
                  <span className="text-stone-700">{sorteo.sorteador.nombrePublico}</span>
                </p>
                <p>
                  <span className="text-stone-400">Premio:</span>{" "}
                  <span className="text-stone-700">{premioDescripcion}</span>
                </p>
                <p>
                  <span className="text-stone-400">Sorteo en vivo:</span>{" "}
                  <span className="text-stone-700">
                    {sorteo.fechaSorteo.toLocaleString("es-CO")}
                  </span>
                </p>
              </div>

              {descargaUrl && (
                <a
                  href={descargaUrl}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-thor-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-thor-500"
                >
                  Descargar producto digital
                </a>
              )}
            </div>
          )}

          {!pagoExitoso && (
            <div className="mt-8 rounded-2xl border border-bone-200 bg-bone-100 p-8">
              <p className="text-stone-500">
                Tu pago está siendo procesado. Te notificaremos por email cuando se confirme.
              </p>
              <p className="mt-4 text-sm text-stone-400">
                Referencia: {bono.transaccionId ?? "Generando..."}
              </p>
            </div>
          )}

          <a
            href={`/s/${slug}`}
            className="mt-8 inline-block text-sm text-thor-400 hover:text-thor-300"
          >
            ← Volver al sorteo
          </a>
        </div>
      </div>
    </div>
  )
}
