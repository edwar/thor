import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

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
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="max-w-lg">
          <h1 className="text-3xl font-bold text-stone-800">{producto.titulo}</h1>
          {producto.descripcion && (
            <p className="mt-3 text-stone-500">{producto.descripcion}</p>
          )}

          <p className="mt-6 text-2xl font-bold text-stone-800">
            $ {Number(producto.precio).toLocaleString("es-CO")}
          </p>

          {sorteoActivo && (
            <div className="mt-8 rounded-xl border p-5" style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}>
              <p className="text-sm font-bold uppercase tracking-widest" style={{ color }}>
                Incluye participación en sorteo
              </p>
              <p className="mt-1 font-semibold text-stone-800">{sorteoActivo.titulo}</p>
              <p className="mt-1 text-sm text-stone-500">
                Premio: {sorteoActivo.tipoPremio === "FIJO"
                  ? `$ ${Number(sorteoActivo.premioFijo ?? 0).toLocaleString("es-CO")}`
                  : `${sorteoActivo.porcentajePremio}% del recaudo`}
              </p>
            </div>
          )}

          <div className="mt-10 space-y-4">
            <form className="space-y-4">
              <input
                type="text"
                name="nombre"
                required
                placeholder="Tu nombre completo"
                className="w-full border-b border-stone-300 bg-transparent px-2 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-stone-800"
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Tu correo electrónico"
                className="w-full border-b border-stone-300 bg-transparent px-2 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-stone-800"
              />
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono (opcional)"
                className="w-full border-b border-stone-300 bg-transparent px-2 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-stone-800"
              />
              <button
                type="submit"
                className="w-full py-4 text-lg font-bold text-white transition hover:brightness-110"
                style={{ backgroundColor: color }}
              >
                Comprar — $ {Number(producto.precio).toLocaleString("es-CO")}
              </button>
              <p className="text-center text-sm text-stone-400">
                Paga con PSE, Nequi, Daviplata o tarjeta de crédito
              </p>
            </form>
          </div>

          {(producto.previewUrl ?? producto.archivoUrl) && (
            <div className="mt-12">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-widest">
                Vista previa
              </p>
              {producto.tipo === "IMAGEN" ? (
                <img
                  src={producto.previewUrl ?? producto.archivoUrl}
                  alt={producto.titulo}
                  className="mt-3 max-h-96 rounded-xl object-cover"
                />
              ) : (
                <a
                  href={producto.previewUrl ?? producto.archivoUrl}
                  target="_blank"
                  className="mt-3 inline-block text-sm font-bold text-stone-500 hover:underline"
                >
                  Ver preview →
                </a>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
