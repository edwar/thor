import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params
  const producto = await prisma.productoDigital.findUnique({
    where: { id },
    select: { titulo: true, descripcion: true },
  })
  if (!producto) return {}
  return {
    title: producto.titulo,
    description: producto.descripcion ?? `Compra ${producto.titulo} y participa en sorteos exclusivos`,
  }
}

export default async function ProductoPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  const producto = await prisma.productoDigital.findUnique({
    where: { id },
    include: {
      sorteador: {
        include: {
          sorteos: {
            where: { estado: "ACTIVO" },
            take: 1,
          },
        },
      },
    },
  })

  if (!producto || !producto.activo) notFound()

  const color = producto.sorteador.colorAcento
  const sorteoActivo = producto.sorteador.sorteos[0] ?? null

  return (
    <div className="min-h-screen bg-bone">
      <main className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3 lg:pr-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-bold tracking-wider uppercase text-stone-500">
              Producto digital
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
              {producto.titulo}
            </h1>
            {producto.descripcion && (
              <p className="mt-4 text-base leading-relaxed text-stone-500">
                {producto.descripcion}
              </p>
            )}

            <p className="mt-8 text-3xl font-bold text-stone-800">
              $ {Number(producto.precio).toLocaleString("es-CO")}
            </p>

            {(producto.previewUrl ?? producto.archivoUrl) && (
              <div className="mt-10">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">
                  Vista previa
                </p>
                {producto.tipo === "IMAGEN" ? (
                  <img
                    src={producto.previewUrl ?? producto.archivoUrl}
                    alt={producto.titulo}
                    className="mt-3 max-h-96 rounded-xl object-cover shadow-md"
                  />
                ) : (
                  <a
                    href={producto.previewUrl ?? producto.archivoUrl}
                    target="_blank"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-stone-500 hover:text-stone-700"
                  >
                    Ver preview →
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              <form className="space-y-4">
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Tu nombre completo"
                  className="w-full border-b border-stone-200 bg-transparent px-2 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-stone-800"
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Tu correo electrónico"
                  className="w-full border-b border-stone-200 bg-transparent px-2 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-stone-800"
                />
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono (opcional)"
                  className="w-full border-b border-stone-200 bg-transparent px-2 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-stone-800"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl py-4 text-lg font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ backgroundColor: color }}
                >
                  Comprar — $ {Number(producto.precio).toLocaleString("es-CO")}
                </button>
                <p className="text-center text-xs text-stone-400">
                  Paga con PSE, Nequi, Daviplata o tarjeta de crédito
                </p>
              </form>

              {sorteoActivo && (
                <div
                  className="mt-6 rounded-lg p-4"
                  style={{ backgroundColor: `${color}08`, borderColor: `${color}20`, borderWidth: 1 }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">🎡</span>
                    <div>
                      <p className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color }}>
                        Incluye sorteo
                      </p>
                      <p className="mt-1 text-sm font-semibold text-stone-700">{sorteoActivo.titulo}</p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        Premio: {sorteoActivo.tipoPremio === "FIJO"
                          ? `$ ${Number(sorteoActivo.premioFijo ?? 0).toLocaleString("es-CO")}`
                          : `${sorteoActivo.porcentajePremio}% del recaudo`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
