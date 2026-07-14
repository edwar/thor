import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { getSignedDownloadUrl } from "@/lib/r2"

export async function generateMetadata(props: { params: Promise<{ slug: string; bonoId: string }> }): Promise<Metadata> {
  const { slug, bonoId } = await props.params
  const bono = await prisma.participanteBono.findUnique({
    where: { id: bonoId },
    select: { sorteo: { select: { titulo: true } } },
  })
  if (!bono) return {}
  return {
    title: `Compra confirmada — ${bono.sorteo.titulo}`,
  }
}

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
          {pagoExitoso ? (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-stone-800">
                ¡Participación confirmada!
              </h1>
            </>
          ) : (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-stone-800">
                Pago pendiente
              </h1>
            </>
          )}

          {pagoExitoso && (
            <div className="mt-8 rounded-2xl border bg-white p-8 shadow-sm" style={{ borderColor: "#1a7a9e20" }}>
              <p className="text-sm text-stone-500">Tu puesto(s) asignado(s)</p>
              <p className="mt-2 bg-gradient-to-r from-thor-600 to-thor-400 bg-clip-text text-5xl font-bold tracking-widest text-transparent">
                # {bono.puestos.join(" · ")}
              </p>

              <div className="mt-8 space-y-3 text-left text-sm text-stone-500">
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-400">Sorteo</span>
                  <span className="font-medium text-stone-700">{sorteo.titulo}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-400">Organizador</span>
                  <span className="font-medium text-stone-700">{sorteo.sorteador.nombrePublico}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-400">Premio</span>
                  <span className="font-medium text-stone-700">{premioDescripcion}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-400">Sorteo en vivo</span>
                  <span className="font-medium text-stone-700">
                    {sorteo.fechaSorteo.toLocaleString("es-CO")}
                  </span>
                </div>
              </div>

              {descargaUrl && (
                <a
                  href={descargaUrl}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-thor-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-thor-500 active:scale-[0.97]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar producto digital
                </a>
              )}
            </div>
          )}

          {!pagoExitoso && (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-8">
              <p className="text-stone-600">
                Tu pago está siendo procesado. Te notificaremos por email cuando se confirme.
              </p>
              <p className="mt-4 text-sm text-stone-400">
                Referencia: {bono.transaccionId ?? "Generando..."}
              </p>
            </div>
          )}

          <a
            href={`/s/${slug}`}
            className="mt-8 inline-flex items-center gap-1 text-sm text-thor-600 hover:text-thor-500"
          >
            ← Volver al sorteo
          </a>
        </div>
      </div>
    </div>
  )
}
