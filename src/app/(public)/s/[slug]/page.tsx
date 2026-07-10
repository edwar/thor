import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Countdown } from "@/components/sorteos/countdown"
import { initCheckout } from "@/lib/actions/checkout"
import { PortalPublicPage } from "@/components/portal-public-page"
import { textColorForBg } from "@/lib/color"

export default async function PublicSorteoOrPortalPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  const sorteador = await prisma.sorteadorProfile.findUnique({
    where: { slug },
    include: {
      _count: { select: { sorteos: true } },
    },
  })

  if (sorteador) {
    return <PortalPublicPage slug={slug} />
  }

  const sorteo = await prisma.sorteo.findUnique({
    where: { slug },
    include: {
      productos: true,
      sorteador: true,
      _count: { select: { participantes: true } },
    },
  })

  if (!sorteo || sorteo.estado === "BORRADOR") notFound()

  const color = sorteo.sorteador.colorAcento
  const withBanner = !!sorteo.sorteador.bannerUrl
  const tc = withBanner ? (textColorForBg(color) === "white" ? "#fff" : "#000") : undefined
  const producto = sorteo.productos[0]
  const precioFormatted = Number(sorteo.precioBono).toLocaleString("es-CO")
  const totalRecaudo = Number(sorteo.precioBono) * sorteo._count.participantes

  return (
    <div className="min-h-screen bg-bone">
      {sorteo.sorteador.bannerUrl ? (
        <div className="fixed inset-0 overflow-hidden">
          <img
            src={sorteo.sorteador.bannerUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: `${color}B3` }} />
        </div>
      ) : (
        <div className="h-2 w-full" style={{ backgroundColor: color }} />
      )}

      <div className="relative z-10" style={{ color: tc }}>
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {sorteo.sorteador.logoUrl && (
              <img
                src={sorteo.sorteador.logoUrl}
                alt={sorteo.sorteador.nombrePublico}
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm font-medium opacity-80">
              {sorteo.sorteador.nombrePublico}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 pb-24 pt-8">
        <div className="text-center">
          <p className="text-sm font-bold tracking-widest uppercase opacity-90">
            Sorteo en vivo
          </p>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {sorteo.titulo}
          </h1>

          {sorteo.descripcion && (
            <p className="mx-auto mt-4 max-w-2xl text-lg opacity-70">
              {sorteo.descripcion}
            </p>
          )}
        </div>

        <div className="mt-16 flex justify-center">
          <div className="text-center">
            <p className="mb-4 text-sm font-bold tracking-widest uppercase opacity-90">
              {sorteo.estado === "ACTIVO" ? "Cierre de venta" : "Sorteo finalizado"}
            </p>
            <Countdown targetDate={sorteo.fechaCierre.toISOString()} />
          </div>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest opacity-90">
              Premio
            </p>
            {sorteo.tipoPremio === "FIJO" ? (
              <p className="mt-2 text-4xl font-bold">
                $ {Number(sorteo.premioFijo ?? 0).toLocaleString("es-CO")}
              </p>
            ) : (
              <div>
                <p className="mt-2 text-4xl font-bold">
                  {sorteo.porcentajePremio}%
                </p>
                <p className="mt-1 text-sm opacity-70">
                  del recaudo total ≈ $ {totalRecaudo.toLocaleString("es-CO")}
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest opacity-90">
              Bonos vendidos
            </p>
            <p className="mt-2 text-4xl font-bold">
              {sorteo._count.participantes} / {sorteo.totalBonos}
            </p>
          </div>
        </div>

        {producto && (
          <div className="mt-8 text-center">
            <p className="text-sm font-bold uppercase tracking-widest opacity-90">
              Producto digital incluido
            </p>
            <p className="mt-2 text-xl font-bold">
              {producto.titulo}
            </p>
            <p className="mt-1 text-sm opacity-70">
              Tipo: {producto.tipo}
            </p>
            {(producto.previewUrl ?? producto.archivoUrl) && (
              <a
                href={producto.previewUrl ?? producto.archivoUrl}
                target="_blank"
                className="mt-3 inline-block text-sm font-bold hover:underline"
              >
                Ver preview →
              </a>
            )}
          </div>
        )}

        {sorteo.estado === "ACTIVO" && (
          <div className="mt-12">
            <form
              action={initCheckout.bind(null, sorteo.id)}
              className="mx-auto max-w-sm space-y-4"
            >
              <input
                type="text"
                name="nombre"
                required
                placeholder="Tu nombre completo"
                className="w-full border-b bg-transparent px-2 py-3 text-sm placeholder:opacity-50 outline-none"
                style={{ borderColor: `${tc}4D`, color: tc }}
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Tu correo electrónico"
                className="w-full border-b bg-transparent px-2 py-3 text-sm placeholder:opacity-50 outline-none"
                style={{ borderColor: `${tc}4D`, color: tc }}
              />
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono (opcional)"
                className="w-full border-b bg-transparent px-2 py-3 text-sm placeholder:opacity-50 outline-none"
                style={{ borderColor: `${tc}4D`, color: tc }}
              />
              <button
                type="submit"
                className="w-full py-4 text-lg font-bold text-white transition hover:brightness-110"
                style={{ backgroundColor: color }}
              >
                Comprar bono — $ {precioFormatted}
              </button>
              <p className="text-center text-sm" style={{ color: `${tc}80` }}>
                Paga con PSE, Nequi, Daviplata o tarjeta de crédito
              </p>
            </form>
          </div>
        )}
        </main>
      </div>
    </div>
  )
}
